import type { NextFunction, Request, Response } from "express";
import { JWTToken } from "../utils/jwt";
import type { payload } from "../model/user-model";
import { TokenExpiredError } from "jsonwebtoken";
import uuid4 from "uuid4";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]; // Ambil accessToken dari header
    if (!token) {
        return res.status(401).json({ message: 'No token provided' }); // Jika tidak ada accessToken
    }

    try {
        const decodedToken = await JWTToken.verifyAccessToken(token) as payload; // Verifikasi accessToken
        // req.user = decodedToken; // Set user di request untuk akses selanjutnya
        next(); // Lanjutkan ke handler berikutnya
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            const refreshToken = req.cookies.refreshToken; // Ambil refreshToken dari cookies
            if (!refreshToken) {
                return res.status(401).json({ message: 'Unauthorized, refresh token missing' });
            }

            // Jika accessToken kedaluwarsa, verifikasi refreshToken
            try {
                const decoded = await JWTToken.verifyRefreshToken(refreshToken) as payload; // Verifikasi refreshToken
                const newPayload: payload = {
                    sub: decoded.sub,
                    username: decoded.username,
                    iat: Math.floor(Date.now() / 1000),
                    jti: uuid4()
                };
                
                // Buat accessToken baru
                const newAccessToken = await JWTToken.generateAccessToken(newPayload);
                
                // Tambahkan accessToken baru ke dalam response header dan body
                res.setHeader('Authorization', `Bearer ${newAccessToken}`);
                res.locals.accessToken = newAccessToken; // Simpan accessToken baru di response
                // req.user = decoded; // Set user di request dengan payload baru

                next(); // Lanjutkan ke handler berikutnya
            } catch (error) {
                return res.status(401).json({ message: 'Unauthorized, invalid refresh token' });
            }
        } else {
            return res.status(401).json({ message: "Token Not Valid" });
        }
    }
};
