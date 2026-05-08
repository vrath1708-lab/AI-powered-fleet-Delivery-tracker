import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import {
  drivers,
  orders,
  deliveryHistory,
  getDashboardStats,
  getDelayedOrders,
  getClosestDriverForOrder,
  suggestRoute
} from '../../database/src/state.js';

// Define fleet tools with MCP tool schema
const fleetTools = [
  {
    name: 'get_drivers',
    description: 'Get all drivers with their current status, location, and assigned orders',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'idle', 'all'],
          description: 'Filter drivers by status'
        }
      }
    }
  },
  {
    name: 'get_orders',
    description: 'Get all orders with their current status and assignment information',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'in-progress', 'delivered', 'all'],
          description: 'Filter orders by status'
        }
      }
    }
  },
  {
    name: 'get_delivery_stats',
    description: 'Get overall fleet delivery statistics and metrics',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_driver_history',
    description: 'Get activity history for a specific driver',
    inputSchema: {
      type: 'object',
      properties: {
        driver_id: {
          type: 'string',
          description: 'The driver ID (e.g., "driver-1")'
        }
      },
      required: ['driver_id']
    }
  },
  {
    name: 'get_order_details',
    description: 'Get detailed information about a specific order',
    inputSchema: {
      type: 'object',
      properties: {
        order_code: {
          type: 'string',
          description: 'The order code (e.g., "ORD-42" or just the number)'
        }
      },
      required: ['order_code']
    }
  },
  {
    name: 'find_closest_driver',
    description: 'Find which driver is closest to a specific order',
    inputSchema: {
      type: 'object',
      properties: {
        order_code: {
          type: 'string',
          description: 'The order code to find the closest driver for'
        }
      },
      required: ['order_code']
    }
  },
  {
    name: 'get_delayed_orders',
    description: 'Get list of delayed or in-progress orders',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'search_fleet_data',
    description: 'Search across all fleet data (drivers, orders, history) by keyword',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (driver name, order code, customer name, etc.)'
        }
      },
      required: ['query']
    }
  }
];

// Tool handlers
function handleGetDrivers(args) {
  const status = args.status || 'all';
  let result = drivers;

  if (status !== 'all') {
    result = result.filter(d => d.status === status || d.phase === status);
  }

  return result.map(d => ({
    id: d._id,
    name: d.name,
    vehicle: d.vehicle,
    status: d.status,
    phase: d.phase || 'idle',
    location: { lat: d.latitude, lng: d.longitude },
    assigned_order: orders.find(o => o.assignedDriver === d._id)?.code || 'none'
  }));
}

function handleGetOrders(args) {
  const status = args.status || 'all';
  let result = orders;

  if (status !== 'all') {
    if (status === 'pending') {
      result = result.filter(o => !o.assignedDriver);
    } else if (status === 'in-progress') {
      result = result.filter(o => o.status !== 'Delivered' && o.assignedDriver);
    } else if (status === 'delivered') {
      result = result.filter(o => o.status === 'Delivered');
    }
  }

  return result.map(o => ({
    code: o.code,
    customer: o.customer,
    status: o.status,
    assigned_driver: drivers.find(d => d._id === o.assignedDriver)?.name || 'unassigned',
    pickup: { lat: o.pickupLat, lng: o.pickupLng },
    delivery: { lat: o.deliveryLat, lng: o.deliveryLng },
    created_at: o.createdAt || 'unknown'
  }));
}

function handleGetDeliveryStats() {
  const stats = getDashboardStats();
  return {
    total_drivers: drivers.length,
    active_drivers: stats.activeDrivers,
    idle_drivers: drivers.filter(d => d.phase === 'idle' || d.status === 'idle').length,
    total_orders: orders.length,
    delivered_orders: orders.filter(o => o.status === 'Delivered').length,
    in_progress_orders: orders.filter(o => o.status !== 'Delivered').length,
    pending_orders: orders.filter(o => !o.assignedDriver).length,
    completion_rate: `${Math.round((orders.filter(o => o.status === 'Delivered').length / orders.length) * 100 || 0)}%`
  };
}

