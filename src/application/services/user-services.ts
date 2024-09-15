import { prismaClient } from "../database/database";
import { ResponseError } from "../error/response-error";
import uuid4 from "uuid4";
import type {
  CreateUserRequest,
  loginUserRequest,
  LogoutUserResponse,
  SuccessCreateUserResponse,
  SuccessLoginUserResponse,
} from "../model/user-model";
import { UserValidation } from "../validations/user-validation";
import bcrypt from "bcrypt";
import { JWTToken } from "../utils/jwt";
import type { JwtPayload } from "jsonwebtoken";
import type { User } from "@prisma/client";
export class UserService {
  // static async register(request: CreateUserRequest): Promise<SuccessCreateUserResponse> {
  //     try {
  //         // validasi registerRequest menggunakan uservalidation
  //         const registerRequest = UserValidation.registerValidation.parse(request) as CreateUserRequest;

  //         // cek apakah username sudah dibuat
  //         const totalSameUsername = await prismaClient.user.count({
  //             where: {
  //                 username: registerRequest.username,

  //             }
  //         })

  //         // jika terdapat username yang sama maka throw new error Responseerror yang sudah Dibuat di ResponseError
  //         if (totalSameUsername != 0) {
  //             throw new ResponseError(400, "Username Allready Exist")
  //         }
  //         // hasing password dan pastikan untuk await karena nanti return adalah promise
  //         const passwordHash = await bcrypt.hash(registerRequest.password, 10)
  //         const user = await prismaClient.user.create({
  //             data: {
  //                 name: registerRequest.name,
  //                 password: passwordHash,
  //                 username: registerRequest.username
  //             }
  //         })

  //         const response: SuccessCreateUserResponse = {
  //             name: user.name,
  //             username: user.username
  //         }
  //         return response

  //     } catch (error) {
  //         if (error instanceof ResponseError) {
  //             throw error;
  //         } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
  //             // Handle Prisma-specific errors
  //             throw new ResponseError(500, "Database error occurred");
  //         } else if (error instanceof z.ZodError) {
  //             // Handle validation errors
  //             const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
  //             throw new ResponseError(400, `Validation error: ${errorMessages}`);
  //         } else {
  //             console.error(error);
  //             throw new ResponseError(500, "An unexpected error occurred");
  //         }
  //     }
  // }

  //! sebenarnya servies tidak memerlukan try catch, karena services fokus kepada logika bisnis, dan try catch dapat dilakukan di alam controller
  static async register(
    request: CreateUserRequest
  ): Promise<SuccessCreateUserResponse> {
    // validasi registerRequest menggunakan uservalidation
    const registerRequest = UserValidation.registerValidation.parse(
      request
    ) as CreateUserRequest;

    // cek apakah username sudah dibuat
    const totalSameUsername = await prismaClient.user.count({
      where: {
        username: registerRequest.username,
      },
    });

    // jika terdapat username yang sama maka throw new error Responseerror yang sudah Dibuat di ResponseError
    if (totalSameUsername != 0) {
      throw new ResponseError(400, "Username Allready Exist");
    }
    // hasing password dan pastikan untuk await karena nanti return adalah promise
    const passwordHash = await bcrypt.hash(registerRequest.password, 10);
    const user = await prismaClient.user.create({
      data: {
        name: registerRequest.name,
        password: passwordHash,
        username: registerRequest.username,
      },
    });

    const response: SuccessCreateUserResponse = {
      name: user.name,
      username: user.username,
    };
    return response;
  }
  static async login(
    request: loginUserRequest
  ): Promise<SuccessLoginUserResponse> {
    const loginRequest = UserValidation.loginValidation.parse(
      request
    ) as loginUserRequest;
    let user = await prismaClient.user.findFirst({
      where: {
        username: loginRequest.username,
      },
    });

    if (!user) {
      throw new ResponseError(400, "Username Not Found");
    }
    const passwordMatch = await bcrypt.compare(
      loginRequest.password,
      user.password
    );
    if (!passwordMatch) {
      throw new ResponseError(400, "Password Not Match");
    }
    //creating a access token
    /**
         * biasanya acces token berisi 
         * {
            "iss": "https://yourapp.com", => iss (Issuer): Siapa yang menerbitkan token.
            "sub": "1234567890", =>(Subject): Tentang siapa token ini (biasanya ID pengguna).
            "aud": "https://api.yourapp.com", =>(Subject): Tentang siapa token ini (biasanya ID pengguna).
            "exp": 1516239022, => (Expiration Time): Kapan token kadaluarsa
            "nbf": 1516238022, => (Not Before): Waktu sebelum token tidak boleh diterima
            "iat": 1516238022, =>(Issued At): Kapan token diterbitkan
            "jti": "unique-token-id-123", => (JWT ID): Identifier unik untuk token ini
            "name": "John Doe",
            "email": "john@example.com",
            "role": "admin",
            "companyId": "abc123",
            "planType": "premium"
            }
         */
    console.log(user);
    console.log(uuid4());

    const accessToken = JWTToken.generateAccessToken({
      sub: user.id,
      name: user.name,
      jti: uuid4(),
      iat: Math.floor(Date.now() / 1000),
    });

    // console.log(`token ${accessToken}`);
    /**
         * {
  "jti": "unique-refresh-token-id-456",
  "sub": "1234567890",
  "exp": 1516239022,
  "iat": 1516238022,
  "aud": "https://api.yourapp.com",
  "iss": "https://yourapp.com"
}
         */

    const refreshToken = JWTToken.generateRefreshToken({
      sub: user.id,
      name: user.name,
      jti: uuid4(), // Unique identifier for this token
      iat: Math.floor(Date.now() / 1000),
      // exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30),  // 15 minutes from now
    });
    // console.log(refreshToken)

    user = await prismaClient.user.update({
      where: {
        id: user.id,
      },
      data: {
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 hari dari sekarang
      },
    });

    // console.log(userHasToken);
    const response: SuccessLoginUserResponse = {
      username: user.username,
      password: user.password,
      accesToken: accessToken,
      refreshToken: refreshToken,
    };
    return response;
  }
  static async verifyAccessToken(accessToken: string): Promise<JwtPayload> {
    try {
      // Verifikasi token menggunakan JWTToken.verifyAccessToken
      // console.log("decoded accessToken");
      const decoded = JWTToken.verifyAccessToken(accessToken); // synchronous function
      // console.log(`decode in verifyAccessToken ${JSON.stringify(decoded)}`);

      return decoded; // Mengembalikan payload token yang sudah ter-decode
    } catch (error) {
      throw new Error("Invalid Token");
    }
}


  // Fungsi untuk mengambil user berdasarkan userId dari token
  static async getUserByName(username: string): Promise<User> {
    // Mengambil user dari database berdasarkan userId
    const user = await prismaClient.user.findFirst({
      where: { username: username },
    });

    return user!;
  }
  static async getUserByRefreshToken(refreshToken: string): Promise<User> {
    const user = await prismaClient.user.findFirst({
      where: {
        token: refreshToken,
      },
    });
    return user!;
  }
  static async logoutUser(user: User): Promise<User | null> {
    // Update refreshToken menjadi null saat user logout
    const result = await prismaClient.user.update({
      where: {
        id: user.id,
      },
      data: {
        token: null, // Set refreshToken menjadi null
      },
    });

    return result;
  }
}
