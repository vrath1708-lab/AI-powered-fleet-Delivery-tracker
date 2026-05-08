import {
  appendHistory,
  createDriver,
  createOrder,
  deleteDriver,
  deleteOrder,
  deliveryHistory,
  drivers,
  getDashboardStats,
  getDelayedOrders,
  getClosestDriverForOrder,
  orders,
  seedStep,
  suggestRoute,
  updateDriver,
  updateOrder,
  zones
} from '../../../database/src/state.js';
import { queryFleetWithAgents } from '../../../ai/src/agentLogic.js';

export { getDashboardStats, drivers, orders, zones, deliveryHistory, getDelayedOrders, getClosestDriverForOrder, suggestRoute };

export function listDrivers() { return drivers; }
export function listOrders() { return orders; }
export function listZones() { return zones; }
export function listHistory() { return deliveryHistory; }

export async function askFleet(query) {
  return queryFleetWithAgents(query ?? '');
}

export function stepSimulation() {
  return seedStep();
}

export function addDriver(payload) { return createDriver(payload); }
export function editDriver(driverId, patch) { return updateDriver(driverId, patch); }
export function removeDriver(driverId) { return deleteDriver(driverId); }

export function addOrder(payload) { return createOrder(payload); }
export function editOrder(orderId, patch) { return updateOrder(orderId, patch); }
export function removeOrder(orderId) { return deleteOrder(orderId); }

export function addHistory(payload) {
  return appendHistory(payload);
}
