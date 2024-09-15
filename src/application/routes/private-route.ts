import express from 'express';
import { UserController } from '../controller/user-controller';
import { contactController } from '../controller/contact-controller';
import { authMiddleware } from '../middleware/auth-middleware';

export const privateRoutes = express.Router();

// Rute yang memerlukan autentikasi
privateRoutes.use(authMiddleware);

privateRoutes.get('/users/me', UserController.me);
privateRoutes.post('/users/logout', UserController.logout);
privateRoutes.get('/contact', contactController.getAllContact);
