import * as m from '../database/src/state.js';

// Start fresh simulation cycle
console.log('=== Simulating order assignment and driver route ===\n');

const orderId = 'order-31';
let order = m.orders.find(o => o._id === orderId);

console.log('Initial order status:', order.status);
console.log('Orders before step:', m.orders.map(o => ({ id: o._id, status: o.status })));
console.log('Drivers before step:', m.drivers.map(d => ({ id: d._id, assigned: d.assignedOrderId, routeLen: d.route?.length ?? 0 })));

// Run seedStep multiple times
for (let tick = 0; tick < 30; tick++) {
  const snapshot = m.seedStep();
  
  const driver = m.drivers.find(d => d.assignedOrderId === orderId);
  order = m.orders.find(o => o._id === orderId);
  
  if (driver) {
    console.log(`Tick ${tick}: driver ${driver._id} assigned, routeLen=${driver.route?.length ?? 0}, location=${JSON.stringify(driver.location)}, orderStatus=${order.status}`);
    if (driver.route && driver.route.length > 0) {
      console.log(`  route[0]=${JSON.stringify(driver.route[0])}, route[last]=${JSON.stringify(driver.route[driver.route.length - 1])}`);
    }
  } else if (order.status !== 'Pending') {
    console.log(`Tick ${tick}: no driver assigned yet, orderStatus=${order.status}`);
  }
  
  if (order.status === 'Delivered') {
    console.log(`✓ Order delivered at tick ${tick}`);
    break;
  }
}
