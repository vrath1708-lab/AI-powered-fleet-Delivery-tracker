import * as m from '../database/src/state.js';

const orderId = 'order-31';
console.log('Order before:', m.orders.find(o => o._id === orderId));
const o = m.updateOrderStatus(orderId);
console.log('Order after status:', o.status);
const driver = m.drivers.find(d => d.assignedOrderId === orderId);
console.log('Assigned driver:', driver ? driver._id : 'none');
if (!driver) process.exit(0);
console.log('Initial route length:', driver.route.length, 'route0', driver.route[0], 'loc', driver.location);
let deliveredAt = -1;
let deliveredLocation = null;

for (let i = 0; i < 40; i++) {
  m.updateDriverLocation(driver._id);
  const d = m.drivers.find(x => x._id === driver._id);
  const ord = m.orders.find(o => o._id === orderId);
  console.log(i, 'loc', d.location, 'routeLen', d.route.length, 'route0', d.route[0], 'end', d.route[d.route.length - 1], 'orderStatus', ord.status, 'deliveryStop', d.deliveryStop === true);
  if (!d.assignedOrderId && ord.status === 'Delivered') {
    deliveredAt = i;
    deliveredLocation = [...d.location];
    console.log('assignment cleared at tick', i);
    break;
  }
}

if (deliveredAt !== -1) {
  for (let i = 0; i < 3; i++) {
    m.updateDriverLocation(driver._id);
    const d = m.drivers.find(x => x._id === driver._id);
    console.log('post', i, 'loc', d.location, 'deliveryStop', d.deliveryStop === true);
    if (d.location[0] !== deliveredLocation[0] || d.location[1] !== deliveredLocation[1]) {
      throw new Error(`Driver moved after delivery: expected ${deliveredLocation}, got ${d.location}`);
    }
  }
}

console.log('final loc', m.drivers.find(d => d._id === 'driver-2').location);
