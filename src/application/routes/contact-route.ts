import express from "express";
import { contactController } from "../controller/contact-controller";

export const contactRoutes = express.Router();
contactRoutes.get('/', contactController.getAllContact);