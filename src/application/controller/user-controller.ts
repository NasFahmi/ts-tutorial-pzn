import type { NextFunction, Request, Response } from "express";
import type { CreateUserRequest } from "../model/user-model";
import { UserService } from "../services/user-services";
import { ResponseError } from "../error/response-error";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export class UserController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const request: CreateUserRequest = req.body as CreateUserRequest
            const response = await UserService.register(request)
            res.status(201).json({
                'data': response
            })
            // disini sebenarnya opsional ingin membuat error handling dengan middlewarea atau tidak
            // jika menggunakan middleware maka mengurangi boilerplate,
        } catch (error) {
            if (error instanceof ResponseError) {
                // throw new ResponseError(400, "Error Response");
                res.status(error.status).json({
                    'errors': error.message
                })
            } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
                // Handle Prisma-specific errors
                res.status(500).json({
                    'errors': `Database error occured ${error}`
                })
                // throw new ResponseError(500, "Database error occurred");
            } else if (error instanceof z.ZodError) {
                // Handle validation errors
                const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
                res.status(400).json({
                    'errors': `Error Response ${errorMessages}`
                })
                // throw new ResponseError(400, `Validation error: ${errorMessages}`);
            } else {
                res.status(500).json({
                    errors: "An unexpected error occurred"
                })
                // throw new ResponseError(500, "An unexpected error occurred");
            }
            // next(error)
        }
    }
}