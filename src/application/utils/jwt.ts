import jwt, { decode, JsonWebTokenError } from "jsonwebtoken";
export class JWTToken {
    public static generateAccessToken(payload: object): string {
        return jwt.sign(payload, Bun.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: '15m', algorithm: 'HS256' })
    }
    public static generateRefreshToken(payload: object): string {
        return jwt.sign(payload, Bun.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: '30d', algorithm: 'HS256' })
    }
    public static verifyAccessToken(token:string) : jwt.JwtPayload | string {
        return jwt.verify(token,Bun.env.ACCESS_TOKEN_SECRET!)
    }
    public static verifyRefreshToken(refreshToken: string): Promise<jwt.JwtPayload | string> {
        return new Promise((resolve, reject) => {
            jwt.verify(refreshToken, Bun.env.REFRESH_TOKEN_SECRET!, (error, decoded) => {
                if (error) {
                    reject(error);
                } else if(decoded) {
                    resolve(decoded as jwt.JwtPayload | string);
                }else{
                    reject(new Error("Token Verification Failed"))
                }
            });
        });
    }
}