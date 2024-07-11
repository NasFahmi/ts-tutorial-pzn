import express from 'express';
import { userRoutes } from "./user-route";
import { authMiddleware } from '../middleware/auth-middleware';
import { contactRoutes } from './contact-route';
const router = express.Router();

router.use('/users', userRoutes);
router.use('/contact',authMiddleware,contactRoutes)
export default router;