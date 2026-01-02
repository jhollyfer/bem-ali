/**
 * Make some property optional an type
 *
 * @example
 * ```typescript
 * type Post {
 *  id: string;
 *  name: string;
 *  email: string;
 * }
 *
 * Optional<Post, 'name' | 'email>
 * ```
 */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export interface JWTPayload {
  sub: string;
  email: string;
  // role: keyof typeof ERole;
  type: 'access' | 'refresh';
}

export interface Meta {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
  first_page: number;
}

export interface Paginated<Entity> {
  data: Entity[];
  meta: Meta;
}

export interface Base {
  id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}
