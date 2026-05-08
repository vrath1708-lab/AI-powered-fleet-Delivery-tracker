import * as m from '../database/src/state.js';

console.log('=== Test: No duplicate driver assignments ===\n');

// Create several orders in Picked status
for (let i = 0; i < 8; i++) {
  m.createOrder({
    code: `Order-${i}`,
    customer: `Customer ${i}`,
    status: 'Picked',
    deliveryPoint: [28.6 + (i * 0.005), 77.2 + (i * 0.005)]
  });
}

console.log(`Setup: 5 drivers, ${m.orders.length} orders in "Picked" status\n`);

// Track assignments to detect duplicates
const assignmentMap = {};

for (let tick = 0; tick < 200; tick++) {
  m.seedStep();
  
  // Check for duplicate assignments
  m.drivers.forEach(driver => {
    if (driver.assignedOrderId) {
      if (!assignmentMap[driver.assignedOrderId]) {
        assignmentMap[driver.assignedOrderId] = [];
      }
      if (!assignmentMap[driver.assignedOrderId].includes(driver._id)) {
        assignmentMap[driver.assignedOrderId].push(driver._id);
      }
    }
  });
  
  if (tick % 40 === 0) {
    const assigned = Object.keys(assignmentMap).length;
    console.log(`Tick ${tick}: ${assigned} orders assigned`);
  }
}

console.log('\n=== Checking for duplicates ===');
let duplicateFound = false;
Object.entries(assignmentMap).forEach(([orderId, drivers]) => {
  if (drivers.length > 1) {
    console.log(`✗ DUPLICATE: Order ${orderId} assigned to ${drivers.join(', ')}`);
    duplicateFound = true;
  }
});

if (!duplicateFound) {
  console.log('✓ No duplicate assignments found!');
  console.log(`Total unique assignments: ${Object.keys(assignmentMap).length}`);
  console.log(`Orders delivered: ${m.orders.filter(o => o.status === 'Delivered').length}`);
}
