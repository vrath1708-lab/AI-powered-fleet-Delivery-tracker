import * as m from '../database/src/state.js';

console.log('=== Checking driver assignments and routes ===\n');

// Check initial state
m.drivers.forEach(driver => {
  console.log(`${driver._id}: assigned=${driver.assignedOrderId ?? 'null'}, hasRoute=${driver.route?.length ?? 0 > 0}, routeLen=${driver.route?.length ?? 0}`);
});

console.log('\n=== Running seedStep to trigger assignment ===');
m.seedStep();

console.log('\nAfter seedStep:');
m.drivers.forEach(driver => {
  const shouldRender = driver.assignedOrderId ? '✓ RENDER' : '✗ HIDE';
  console.log(`${driver._id}: assigned=${driver.assignedOrderId ?? 'null'}, routeLen=${driver.route?.length ?? 0} [${shouldRender}]`);
});

// Count how many polylines should render
const renderCount = m.drivers.filter(d => d.assignedOrderId).length;
console.log(`\nPolylines to render: ${renderCount} (drivers with assigned orders)`);
