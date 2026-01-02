import z from "zod";

/**
 * Schema do corpo da requisição de SignIn
 */
export const SignInBodySchema = z.object({
  email: z.email().min(1, "O email é obrigatório"),
  password: z.string().min(1, "A senha é obrigatória"),
});

export type SignInBody = z.infer<typeof SignInBodySchema>;