function handleGetDriverHistory(args) {
  const driverId = args.driver_id;
  const driver = drivers.find(d => d._id === driverId);

  if (!driver) {
    throw new Error(`Driver ${driverId} not found`);
  }

  const history = deliveryHistory
    .filter(h => h.driverId === driverId)
    .slice(-20)
    .reverse()
    .map(h => ({
      timestamp: h.timestamp || new Date().toISOString(),
      event_type: h.eventType,
      order_code: h.orderId ? orders.find(o => o._id === h.orderId)?.code : 'N/A',
      details: h.details
    }));

  return {
    driver_name: driver.name,
    vehicle: driver.vehicle,
    recent_activity: history
  };
}

function handleGetOrderDetails(args) {
  let orderCode = args.order_code;
  if (!orderCode.startsWith('#')) {
    orderCode = `#${orderCode}`;
  }

  const order = orders.find(o => o.code === orderCode);
  if (!order) {
    throw new Error(`Order ${orderCode} not found`);
  }

  const assignedDriver = order.assignedDriver ? drivers.find(d => d._id === order.assignedDriver) : null;
  const orderHistory = deliveryHistory
    .filter(h => h.orderId === order._id)
    .map(h => ({
      event_type: h.eventType,
      timestamp: h.timestamp || new Date().toISOString(),
      details: h.details
    }));

  return {
    code: order.code,
    customer: order.customer,
    status: order.status,
    assigned_driver: assignedDriver ? { name: assignedDriver.name, vehicle: assignedDriver.vehicle } : null,
    pickup_location: { lat: order.pickupLat, lng: order.pickupLng },
    delivery_location: { lat: order.deliveryLat, lng: order.deliveryLng },
    created_at: order.createdAt || 'unknown',
    history: orderHistory
  };
}

function handleFindClosestDriver(args) {
  const orderCode = args.order_code;
  const result = getClosestDriverForOrder(`order-${orderCode.replace(/\D/g, '')}`);

  if (!result) {
    throw new Error(`Could not find closest driver for ${orderCode}`);
  }

  return {
    order_code: orderCode,
    closest_driver: result.driver.name,
    distance_km: result.distanceKm,
    driver_vehicle: result.driver.vehicle,
    driver_status: result.driver.status
  };
}

function handleGetDelayedOrders() {
  const delayed = getDelayedOrders();
  return {
    count: delayed.length,
    orders: delayed.map(o => ({
      code: o.code,
      customer: o.customer,
      status: o.status,
      assigned_driver: drivers.find(d => d._id === o.assignedDriver)?.name || 'unassigned'
    }))
  };
}

function handleSearchFleetData(args) {
  const query = args.query.toLowerCase();
  const results = {
    drivers: [],
    orders: [],
    history: []
  };

  // Search drivers
  results.drivers = drivers
    .filter(d => d.name.toLowerCase().includes(query) || d.vehicle.toLowerCase().includes(query))
    .map(d => ({ name: d.name, vehicle: d.vehicle, status: d.status }));

  // Search orders
  results.orders = orders
    .filter(o => o.code.toLowerCase().includes(query) || o.customer.toLowerCase().includes(query))
    .map(o => ({ code: o.code, customer: o.customer, status: o.status }));

  // Search history
  results.history = deliveryHistory
    .filter(h => JSON.stringify(h).toLowerCase().includes(query))
    .slice(-10)
    .map(h => ({
      event_type: h.eventType,
      details: h.details,
      timestamp: h.timestamp || new Date().toISOString()
    }));

  return results;
}

// Execute tool based on name
function executeTool(toolName, args) {
  switch (toolName) {
    case 'get_drivers':
      return handleGetDrivers(args);
    case 'get_orders':
      return handleGetOrders(args);
    case 'get_delivery_stats':
      return handleGetDeliveryStats();
    case 'get_driver_history':
      return handleGetDriverHistory(args);
    case 'get_order_details':
      return handleGetOrderDetails(args);
    case 'find_closest_driver':
      return handleFindClosestDriver(args);
    case 'get_delayed_orders':
      return handleGetDelayedOrders();
    case 'search_fleet_data':
      return handleSearchFleetData(args);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

function createMCPServer() {
  const server = new Server(
    {
      name: 'FleetPulse-MCP',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: fleetTools
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const result = executeTool(request.params.name, request.params.arguments || {});
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error executing tool: ${error.message}`
          }
        ],
        isError: true
      };
    }
  });

  return server;
}

// Start server
async function startMCPServer() {
  const server = createMCPServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('FleetPulse MCP Server started and listening on stdio');
}

export { startMCPServer, executeTool, fleetTools };
