import { z, ZodType } from "zod";

export class ContactValidation {
  //   firstname String @db.VarChar(100)
  //   lastname String @db.VarChar(100)
  //   email String? @db.VarChar(100)
  //   phone String? @db.VarChar(100)
  static readonly contactValidation: ZodType = z.object({
    firstname: z.string().min(1).max(100),
    lastname: z.string().min(1).max(100),
    email: z.string().min(1).max(100),
    phone: z.string().min(1).max(100),
  });
}
