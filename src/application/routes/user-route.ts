import express from "express";
import { UserController } from "../controller/user-controller";

export const userRoutes = express.Router();
userRoutes.post('/register', UserController.register);
userRoutes.post('/login', UserController.login);
userRoutes.post('/refresh-token',UserController.refreshToken);
userRoutes.get('/me',UserController.me);
userRoutes.post('/logout',UserController.logout);