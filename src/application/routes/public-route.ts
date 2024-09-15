import express from 'express';
import { UserController } from '../controller/user-controller';

export const publicRoutes = express.Router();

// Rute publik
publicRoutes.post('/users/register', UserController.register);
publicRoutes.post('/users/login', UserController.login);
publicRoutes.post('/users/refresh-token', UserController.refreshToken);
