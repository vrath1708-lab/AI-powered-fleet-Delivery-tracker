
import { deliveryHistory as seedHistory, drivers as seedDrivers, orders as seedOrders, zones as seedZones } from './seed.js';

export const drivers = seedDrivers;
export const orders = seedOrders;
export const zones = seedZones;
export const deliveryHistory = seedHistory;

export function toRadians(value) {
  return (value * Math.PI) / 180;
}

export function distanceKm([lat1, lng1], [lat2, lng2]) {
  const earthRadius = 6371;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getDashboardStats() {
  return {
    totalDeliveries: orders.length,
    activeDrivers: drivers.filter((driver) => driver.status === 'active').length,
    completedOrders: orders.filter((order) => order.status === 'Delivered').length,
    pendingOrders: orders.filter((order) => order.status !== 'Delivered').length
  };
}

export function getClosestDriverForOrder(orderId) {
  const order = orders.find((entry) => entry._id === orderId || entry.code.toLowerCase().includes(orderId.toLowerCase()));

  if (!order) {
    return null;
  }

  const ranked = drivers
    .map((driver) => ({
      driver,
      distance: distanceKm(driver.location, order.deliveryPoint)
    }))
    .sort((left, right) => left.distance - right.distance);

  return {
    order,
    driver: ranked[0].driver,
    distanceKm: Number(ranked[0].distance.toFixed(2))
  };
}

export function getDelayedOrders() {
  return orders.filter((order) => order.status === 'Pending' || order.status === 'Picked');
}

export function suggestRoute(driverName) {
  const driver = drivers.find((entry) => entry._id === driverName || entry.name.toLowerCase().includes(driverName.toLowerCase()));

  if (!driver) {
    return null;
  }

  return {
    driver,
    recommendation: `Keep ${driver.name} on the current corridor and hand off to the nearest zone around ${zones[0].name}.`,
    routePoints: driver.route
  };
}

export function movePoint([lat, lng], step = 0.0005) {
  return [Number((lat + step).toFixed(6)), Number((lng + step / 1.8).toFixed(6))];
}

// Move current point toward target by a maximum step (in degrees approx).
export function moveTowards([lat, lng], [tLat, tLng], maxStep = 0.0005) {
  const dLat = tLat - lat;
  const dLng = tLng - lng;
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);
  if (dist === 0) return [Number(lat.toFixed(6)), Number(lng.toFixed(6))];
  const ratio = Math.min(1, maxStep / dist);
  const nLat = Number((lat + dLat * ratio).toFixed(6));
  const nLng = Number((lng + dLng * ratio).toFixed(6));
  return [nLat, nLng];
}

export function densifyRoute(points, segmentsPerLeg = 4) {
  if (!Array.isArray(points) || points.length < 2) {
    return points ?? [];
  }

  const route = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const [startLat, startLng] = points[index];
    const [endLat, endLng] = points[index + 1];

    for (let step = 0; step < segmentsPerLeg; step += 1) {
      const ratio = step / segmentsPerLeg;
      route.push([
        Number((startLat + (endLat - startLat) * ratio).toFixed(6)),
        Number((startLng + (endLng - startLng) * ratio).toFixed(6))
      ]);
    }
  }

  route.push(points[points.length - 1]);
  return route;
}

