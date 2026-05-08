import {
  addDriver,
  addHistory,
  addOrder,
  askFleet,
  getDashboardStats,
  listDrivers,
  listHistory,
  listOrders,
  listZones,
  editDriver,
  editOrder,
  removeDriver,
  removeOrder
} from '../services/fleetService.js';

export function dashboardController(req, res) {
  res.json(getDashboardStats());
}

export function driversController(req, res) {
  res.json(listDrivers());
}

export function ordersController(req, res) {
  res.json(listOrders());
}

export function zonesController(req, res) {
  res.json(listZones());
}

export async function aiQueryController(req, res) {
  const { query } = req.body ?? {};
  try {
    const result = await askFleet(query);
    res.json(result);
  } catch (error) {
    console.error('AI query error:', error);
    res.status(500).json({ answer: `Error: ${error.message}` });
  }
}

export function historyController(req, res) {
  res.json(listHistory());
}

export function createDriverController(req, res) {
  res.status(201).json(addDriver(req.body ?? {}));
}

export function updateDriverController(req, res) {
  const updated = editDriver(req.params.id, req.body ?? {});
  if (!updated) return res.status(404).json({ error: 'Driver not found' });
  res.json(updated);
}

export function deleteDriverController(req, res) {
  const deleted = removeDriver(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Driver not found' });
  res.status(204).send();
}

export function createOrderController(req, res) {
  res.status(201).json(addOrder(req.body ?? {}));
}

export function updateOrderController(req, res) {
  const updated = editOrder(req.params.id, req.body ?? {});
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json(updated);
}

export function deleteOrderController(req, res) {
  const deleted = removeOrder(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Order not found' });
  res.status(204).send();
}

export function createHistoryController(req, res) {
  res.status(201).json(addHistory(req.body ?? {}));
}
