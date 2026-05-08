import {
  getClosestDriverForOrder,
  getDelayedOrders,
  drivers,
  getDashboardStats,
  deliveryHistory,
  orders,
  suggestRoute
} from '../../database/src/state.js';

const hfToken = process.env.HF_TOKEN ?? process.env.HUGGING_FACE_TOKEN ?? process.env.HUGGINGFACE_API_KEY ?? '';
const hfModelId = process.env.HF_MODEL_ID ?? 'meta-llama/Meta-Llama-3.1-8B-Instruct';

async function callHuggingFace(prompt) {
  if (!hfToken) {
    return null;
  }

  const response = await fetch(`https://api-inference.huggingface.co/models/${encodeURIComponent(hfModelId)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${hfToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 128,
        temperature: 0.2,
        return_full_text: false
      },
      options: {
        wait_for_model: true
      }
    })
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();

  if (Array.isArray(payload)) {
    return payload[0]?.generated_text ?? null;
  }

  return payload.generated_text ?? payload[0]?.generated_text ?? null;
}

function buildLocalResponse(query) {
  // No more hardcoded patterns - delegate to AI model with full context
  // The model should handle any question about the fleet dynamically
  return {
    kind: 'help',
    answer: '' // Will be handled by the model
  };
}

function buildFleetSummary(query) {
  const dashboard = getDashboardStats();
  
  // Build detailed driver information
  const driverDetails = drivers.map((driver) => {
    const assignedOrder = orders.find(o => o.assignedDriver === driver._id);
    return `- ${driver.name} (${driver._id}): ${driver.status}, Vehicle: ${driver.vehicle}, Location: (${driver.latitude?.toFixed(4)}, ${driver.longitude?.toFixed(4)}), Phase: ${driver.phase || 'idle'}, Assigned: ${assignedOrder ? assignedOrder.code : 'none'}`;
  }).join('\n');

  // Build detailed order information
  const orderDetails = orders.map((order) => {
    const driver = drivers.find(d => d._id === order.assignedDriver);
    return `- ${order.code} (${order._id}): Customer: ${order.customer}, Status: ${order.status}, Assigned to: ${driver?.name || 'unassigned'}, Pickup: (${order.pickupLat?.toFixed(4)}, ${order.pickupLng?.toFixed(4)}), Delivery: (${order.deliveryLat?.toFixed(4)}, ${order.deliveryLng?.toFixed(4)})`;
  }).join('\n');

  // Build recent activity log
  const recentActivity = deliveryHistory.slice(-10).reverse().map((entry) => {
    const driver = drivers.find(d => d._id === entry.driverId);
    const order = orders.find(o => o._id === entry.orderId);
    return `- [${entry.timestamp || new Date().toISOString().split('T')[1]}] ${entry.eventType}: ${driver?.name || 'unknown'} - ${order?.code || 'N/A'}: ${entry.details}`;
  }).join('\n');

  return [
    `User question: "${query}"`,
    '',
    'CURRENT FLEET STATE:',
    `Total drivers: ${drivers.length} | Active: ${dashboard.activeDrivers} | Idle: ${drivers.filter(d => d.phase === 'idle' || d.status === 'idle').length}`,
    `Total orders: ${orders.length} | Delivered: ${orders.filter(o => o.status === 'Delivered').length} | In-progress: ${orders.filter(o => o.status !== 'Delivered').length}`,
    '',
    'DRIVERS:',
    driverDetails,
    '',
    'ORDERS:',
    orderDetails,
    '',
    'RECENT ACTIVITY:',
    recentActivity || 'No recent activity'
  ].join('\n');
}

async function answerWithModel(query) {
  if (!hfToken) {
    return null;
  }

  const prompt = [
    'You are an intelligent fleet operations assistant with real-time access to live fleet data.',
    'Analyze the user question using the complete fleet context provided below.',
    'Answer ANY question about the fleet by examining the current state of drivers, orders, deliveries, and activities.',
    'If asked about specific drivers or orders, look them up in the data.',
    'If asked about metrics or statistics, calculate them from the data.',
    'Provide concise, factual answers based only on the data provided.',
    'Do not invent facts or mention that you are an AI model.',
    'Be helpful and direct.',
    '',
    buildFleetSummary(query)
  ].join('\n\n');

  const refined = await callHuggingFace(prompt);

  return refined?.trim() ? refined.trim().replace(/^['"\s]+|['"\s]+$/g, '') : null;
}

async function refineWithModel(query, response) {
  if (!hfToken) {
    return response;
  }

  const context = JSON.stringify(
    {
      query,
      kind: response.kind,
      answer: response.answer,
      data: response.data ?? null
    },
    null,
    2
  );

  const prompt = [
    'You are a concise fleet operations assistant.',
    'Rewrite the answer below in one short, helpful sentence.',
    'Keep all factual details, do not invent new facts, and do not mention that you are an AI model.',
    `Context:\n${context}`
  ].join('\n\n');

  const refined = await callHuggingFace(prompt);

  if (!refined || !refined.trim()) {
    return response;
  }

  return {
    ...response,
    answer: refined.trim().replace(/^['"\s]+|['"\s]+$/g, '')
  };
}

export function getClosestDriver(orderCode) {
  return getClosestDriverForOrder(orderCode);
}

export async function queryFleet(query) {
  const response = await buildStructuredResponse(query);
  return response.answer;
}

export async function buildStructuredResponse(query) {
  const sanitizedQuery = query ?? '';

  // Always use the AI model with full context for dynamic answers
  const modelAnswer = await answerWithModel(sanitizedQuery);

  if (modelAnswer) {
    return {
      kind: 'model-answer',
      answer: modelAnswer
    };
  }

  // Fallback if no AI model available
  return {
    kind: 'help',
    answer: 'Ask me about your fleet, drivers, orders, deliveries, locations, routes, or any operational questions. I can analyze real-time data and provide insights.'
  };
}
