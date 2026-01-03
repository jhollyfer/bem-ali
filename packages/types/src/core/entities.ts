import z from "zod";

/**
 * Torna algumas propriedades opcionais em um tipo
 */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

const RoleSchema = z.enum(["MASTER", "ADMINISTRATOR", "OWNER", "CUSTOMER"]);

/**
 * JWT Payload Schema
 */
export const JWTPayloadSchema = z.object({
  sub: z.string(),
  email: z.email(),
  role: RoleSchema,
  type: z.enum(["access", "refresh"]),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

/**
 * Meta de Paginação Schema
 */
export const MetaSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  last_page: z.number().int().positive(),
  first_page: z.number().int().positive(),
});

export type Meta = z.infer<typeof MetaSchema>;

/**
 * Factory para Resposta Paginada
 */
export const PaginatedSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    meta: MetaSchema,
  });

export type Paginated<Entity> = {
  data: Entity[];
  meta: Meta;
};

/**
 * Entidade Base Schema
 */
export const BaseSchema = z.object({
  id: z.uuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullable(),
});

export type Base = z.infer<typeof BaseSchema>;

export const UserSchema = BaseSchema.extend({
  name: z.string().min(1).max(255),
  email: z.email().max(255),
  password: z.string().min(6).max(255),
  role: RoleSchema,
});

export type User = z.infer<typeof UserSchema>;

export const UserFindByPayloadSchema = UserSchema.pick({
  id: true,
  email: true,
})
  .partial()
  .extend({
    exact: z.boolean().optional().default(false),
  });

export type UserFindByPayload = z.infer<typeof UserFindByPayloadSchema>;

const UserBasePayloadSchema = UserSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const UserCreatePayloadSchema = UserBasePayloadSchema;

export type UserCreatePayload = z.infer<typeof UserCreatePayloadSchema>;

export const UserUpdatePayloadSchema = UserBasePayloadSchema.partial().extend({
  id: z.uuid(),
});

export type UserUpdatePayload = z.infer<typeof UserUpdatePayloadSchema>;

export const UserQueryPayloadSchema = UserSchema.pick({
  name: true,
  email: true,
  role: true,
  deleted_at: true,
})
  .partial()
  .extend({
    page: z.number().int().positive().optional(),
    per_page: z.number().int().positive().optional(),
    search: z.string().optional(),
  });

export type UserQueryPayload = z.infer<typeof UserQueryPayloadSchema>;
