import { executeTool, fleetTools } from './mcpServer.js';

/**
 * Agentic loop for fleet queries
 * Uses intent detection to decide which tools to call,
 * then executes tools and formats responses
 */

// Intent patterns mapped to tools
const intentPatterns = [
  {
    patterns: [/how many.*delivered|delivered.*count|total.*delivered/i],
    tools: ['get_delivery_stats'],
    formatter: (results) => {
      const stats = results[0];
      return `${stats.delivered_orders} out of ${stats.total_orders} orders have been delivered (${stats.completion_rate} completion rate).`;
    }
  },
  {
    patterns: [/active.*driver|driver.*active|how many.*driver/i],
    tools: ['get_delivery_stats'],
    formatter: (results) => {
      const stats = results[0];
      return `Currently ${stats.active_drivers} drivers are active out of ${stats.total_drivers} total drivers.`;
    }
  },
  {
    patterns: [/driver.*deliver|what.*driver|delivering|current.*task/i],
    tools: ['get_drivers'],
    formatter: (results) => {
      const drivers = results[0].filter(d => d.assigned_order !== 'none');
      if (drivers.length === 0) return 'No drivers currently have assigned deliveries.';
      return drivers
        .map(d => `${d.name} is delivering ${d.assigned_order}`)
        .join('\n');
    }
  },
  {
    patterns: [/idle.*driver|waiting|not.*assigned/i],
    tools: ['get_drivers'],
    formatter: (results) => {
      const drivers = results[0].filter(d => d.assigned_order === 'none' && d.status === 'idle');
      if (drivers.length === 0) return 'No idle drivers available.';
      return `${drivers.length} drivers are idle and waiting for orders: ${drivers.map(d => d.name).join(', ')}.`;
    }
  },
  {
    patterns: [/closest.*driver|nearest.*driver|which.*driver.*closest/i],
    tools: ['find_closest_driver'],
    needsExtraction: 'order_code',
    formatter: (results) => {
      const result = results[0];
      return `${result.closest_driver} (${result.driver_vehicle}) is the closest driver, approximately ${result.distance_km} km away.`;
    }
  },
  {
    patterns: [/delayed|pending|stuck|not.*progress/i],
    tools: ['get_delayed_orders'],
    formatter: (results) => {
      const data = results[0];
      if (data.count === 0) return 'No delayed orders. Everything is on track!';
      return `${data.count} delayed/in-progress orders:\n${data.orders.map(o => `- ${o.code} (${o.customer}): ${o.status}`).join('\n')}`;
    }
  },
  {
    patterns: [/history|activity|what.*happen|recent.*event|timeline/i],
    tools: ['get_driver_history'],
    needsExtraction: 'driver_id',
    formatter: (results) => {
      const data = results[0];
      return `Recent activity for ${data.driver_name}:\n${data.recent_activity.map(a => `[${a.timestamp}] ${a.event_type}: ${a.details}`).join('\n')}`;
    }
  },
  {
    patterns: [/order.*detail|info.*order|order.*status|tell.*about.*order/i],
    tools: ['get_order_details'],
    needsExtraction: 'order_code',
    formatter: (results) => {
      const order = results[0];
      return `Order ${order.code} for ${order.customer}:\nStatus: ${order.status}\nAssigned to: ${order.assigned_driver?.name || 'unassigned'}\nPickup: (${order.pickup_location.lat.toFixed(4)}, ${order.pickup_location.lng.toFixed(4)})\nDelivery: (${order.delivery_location.lat.toFixed(4)}, ${order.delivery_location.lng.toFixed(4)})`;
    }
  },
  {
    patterns: [/pending.*order|orders.*waiting|unassigned/i],
    tools: ['get_orders'],
    formatter: (results) => {
      const pending = results[0].filter(o => o.assigned_driver === 'unassigned');
      if (pending.length === 0) return 'All orders are assigned. No pending orders.';
      return `${pending.length} pending orders waiting for drivers:\n${pending.map(o => `- ${o.code} for ${o.customer}`).join('\n')}`;
    }
  },
  {
    patterns: [/all.*order|list.*order|show.*order/i],
    tools: ['get_orders'],
    formatter: (results) => {
      const orders = results[0];
      return `Total ${orders.length} orders:\n${orders.map(o => `- ${o.code} (${o.customer}): ${o.status}`).join('\n')}`;
    }
  },
  {
    patterns: [/all.*driver|list.*driver|show.*driver|fleet.*status/i],
    tools: ['get_drivers'],
    formatter: (results) => {
      const drivers = results[0];
      return `Fleet has ${drivers.length} drivers:\n${drivers.map(d => `- ${d.name} (${d.vehicle}): ${d.phase}`).join('\n')}`;
    }
  },
  {
    patterns: [/search|find|look/i],
    tools: ['search_fleet_data'],
    needsExtraction: 'query',
    formatter: (results) => {
      const data = results[0];
      let output = 'Search results:\n';
      if (data.drivers.length > 0) {
        output += `Drivers: ${data.drivers.map(d => `${d.name} (${d.vehicle})`).join(', ')}\n`;
      }
      if (data.orders.length > 0) {
        output += `Orders: ${data.orders.map(o => `${o.code} (${o.customer})`).join(', ')}\n`;
      }
      if (data.history.length > 0) {
        output += `History: ${data.history.length} matching events`;
      }
      return output;
    }
  },
  {
    patterns: [/statistic|metric|overview|summary|stat/i],
    tools: ['get_delivery_stats'],
    formatter: (results) => {
      const stats = results[0];
      return `Fleet Statistics:\n- Total Drivers: ${stats.total_drivers} (${stats.active_drivers} active, ${stats.idle_drivers} idle)\n- Total Orders: ${stats.total_orders}\n- Delivered: ${stats.delivered_orders}\n- In Progress: ${stats.in_progress_orders}\n- Pending: ${stats.pending_orders}\n- Completion Rate: ${stats.completion_rate}`;
    }
  }
];

