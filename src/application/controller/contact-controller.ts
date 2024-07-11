import type { NextFunction, Request, Response } from "express";
export class contactController {
    static async getAllContact(req: Request, res: Response, next: NextFunction) {
        res.status(200).json(
            {
                message: "Hello World contact"
            }
        )
    }
}