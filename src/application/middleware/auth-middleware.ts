import type { NextFunction, Request, Response } from "express";
import { JWTToken } from "../utils/jwt";
import type { payload } from "../model/user-model";
import { TokenExpiredError } from "jsonwebtoken";
import uuid4 from "uuid4";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]; //get AccesToken dari header
    if (!token) return res.status(401).json({ message: 'No token provided' }) //jika tidak ada AccesToken
    try {
        await JWTToken.verifyAccessToken(token) as payload; //! berisi payload
        next();
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) { //! jika tidak ada refresh token
                return res.status(401).json({ message: 'Unauthorized' });
            }
            //! jika ada refresh token, namun AccestokenExpired
            //! generateAccessTokenBaru dengan verify refreshtoken terlebih dahulu
            try {
                const decoded = await JWTToken.verifyRefreshToken(refreshToken) as payload; //hasil payload
                const newPayload : payload = {
                    sub : decoded.sub,
                    username : decoded.username,
                    iat :Math.floor(Date.now() / 1000),
                    jti: uuid4()
                }
                const newAccesToken = await JWTToken.generateAccessToken(newPayload);
                res.setHeader('Authorization', `Bearer ${newAccesToken}`);
                next()
                // const decoded = await JWTToken.verifyRefreshToken(refreshToken);
            } catch (error) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            //! set header dengan token baru
        }
        else{
            return res.status(401).json({
                message:"Token Not Valid"
            })
        }


    }
    // if(!token) return res.status(401).json({message: 'Token not found'}
    //     try{
    //         const decoded = await jwt.verify(token, process.env.JWT_SECRET as string);
    //         req.user = decoded;
    //         next();
    //         }catch(err){

}