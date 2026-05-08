import * as m from '../database/src/state.js';

// Reset state
const unassignedDriver = m.drivers[0];
const baseLocBefore = [...unassignedDriver.location];

console.log('Unassigned driver before ticks:', unassignedDriver._id, 'loc', unassignedDriver.location);

// Run ticks while unassigned
for (let i = 0; i < 5; i++) {
  m.updateDriverLocation(unassignedDriver._id);
  console.log('Unassigned tick', i, '- loc', unassignedDriver.location);
}

if (unassignedDriver.location[0] !== baseLocBefore[0] || unassignedDriver.location[1] !== baseLocBefore[1]) {
  throw new Error(`Unassigned driver moved! Before: ${baseLocBefore}, After: ${unassignedDriver.location}`);
}
console.log('✓ Unassigned driver stayed in place');

// Now assign an order
const orderId = 'order-31';
const order = m.orders.find(o => o._id === orderId);
order.status = 'Picked';
m.updateOrderStatus(orderId); // This should assign the driver
order.status = 'Out for delivery';
m.updateOrderStatus(orderId); // This will assign to nearest driver

const assignedDriver = m.drivers.find(d => d.assignedOrderId === orderId);
if (!assignedDriver) {
  throw new Error('No driver was assigned to the order');
}

console.log('\nAssigned driver:', assignedDriver._id, 'to order', orderId);
const locBefore = [...assignedDriver.location];

// Run ticks while assigned
for (let i = 0; i < 5; i++) {
  m.updateDriverLocation(assignedDriver._id);
  console.log('Assigned tick', i, '- loc', assignedDriver.location);
}

if (assignedDriver.location[0] === locBefore[0] && assignedDriver.location[1] === locBefore[1]) {
  throw new Error(`Assigned driver did not move! Location: ${assignedDriver.location}`);
}
console.log('✓ Assigned driver moved toward delivery');

console.log('\nAll tests passed!');
