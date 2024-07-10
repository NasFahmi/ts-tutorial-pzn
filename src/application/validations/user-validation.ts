import { z, ZodType } from "zod";

export class UserValidation {
    static readonly registerValidation: ZodType = z.object({
        username: z.string().min(1).max(100),
        password: z.string().min(1).max(100),
        name: z.string().min(1).max(100),
    })
    static readonly loginValidation : ZodType = z.object({
        username: z.string().min(1).max(100),
        password: z.string().min(1).max(100),
    })
}