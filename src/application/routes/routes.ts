import express from 'express';
import { publicRoutes } from './public-route';
import { privateRoutes } from './private-route';

const router = express.Router();

// Menggunakan rute publik
router.use('/v1', publicRoutes);

// Menggunakan rute privat
router.use('/v1', privateRoutes);

export default router;