export function appendHistory(entry) {
  deliveryHistory.unshift({
    _id: `history-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    recordedAt: new Date().toISOString(),
    ...entry
  });

  return deliveryHistory[0];
}

export function updateDriverLocation(driverId) {
  const driver = drivers.find((entry) => entry._id === driverId);

  if (!driver) {
    return null;
  }

  if (!driver.baseLocation) {
    driver.baseLocation = [...driver.location];
  }

  if (!driver.routeTemplate) {
    driver.routeTemplate = Array.isArray(driver.route) ? driver.route.map(([lat, lng]) => [lat, lng]) : [];
  }

  const step = 0.0004 + Math.random() * 0.0006;

  // If driver has an assigned order, move them along their route
  if (driver.assignedOrderId) {
    const order = orders.find((o) => o._id === driver.assignedOrderId);
    if (!order) {
      driver.assignedOrderId = null;
      driver.route = [];
      driver.currentPhase = null;
      return driver;
    }

    // Determine current phase: heading to pickup or heading to delivery
    if (!driver.currentPhase) {
      driver.currentPhase = 'heading-to-pickup';
    }

    const pickupPoint = order.pickupPoint || order.deliveryPoint;
    const deliveryPoint = order.deliveryPoint;

    // Check distance to pickup point
    const dLatPickup = driver.location[0] - pickupPoint[0];
    const dLngPickup = driver.location[1] - pickupPoint[1];
    const distToPickup = Math.sqrt(dLatPickup * dLatPickup + dLngPickup * dLngPickup);

    // Check distance to delivery point
    const dLatDeliv = driver.location[0] - deliveryPoint[0];
    const dLngDeliv = driver.location[1] - deliveryPoint[1];
    const distToDelivery = Math.sqrt(dLatDeliv * dLatDeliv + dLngDeliv * dLngDeliv);

    // Phase 1: Heading to or at pickup location
    if (driver.currentPhase === 'heading-to-pickup') {
      if (distToPickup < 0.0005) {
        // Arrived at pickup
        driver.location = [pickupPoint[0], pickupPoint[1]];
        driver.currentPhase = 'picking-up';
        order.status = 'Driver picking up order';
        order.statusLog.unshift({ status: order.status, updatedAt: new Date().toISOString() });
        appendHistory({
          orderId: order._id,
          driverId: driver._id,
          event: 'arrived-at-pickup',
          notes: `${order.code} pickup arrived by ${driver._id}`
        });
        // Create route to delivery after a couple ticks at pickup
        driver.pickupArrivalTick = (driver.pickupArrivalTick || 0) + 1;
        if (driver.pickupArrivalTick >= 2) {
          driver.currentPhase = 'heading-to-delivery';
          driver.route = densifyRoute([driver.location.slice(), deliveryPoint], 8);
          driver.pickupArrivalTick = 0;
        }
        return driver;
      } else {
        // Still heading to pickup, create route if not exists
        if (!Array.isArray(driver.route) || driver.route.length === 0) {
          driver.route = densifyRoute([driver.location.slice(), pickupPoint], 8);
        }

        // Move toward pickup
        if (Array.isArray(driver.route) && driver.route.length >= 1) {
          let targetIdx = 0;
          let minDist = Infinity;
          for (let i = 0; i < driver.route.length; i++) {
            const [rLat, rLng] = driver.route[i];
            const d = Math.abs(rLat - driver.location[0]) + Math.abs(rLng - driver.location[1]);
            if (d < minDist) {
              minDist = d;
              targetIdx = i;
            }
          }

          const nextIdx = Math.min(targetIdx + 1, driver.route.length - 1);
          let target;
          if (nextIdx === targetIdx && driver.route.length === 1) {
            target = pickupPoint;
          } else {
            target = driver.route[nextIdx];
          }

          driver.location = moveTowards(driver.location, target, step);

          if (nextIdx > 0) {
            driver.route = driver.route.slice(nextIdx);
            if (driver.route.length > 0) {
              driver.route[0] = driver.location;
            }
          } else if (Array.isArray(driver.route) && driver.route.length > 0) {
            driver.route[0] = driver.location;
          }

          if (driver.route.length === 1) {
            driver.route.push(pickupPoint);
          }
        } else {
          driver.location = moveTowards(driver.location, pickupPoint, step);
        }
        return driver;
      }
    }

    // Phase 2: Heading to or at delivery location
    if (driver.currentPhase === 'heading-to-delivery' || driver.currentPhase === 'picking-up') {
      if (distToDelivery < 0.0005) {
        // Arrived at delivery
        driver.location = [deliveryPoint[0], deliveryPoint[1]];
        order.status = 'Delivered';
        order.statusLog.unshift({ status: order.status, updatedAt: new Date().toISOString() });
        appendHistory({
          orderId: order._id,
          driverId: driver._id,
          event: 'delivered',
          notes: `${order.code} delivered by ${driver._id}`
        });
        driver.assignedOrderId = null;
        driver.deliveryStop = true;
        driver.route = [];
        driver.currentPhase = null;
        driver.pickupArrivalTick = 0;
        if (driver.assignedRouteTemplate) {
          delete driver.assignedRouteTemplate;
        }
        return driver;
      } else {
        // Still heading to delivery, move along route
        if (Array.isArray(driver.route) && driver.route.length >= 1) {
          let targetIdx = 0;
          let minDist = Infinity;
          for (let i = 0; i < driver.route.length; i++) {
            const [rLat, rLng] = driver.route[i];
            const d = Math.abs(rLat - driver.location[0]) + Math.abs(rLng - driver.location[1]);
            if (d < minDist) {
              minDist = d;
              targetIdx = i;
            }
          }

          const nextIdx = Math.min(targetIdx + 1, driver.route.length - 1);
          let target;
          if (nextIdx === targetIdx && driver.route.length === 1) {
            target = deliveryPoint;
          } else {
            target = driver.route[nextIdx];
          }

          driver.location = moveTowards(driver.location, target, step);

          if (nextIdx > 0) {
            driver.route = driver.route.slice(nextIdx);
            if (driver.route.length > 0) {
              driver.route[0] = driver.location;
            }
          } else if (Array.isArray(driver.route) && driver.route.length > 0) {
            driver.route[0] = driver.location;
          }

          if (driver.route.length === 1) {
            driver.route.push(deliveryPoint);
          }
        } else {
          driver.location = moveTowards(driver.location, deliveryPoint, step);
        }
        return driver;
      }
    }
  }

  // Unassigned drivers stay parked at their base location until an order is assigned
  return driver;
}

export function updateOrderStatus(orderId) {
  const order = orders.find((entry) => entry._id === orderId);

  if (!order) {
    return null;
  }

  // Update order status based on assignment and driver phase
  if (order.assignedDriverId) {
    const driver = drivers.find(d => d._id === order.assignedDriverId);
    if (driver && driver.currentPhase === 'heading-to-delivery') {
      if (order.status !== 'Out for delivery') {
        order.status = 'Out for delivery';
        order.statusLog.unshift({ status: order.status, updatedAt: new Date().toISOString() });
      }
    }
  }

  return order;
}

export function reassignIdleDrivers() {
  // Find drivers that are not currently assigned
  const idleDrivers = drivers.filter((d) => !d.assignedOrderId && d.status === 'active');
  
  if (idleDrivers.length === 0) return;  // No idle drivers
  
  // Get orders currently assigned to ANY driver
  const allAssignedOrders = new Set();
  drivers.forEach(d => {
    if (d.assignedOrderId) {
      allAssignedOrders.add(d.assignedOrderId);
    }
  });
  
  // Find orders waiting for driver assignment
  const waitingOrders = orders.filter((o) => 
    o.status === 'Waiting for driver' && 
    !allAssignedOrders.has(o._id)
  );
  
  if (waitingOrders.length === 0) return;  // No waiting orders
  
  // Assign idle drivers to waiting orders
  idleDrivers.forEach((driver) => {
    if (waitingOrders.length === 0) return;
    if (driver.assignedOrderId) return;  // Skip if already assigned
    
    // Find closest waiting order for this driver
    const pickupPoint = (order) => order.pickupPoint || order.deliveryPoint;
    
    const ranked = waitingOrders
      .map((order) => ({ order, distance: distanceKm(driver.location, pickupPoint(order)) }))
      .sort((a, b) => a.distance - b.distance);
    
    if (ranked.length) {
      const closestOrder = ranked[0].order;
      
      // Double-check this order wasn't already assigned by another driver
      if (allAssignedOrders.has(closestOrder._id)) {
        return;
      }
      
      // Assign driver to this order
      driver.assignedOrderId = closestOrder._id;
      driver.deliveryStop = false;
      driver.currentPhase = 'heading-to-pickup';
      driver.pickupArrivalTick = 0;
      const pickupLoc = closestOrder.pickupPoint || closestOrder.deliveryPoint;
      driver.route = densifyRoute([driver.location.slice(), pickupLoc], 8);
      
      // Update order
      closestOrder.assignedDriverId = driver._id;
      closestOrder.status = 'Driver assigned, heading to pickup';
      closestOrder.statusLog.unshift({ status: closestOrder.status, updatedAt: new Date().toISOString() });
      
      // Mark as assigned and remove from waiting list
      allAssignedOrders.add(closestOrder._id);
      const idx = waitingOrders.indexOf(closestOrder);
      if (idx !== -1) {
        waitingOrders.splice(idx, 1);
      }
      
      appendHistory({
        orderId: closestOrder._id,
        driverId: driver._id,
        event: 'assigned-for-delivery',
        notes: `${closestOrder.code} assigned to ${driver._id} for pickup and delivery`
      });
    }
  });
}

export function seedStep() {
  drivers.forEach((driver) => updateDriverLocation(driver._id));
  orders.forEach((order) => updateOrderStatus(order._id));
  reassignIdleDrivers();

  return {
    dashboard: getDashboardStats(),
    drivers,
    orders,
    history: deliveryHistory
  };
}

export function createDriver(payload) {
  const driver = {
    _id: `driver-${Date.now()}`,
    status: 'active',
    route: [],
    ...payload
  };

  drivers.push(driver);
  return driver;
}

export function updateDriver(driverId, patch) {
  const driver = drivers.find((entry) => entry._id === driverId);

  if (!driver) {
    return null;
  }

  Object.assign(driver, patch);
  return driver;
}

export function deleteDriver(driverId) {
  const index = drivers.findIndex((entry) => entry._id === driverId);

  if (index === -1) {
    return false;
  }

  drivers.splice(index, 1);
  return true;
}

export function createOrder(payload) {
  const order = {
    _id: `order-${Date.now()}`,
    code: payload.code ?? `Order #${orders.length + 1}`,
    customer: payload.customer ?? 'Unknown Customer',
    status: payload.status ?? 'Waiting for driver',
    pickupPoint: payload.pickupPoint ?? [28.615, 77.208],
    deliveryPoint: payload.deliveryPoint ?? [28.6139, 77.209],
    assignedDriverId: payload.assignedDriverId ?? null,
    statusLog: payload.statusLog ?? [{ status: payload.status ?? 'Waiting for driver', updatedAt: new Date().toISOString() }],
    createdAt: payload.createdAt ?? new Date().toISOString(),
    source: payload.source ?? 'admin'
  };

  orders.push(order);
  appendHistory({
    orderId: order._id,
    driverId: order.assignedDriverId ?? 'admin',
    event: 'created',
    notes: `${order.code} created from admin delivery panel`
  });
  return order;
}

export function updateOrder(orderId, patch) {
  const order = orders.find((entry) => entry._id === orderId);

  if (!order) {
    return null;
  }

  Object.assign(order, patch);
  return order;
}

export function deleteOrder(orderId) {
  const index = orders.findIndex((entry) => entry._id === orderId);

  if (index === -1) {
    return false;
  }

  orders.splice(index, 1);
  return true;
}
