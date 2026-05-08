import * as m from '../database/src/state.js';

console.log('=== All drivers assignment test ===\n');
console.log(`Total drivers: ${m.drivers.length}`);
console.log(`Total orders: ${m.orders.length}\n`);

// Show initial state
console.log('Initial orders:');
m.orders.forEach(o => {
  console.log(`  ${o.code}: status=${o.status}`);
});

console.log('\nRunning initial seedStep()...\n');
m.seedStep();

// Check assignments
console.log('After first seedStep:');
m.drivers.forEach(d => {
  const assigned = d.assignedOrderId ? m.orders.find(o => o._id === d.assignedOrderId)?.code : 'unassigned';
  console.log(`  ${d.name}: ${assigned}`);
});

const assignedCount = m.drivers.filter(d => d.assignedOrderId).length;
console.log(`\n✓ ${assignedCount}/${m.drivers.length} drivers assigned`);
