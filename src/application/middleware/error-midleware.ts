import type { NextFunction, Request, Response } from "express";
import { ResponseError } from "../error/response-error";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export const errorMiddleware = async (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof ResponseError) {
        res.status(error.status).json({
            errors: `Validation Error ${JSON.stringify(error)}`
        })
        // throw error;
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle Prisma-specific errors
        throw new ResponseError(500, "Database error occurred");
    } else if (error instanceof z.ZodError) {
        // Handle validation errors
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new ResponseError(400, `Validation error: ${errorMessages}`);
    } else {
        console.error(error);
        throw new ResponseError(500, "An unexpected error occurred");
    }
}