// Extract specific values from query using regex
function extractFromQuery(query, type) {
  switch (type) {
    case 'order_code': {
      const match = query.match(/order\s*#?(\d+)|#(\d+)/i);
      return match ? { order_code: match[1] || match[2] } : null;
    }
    case 'driver_id': {
      const match = query.match(/driver\s*([a-z]|\d+)/i);
      if (match) {
        const id = match[1];
        return { driver_id: isNaN(id) ? `driver-${id}` : `driver-${id}` };
      }
      return null;
    }
    case 'query':
      return { query };
    default:
      return null;
  }
}

// Detect intent from query
function detectIntent(query) {
  for (const intent of intentPatterns) {
    for (const pattern of intent.patterns) {
      if (pattern.test(query)) {
        return intent;
      }
    }
  }
  return null;
}

// Execute tools and collect results
async function executeToolsForIntent(intent, query) {
  const results = [];

  for (const toolName of intent.tools) {
    try {
      let args = {};

      // Extract specific parameters if needed
      if (intent.needsExtraction) {
        const extracted = extractFromQuery(query, intent.needsExtraction);
        if (extracted) {
          args = extracted;
        }
      }

      const result = executeTool(toolName, args);
      results.push(result);
    } catch (error) {
      results.push({ error: error.message });
    }
  }

  return results;
}

/**
 * Main query handler - uses agentic loop to answer fleet questions
 */
export async function queryFleetWithAgents(query) {
  try {
    // Normalize query for pattern matching
    const normalizedQuery = query.toLowerCase().trim();
    
    const intent = detectIntent(normalizedQuery);

    if (!intent) {
      // Return response in frontend-compatible format
      return {
        answer: 'I can help with questions about drivers, orders, deliveries, statistics, and fleet status. Try asking: "How many orders have been delivered?", "Which drivers are active?", "What is Order #42 status?", "Find closest driver to Order #100", etc.'
      };
    }
    
    // Execute tools for this intent
    const toolResults = await executeToolsForIntent(intent, query);

    // Check for errors
    if (toolResults.some(r => r?.error)) {
      const errors = toolResults.filter(r => r?.error).map(r => r.error).join('; ');
      return {
        answer: `Error retrieving data: ${errors}`
      };
    }

    // Format response using intent's formatter
    const answer = intent.formatter(toolResults);

    return {
      answer,
      intent_type: intent.patterns[0].toString(),
      tools_used: intent.tools
    };
  } catch (error) {
    console.error('Agent error:', error);
    return {
      answer: `Error processing query: ${error.message}`
    };
  }
}
