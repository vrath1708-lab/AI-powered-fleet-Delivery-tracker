import * as state from '../database/src/state.js';
import * as seed from '../database/src/seed.js';

// Clone seed arrays immediately to avoid mutation races (state uses same references in memory)
const seedDriversClone = JSON.parse(JSON.stringify(seed.drivers || []));
const seedOrdersClone = JSON.parse(JSON.stringify(seed.orders || []));
const seedHistoryClone = JSON.parse(JSON.stringify(seed.deliveryHistory || []));

console.log('Before: drivers=', state.drivers.length, 'orders=', state.orders.length);

// Clear arrays
state.drivers.splice(0, state.drivers.length);
state.orders.splice(0, state.orders.length);
state.deliveryHistory.splice(0, state.deliveryHistory.length);

// Re-add cloned seed data
seedDriversClone.forEach((d) => state.drivers.push(d));
seedOrdersClone.forEach((o) => state.orders.push(o));
seedHistoryClone.forEach((h) => state.deliveryHistory.push(h));

console.log('After: drivers=', state.drivers.length, 'orders=', state.orders.length);
console.log('Driver IDs:', state.drivers.map(d => d._id).join(', '));
console.log('Order IDs :', state.orders.map(o => o._id).join(', '));
console.log('History   :', state.deliveryHistory.length, 'entries');
