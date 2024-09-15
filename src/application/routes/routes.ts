import express from 'express';
import { publicRoutes } from './public-route';
import { privateRoutes } from './private-route';

const router = express.Router();

// Menggunakan rute publik
router.use('/public', publicRoutes);

// Menggunakan rute privat
router.use('/private', privateRoutes);

export default router;
