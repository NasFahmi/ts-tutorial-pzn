import type { NextFunction, Request, Response } from "express";
import type {
  CreateUserRequest,
  loginUserRequest,
  payload,
} from "../model/user-model";
import { UserService } from "../services/user-services";
import { ResponseError } from "../error/response-error";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { JWTToken } from "../utils/jwt";
import uuid4 from "uuid4";
import type { JwtPayload } from "jsonwebtoken";

export class UserController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const request: CreateUserRequest = req.body as CreateUserRequest;
      const response = await UserService.register(request);
      res.status(201).json({
        data: response,
      });
      // disini sebenarnya opsional ingin membuat error handling dengan middlewarea atau tidak
      // jika menggunakan middleware maka mengurangi boilerplate,
    } catch (error) {
      if (error instanceof ResponseError) {
        // throw new ResponseError(400, "Error Response");
        res.status(error.status).json({
          errors: error.message,
        });
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle Prisma-specific errors
        res.status(500).json({
          errors: `Database error occured ${error}`,
        });
        // throw new ResponseError(500, "Database error occurred");
      } else if (error instanceof z.ZodError) {
        // Handle validation errors
        const errorMessages = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        res.status(400).json({
          errors: `Error Response ${errorMessages}`,
        });
        // throw new ResponseError(400, `Validation error: ${errorMessages}`);
      } else {
        res.status(500).json({
          errors: "An unexpected error occurred",
        });
        // throw new ResponseError(500, "An unexpected error occurred");
      }
      // next(error)
    }
  }
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const request = req.body as loginUserRequest;
      const response = await UserService.login(request);
      //! meletakkan refreshToken di httpOnlyCokkies
      res.cookie("refreshToken", response.refreshToken, {
        httpOnly: true,
        secure: true, // use secure in production
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.status(200).json({
        data: {
          accessToken: response.accesToken, //!generate accessToken
          username: response.username,
        },
      });
    } catch (error) {
      if (error instanceof ResponseError) {
        // throw new ResponseError(400, "Error Response");
        res.status(error.status).json({
          errors: error.message,
        });
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle Prisma-specific errors
        res.status(500).json({
          errors: `Database error occured ${error}`,
        });
        // throw new ResponseError(500, "Database error occurred");
      } else if (error instanceof z.ZodError) {
        // Handle validation errors
        const errorMessages = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        res.status(400).json({
          errors: `Error Response ${errorMessages}`,
        });
        // throw new ResponseError(400, `Validation error: ${errorMessages}`);
      } else {
        res.status(500).json({
          errors: "An unexpected error occurred",
        });
        // throw new ResponseError(500, "An unexpected error occurred");
      }
    }
  }
  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      //! newAccessToken
      const newAccessToken = res.locals.accessToken;
      console.log('newAccessToken', newAccessToken)

      if (newAccessToken) {
        const decodedNewToken: JwtPayload = await UserService.verifyAccessToken(
          newAccessToken
        );
        const informationDecodedNewAccesToken = decodedNewToken as payload;
        const user = await UserService.getUserByName(
          informationDecodedNewAccesToken.username
        );
        return res.status(200).json({
          statuscode: 200,
          data: {
            id : user.id,
            username : user.username,
            name : user.name,
          },
          accesToken : newAccessToken, // Tambahkan accessToken baru ke dalam response
        });
      }
      // !check token
      const authHeader = req.headers["authorization"];
      console.log(`auth ${authHeader}`);
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ statuscode: 401, message: "Invalid Token" });
      }
      const accessToken = authHeader.split(" ")[1];
      // console.log(`accessToken ${accessToken}`);
      const decodedToken: JwtPayload = await UserService.verifyAccessToken(
        accessToken
      );
      // console.log(`decodedToken = ${JSON.stringify(decodedToken)}`);
      const informationDecodedToken = decodedToken as payload;
      if (!informationDecodedToken) {
        return res
          .status(401)
          .json({ statuscode: 401, message: "Invalid Token" });
      }
      const user = await UserService.getUserByName(
        informationDecodedToken.username
      );
      if (!user) {
        return res
          .status(404)
          .json({ statuscode: 404, message: "User not found" });
      }
      
      return res.status(200).json({
        statuscode: 200,
        data: {
          usernme: user.username,
          name: user.name,
          token: user.token,
        },
      });
    } catch (error) {
      if (error instanceof ResponseError) {
        res.status(error.status).json({
          errors: error.message,
        });
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        res.status(500).json({
          errors: `Database error occured ${error}`,
        });
      } else if (error instanceof z.ZodError) {
        // Handle validation errors
        const errorMessages = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        res.status(400).json({
          errors: `Error Response ${errorMessages}`,
        });
        // throw new ResponseError(400, `Validation error: ${errorMessages}`);
      } else {
        res.status(500).json({
          errors: "An unexpected error occurred",
        });
        // throw new ResponseError(500, "An unexpected error occurred");
      }
    }
  }
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ statuscode: 401, message: "Invalid Token" });
      }
      const accessToken = authHeader.split(" ")[1];
      // console.log(`accessToken ${accessToken}`);
      const decodedToken: JwtPayload = await UserService.verifyAccessToken(
        accessToken
      );
      // console.log(`decodedToken = ${JSON.stringify(decodedToken)}`);
      const informationDecodedToken = decodedToken as payload;
      if (!informationDecodedToken) {
        return res
          .status(401)
          .json({ statuscode: 401, message: "Invalid Token" });
      }
      const user = await UserService.getUserByName(
        informationDecodedToken.username
      );
      const response = await UserService.logoutUser(user!);
      res.clearCookie("refreshToken");
      // Berikan respon sukses
      return res
        .status(200)
        .json({ statusCode: 200, message: "Logout successful" });
    } catch (error) {
      if (error instanceof ResponseError) {
        res.status(error.status).json({
          errors: error.message,
        });
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        res.status(500).json({
          errors: `Database error occured ${error}`,
        });
      } else if (error instanceof z.ZodError) {
        // Handle validation errors
        const errorMessages = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        res.status(400).json({
          errors: `Error Response ${errorMessages}`,
        });
        // throw new ResponseError(400, `Validation error: ${errorMessages}`);
      } else {
        res.status(500).json({
          errors: "An unexpected error occurred",
        });
        // throw new ResponseError(500, "An unexpected error occurred");
      }
    }
  }
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    if (req.cookies?.refreshToken) {
      const refreshToken = req.cookies.jwt; //*get refresh token
      try {
        const verifyRefreshToken = await JWTToken.verifyRefreshToken(
          refreshToken
        );
        if (verifyRefreshToken) {
          //* jika berisi payload
          // console.log("Token valid, payload:");
          // Lakukan sesuatu dengan payload yang ter-decode
          const user = await UserService.getUserByRefreshToken(refreshToken); //! return user
          if (user) {
            //!jika berisi user
            // console.log("User found, generating new access token");
            const payload = {
              sub: user.id,
              name: user.name,
              jti: uuid4(),
              iat: Math.floor(Date.now() / 1000),
            };
            const accessToken = await JWTToken.generateAccessToken(payload);
            res.cookie("accessToken", accessToken, {
              httpOnly: true,
              secure: true, // use secure in production
              sameSite: "none",
              maxAge: 30 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.status(200).json({
              data: {
                accessToken: accessToken,
                username: user.username,
              },
            });
          }
        } else {
          return res.status(401).json({ message: "Unauthorized" });
        }
      } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
        console.error("Token tidak valid:", error);
      }
    } else {
      //! jika tidak ada refresh token
      return res.status(406).json({ message: "Unauthorized" });
    }
  }
}
