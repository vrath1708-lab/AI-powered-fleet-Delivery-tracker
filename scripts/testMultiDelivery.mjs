import * as m from '../database/src/state.js';

console.log('=== Multi-delivery test: More orders than drivers ===\n');

// Create extra orders beyond the 5 drivers
const extraOrder1 = m.createOrder({
  code: 'Order #100',
  customer: 'Extra Customer 1',
  status: 'Pending',
  deliveryPoint: [28.62, 77.21]
});

const extraOrder2 = m.createOrder({
  code: 'Order #101',
  customer: 'Extra Customer 2', 
  status: 'Pending',
  deliveryPoint: [28.64, 77.23]
});

console.log(`Created ${m.orders.length} total orders (5 drivers + 2 extra orders)\n`);

// Run simulation
let deliveredCount = 0;
let assignedOrders = new Set();

for (let tick = 0; tick < 100; tick++) {
  const snapshot = m.seedStep();
  
  // Track assignments
  m.drivers.forEach(d => {
    if (d.assignedOrderId && !assignedOrders.has(d.assignedOrderId)) {
      assignedOrders.add(d.assignedOrderId);
      console.log(`Tick ${tick}: ${d._id} assigned to ${d.assignedOrderId}`);
    }
  });
  
  // Track completions
  const newDelivered = m.orders.filter(o => o.status === 'Delivered').length;
  if (newDelivered > deliveredCount) {
    const completed = m.orders.find(o => o.status === 'Delivered' && !m.deliveryHistory.slice(1).some(h => h.orderId === o._id && h.event === 'delivered'));
    if (completed) {
      console.log(`Tick ${tick}: ${completed._id} delivered`);
      deliveredCount = newDelivered;
    }
  }
  
  // Stop if all orders delivered
  if (snapshot.dashboard.completedOrders === m.orders.length) {
    console.log(`\n✓ All ${m.orders.length} orders delivered!`);
    console.log(`  Dashboard shows: ${snapshot.dashboard.completedOrders} completed, ${snapshot.dashboard.pendingOrders} pending`);
    break;
  }
}

console.log('\nFinal state:');
console.log(`Orders assigned: ${assignedOrders.size}`);
console.log(`Orders delivered: ${m.orders.filter(o => o.status === 'Delivered').length}`);
console.log(`Drivers reassigned: ${m.deliveryHistory.filter(h => h.event === 'assigned-for-delivery').length}`);
