import * as m from '../database/src/state.js';

console.log('=== Driver reassignment test ===\n');

// Manually set orders to "Picked" so they're queued for delivery
const testOrders = [
  m.createOrder({ code: 'Test-1', customer: 'Customer 1', status: 'Picked', deliveryPoint: [28.61, 77.20] }),
  m.createOrder({ code: 'Test-2', customer: 'Customer 2', status: 'Picked', deliveryPoint: [28.62, 77.21] }),
  m.createOrder({ code: 'Test-3', customer: 'Customer 3', status: 'Picked', deliveryPoint: [28.63, 77.22] }),
  m.createOrder({ code: 'Test-4', customer: 'Customer 4', status: 'Picked', deliveryPoint: [28.64, 77.23] }),
];

console.log(`Setup: 5 drivers, ${testOrders.length + m.orders.filter(o => o.status === 'Picked').length} orders in "Picked" status\n`);

let deliveredCount = 0;
const reassignmentLog = [];

for (let tick = 0; tick < 150; tick++) {
  m.seedStep();
  
  // Log when drivers get assigned
  m.drivers.forEach(driver => {
    if (driver.assignedOrderId) {
      const found = reassignmentLog.find(r => r.driverId === driver._id && r.orderId === driver.assignedOrderId);
      if (!found) {
        reassignmentLog.push({ tick, driverId: driver._id, orderId: driver.assignedOrderId });
        if (reassignmentLog.length > 5) { // Only log first few
          console.log(`Tick ${tick}: ${driver._id} → ${driver.assignedOrderId}`);
        }
      }
    }
  });
  
  // Track deliveries
  const newDelivered = m.orders.filter(o => o.status === 'Delivered').length;
  if (newDelivered > deliveredCount) {
    const completed = m.orders.filter(o => o.status === 'Delivered');
    completed.forEach(order => {
      if (!reassignmentLog.some(r => r.completed === order._id)) {
        console.log(`Tick ${tick}: ✓ ${order.code} delivered`);
        reassignmentLog.forEach(r => {
          if (r.orderId === order._id) {
            r.completed = order._id;
          }
        });
      }
    });
    deliveredCount = newDelivered;
  }
  
  // Stop if we have enough data
  if (deliveredCount >= 7) {
    break;
  }
}

console.log('\n=== Summary ===');
console.log(`Total assignments: ${reassignmentLog.length}`);
console.log(`Total deliveries: ${deliveredCount}`);

// Group by driver to show reassignments
const byDriver = {};
reassignmentLog.forEach(r => {
  if (!byDriver[r.driverId]) byDriver[r.driverId] = [];
  byDriver[r.driverId].push(r.orderId);
});

console.log('\nDeliveries per driver:');
Object.entries(byDriver).forEach(([driver, orders]) => {
  console.log(`  ${driver}: ${orders.length} order(s) - ${orders.map(o => o.substring(6)).join(', ')}`);
});
