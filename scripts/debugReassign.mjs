import * as m from '../database/src/state.js';

console.log('=== Debug reassignIdleDrivers ===\n');

// First seedStep
console.log('Calling seedStep...');
m.seedStep();

console.log('\nAfter seedStep:');
console.log(`Idle drivers: ${m.drivers.filter(d => !d.assignedOrderId).map(d => d.name).join(', ')}`);
console.log(`Assigned drivers: ${m.drivers.filter(d => d.assignedOrderId).map(d => `${d.name}→${m.orders.find(o => o._id === d.assignedOrderId)?.code}`).join(', ')}`);

const pickedOrders = m.orders.filter(o => o.status === 'Picked');
const assignedOrderIds = new Set(m.drivers.map(d => d.assignedOrderId).filter(Boolean));
const availableOrders = pickedOrders.filter(o => !assignedOrderIds.has(o._id));

console.log(`\nPicked orders: ${pickedOrders.map(o => o.code).join(', ')}`);
console.log(`Available (not assigned): ${availableOrders.map(o => o.code).join(', ')}`);

// Manually call reassignIdleDrivers to debug
console.log('\nManually calling reassignIdleDrivers...');
const beforeAssignments = m.drivers.filter(d => d.assignedOrderId).length;
m.reassignIdleDrivers();
const afterAssignments = m.drivers.filter(d => d.assignedOrderId).length;
console.log(`Assignments before: ${beforeAssignments}, after: ${afterAssignments}`);

console.log('\nAfter manual reassignIdleDrivers:');
m.drivers.forEach(d => {
  const status = d.assignedOrderId ? `→ ${m.orders.find(o => o._id === d.assignedOrderId)?.code}` : '(idle)';
  console.log(`  ${d.name}: ${status}`);
});
