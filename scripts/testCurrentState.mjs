import * as m from '../database/src/state.js';

console.log('=== Test: Current assignments (not historical) ===\n');

// Create 8 new orders
for (let i = 0; i < 8; i++) {
  m.createOrder({
    code: `Order-${i}`,
    customer: `Customer ${i}`,
    status: 'Picked',
    deliveryPoint: [28.6 + (i * 0.005), 77.2 + (i * 0.005)]
  });
}

console.log(`Setup: 5 drivers, ${m.orders.length} orders\n`);

// Track current assignments only
for (let tick = 0; tick < 60; tick++) {
  m.seedStep();
  
  if (tick % 10 === 0) {
    console.log(`\n--- Tick ${tick} ---`);
    
    // Show current assignment state
    const currentAssignments = {};
    m.drivers.forEach(driver => {
      if (driver.assignedOrderId) {
        if (!currentAssignments[driver.assignedOrderId]) {
          currentAssignments[driver.assignedOrderId] = [];
        }
        currentAssignments[driver.assignedOrderId].push(driver._id);
      }
    });
    
    // Check for current duplicates
    let duplicateNow = false;
    Object.entries(currentAssignments).forEach(([orderId, driverList]) => {
      if (driverList.length > 1) {
        console.log(`✗ DUPLICATE NOW: Order ${orderId} assigned to ${driverList.join(', ')}`);
        duplicateNow = true;
      }
    });
    
    if (!duplicateNow) {
      console.log('✓ No duplicates right now');
      console.log(`Assignments: ${Object.entries(currentAssignments).map(([o,d]) => `${o}→${d[0]}`).join(', ')}`);
    }
    
    // Show order statuses
    const statuses = {};
    m.orders.forEach(o => {
      if (!statuses[o.status]) statuses[o.status] = 0;
      statuses[o.status]++;
    });
    console.log(`Order statuses:`, statuses);
  }
}
