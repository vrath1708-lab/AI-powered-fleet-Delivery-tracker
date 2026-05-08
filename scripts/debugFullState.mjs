import * as m from '../database/src/state.js';

console.log('=== Full state after seedStep ===\n');

m.seedStep();

console.log('All drivers:');
m.drivers.forEach(d => {
  const ord = d.assignedOrderId ? m.orders.find(o => o._id === d.assignedOrderId) : null;
  console.log(`  ${d.name}: ${d.assignedOrderId ? ord?.code : '(idle)'}`);
});

console.log('\nAll orders:');
m.orders.forEach(o => {
  const driver = m.drivers.find(d => d.assignedOrderId === o._id);
  console.log(`  ${o.code}: status=${o.status}, driver=${driver?.name ?? 'unassigned'}`);
});
