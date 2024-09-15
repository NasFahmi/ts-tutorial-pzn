import express from 'express';
import { UserController } from '../controller/user-controller';

export const publicRoutes = express.Router();

// Rute publik
publicRoutes.post('/register', UserController.register);
publicRoutes.post('/login', UserController.login);
publicRoutes.post('/refresh-token', UserController.refreshToken);
