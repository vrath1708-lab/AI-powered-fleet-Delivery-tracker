import { Router } from 'express';
import {
  aiQueryController,
  createDriverController,
  createHistoryController,
  createOrderController,
  dashboardController,
  deleteDriverController,
  deleteOrderController,
  driversController,
  historyController,
  ordersController,
  updateDriverController,
  updateOrderController,
  zonesController
} from '../controllers/dashboardController.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'fleet-server' });
});

router.get('/dashboard', dashboardController);
router.get('/drivers', driversController);
router.get('/history', historyController);
router.get('/orders', ordersController);
router.get('/zones', zonesController);
router.post('/ai/query', aiQueryController);
router.post('/drivers', createDriverController);
router.patch('/drivers/:id', updateDriverController);
router.delete('/drivers/:id', deleteDriverController);
router.post('/orders', createOrderController);
router.patch('/orders/:id', updateOrderController);
router.delete('/orders/:id', deleteOrderController);
router.post('/history', createHistoryController);

export default router;
