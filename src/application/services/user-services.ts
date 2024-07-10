import jwt from "jsonwebtoken";
import { prismaClient } from "../database/database";
import { ResponseError } from "../error/response-error";
import type {
    CreateUserRequest,
    loginUserRequest,
    SuccessCreateUserResponse,
    SuccessLoginUserResponse,
} from "../model/user-model";
import { UserValidation } from "../validations/user-validation";
import bcrypt from "bcrypt";
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
        const user = await prismaClient.user.findFirst({
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
        const accessToken = jwt.sign(
            {
                name: user.name,
                username: user.username,
            },
            Bun.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: '15m', algorithm: 'HS256' }
        );

        const refreshToken = jwt.sign(
            {
                name: user.name,
                username: user.username,
            },
            Bun.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: '30d', algorithm: 'HS256' }
        );

        await prismaClient.user.update({
            where: { id: user.id },
            data: {
                token: refreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 hari dari sekarang
            }
        });

        const response: SuccessLoginUserResponse = {
            username: user.username,
            password: user.password,
            token: "",
        };
        return response;
    }
}
