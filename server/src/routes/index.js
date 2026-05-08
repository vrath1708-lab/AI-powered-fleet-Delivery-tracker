import { Router } from 'express';
import fleetRoutes from './fleetRoutes.js';

const router = Router();

router.use('/api', fleetRoutes);

export default router;
