import type { NextFunction, Request, Response } from "express";
import { JWTToken } from "../utils/jwt";
import type { payload } from "../model/user-model";
import { TokenExpiredError } from "jsonwebtoken";
import uuid4 from "uuid4";
import { ResponseError } from "../error/response-error";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = await JWTToken.verifyAccessToken(token) as payload;
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof ResponseError) {
            if (error.status === 401 && error.message === "Token expired") {
                const refreshToken = req.cookies.refreshToken;
                if (!refreshToken) {
                    return res.status(401).json({ message: 'Refresh token not found' });
                }
                console.log('refreshToken', refreshToken)
                try {
                    const decoded = await JWTToken.verifyRefreshToken(refreshToken) as payload;
                    const newPayload: payload = {
                        sub: decoded.sub,
                        username: decoded.username,
                        iat: Math.floor(Date.now() / 1000),
                        jti: uuid4()
                    };
                    const newAccessToken = await JWTToken.generateAccessToken(newPayload);
                    
                    // res.setHeader('Authorization', `Bearer ${newAccessToken}`);
                    res.locals.accessToken = newAccessToken; 
                    req.user = newPayload;
                    console.log('success generate new accessToken')
                    next();
                } catch (refreshError) {
                    if (refreshError instanceof ResponseError) {
                        return res.status(refreshError.status).json({ message: refreshError.message });
                    }
                    return res.status(401).json({ message: 'Invalid refresh token' });
                }
            } else {
                return res.status(error.status).json({ message: error.message });
            }
        } else {
            console.error('Unexpected error in auth middleware:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
};