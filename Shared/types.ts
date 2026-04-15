import { z } from "zod";

export type SuccessResponse<T = void> = {
  success: true;
  message: string;
} & (T extends void ? {} : { data: T });

export type ErrorResponse<T = void> = {
  success: false;
  error: string;
  isFormError?: boolean;
} & (T extends void ? {} : { data: T });

export const loginSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Za-z0-9_]+$/),
  password: z
    .string()
    .min(6)
    .max(20)
    .regex(/^[A-Za-z0-9_]+$/),
});
