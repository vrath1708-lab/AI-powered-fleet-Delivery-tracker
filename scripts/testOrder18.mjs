import * as m from '../database/src/state.js';

console.log('=== Detailed order-18 trace ===\n');

console.log('Initial seed orders:');
m.orders.forEach(o => {
  if (o._id.includes('18')) {
    console.log(`  ${o._id}: status=${o.status}`);
  }
});

for (let tick = 0; tick <= 12; tick++) {
  console.log(`\n--- TICK ${tick} START ---`);
  
  // Before seedStep
  const order18Before = m.orders.find(o => o._id === 'order-18');
  const driver18Before = m.drivers.find(d => d.assignedOrderId === 'order-18');
  console.log(`Before: order-18 status=${order18Before?.status}, assigned to=${driver18Before?._id ?? 'nobody'}`);
  
  m.seedStep();
  
  // After seedStep
  const order18After = m.orders.find(o => o._id === 'order-18');
  const drivers18 = m.drivers.filter(d => d.assignedOrderId === 'order-18');
  
  console.log(`After: order-18 status=${order18After?.status}, assigned to=${drivers18.map(d => d._id).join(', ') || 'nobody'}`);
  
  if (drivers18.length > 1) {
    console.log(`!!! DUPLICATE DETECTED !!!`);
    drivers18.forEach(d => {
      console.log(`  - ${d._id} has assignedOrderId = 'order-18'`);
    });
  }
}
