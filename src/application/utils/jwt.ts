import jwt, {
  decode,
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";
import { ResponseError } from "../error/response-error";
export class JWTToken {
  public static generateAccessToken(payload: object): string {
    return jwt.sign(payload, Bun.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: "5s",
      algorithm: "HS256",
    });
  }
  public static generateRefreshToken(payload: object): string {
    return jwt.sign(payload, Bun.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: "30d",
      algorithm: "HS256",
    });
  }
  static async verifyAccessToken(accessToken: string): Promise<jwt.JwtPayload> {
    try {
      const decoded = jwt.verify(accessToken,Bun.env.ACCESS_TOKEN_SECRET!);
      return decoded as jwt.JwtPayload; // Mengembalikan payload token yang sudah ter-decode
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new ResponseError(401, "Token expired");
      } else if (error instanceof JsonWebTokenError) {
        throw new ResponseError(401, "Invalid Token");
      } else if (error instanceof NotBeforeError) {
        throw new ResponseError(401, "Token not active");
      } else {
        throw new ResponseError(500, "Token verification failed");
      }
    }
  }

  public static verifyRefreshToken(
    refreshToken: string
  ): Promise<jwt.JwtPayload | string> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        refreshToken,
        Bun.env.REFRESH_TOKEN_SECRET!,
        (error, decoded) => {
          if (error) {
            reject(error);
          } else if (decoded) {
            resolve(decoded as jwt.JwtPayload | string);
          } else {
            reject(new Error("Token Verification Failed"));
          }
        }
      );
    });
  }
}
