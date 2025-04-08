import { Handler } from 'hono';
import { setCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';
import * as authModel from 'm/auth';
import * as usersModel from 'm/users.model';
import { schemas } from 'schemas';
import { z } from 'zod';

export const register: Handler = async (c) => {
  const userBodySchema = schemas.user
    .omit({ id: true })
    .extend({ password: z.string() });

  type userBody<O extends { partial?: boolean } = {}> =
    O['partial'] extends true
      ? z.infer<ReturnType<typeof userBodySchema.partial>>
      : z.infer<typeof userBodySchema>;

  const body = await c.req.json<userBody<{ partial: true }>>();

  const result = schemas.user.omit({ id: true }).safeParse(body);
  if (!result.success)
    return c.json({ message: result.error || 'Invalid format' }, 400);

  const { access, refresh, user } = await authModel.register(body as userBody);

  setCookie(c, 'access', access, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 15,
  });

  setCookie(c, 'refresh', refresh, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  return c.json(user);
};

export const mockToken: Handler = async (c) => {
  if (c.req.header('Authorization')?.split(' ')[1] !== 'pankkixxx')
    return c.text('Unauthorized', 401);
  const access = await sign({ id: 12 }, process.env.JWT_ACCESS);
  const refresh = await sign({ id: 12 }, process.env.JWT_REFRESH);
  return c.json({ access, refresh }, 200);
};

export const patchUser: Handler = async (c) => {
  if (c.var.user.id.toString() !== c.req.param('id'))
    return c.json({ message: 'Unauthorized' }, 403);
  try {
    let parsedUser;
    try {
      parsedUser = schemas.patchedUser.parse(await c.req.json());
    } catch {
      return c.json({ message: 'Error validating provided payload' }, 401);
    }

    const { id } = z.object({ id: z.string() }).parse(c.req.param());

    await usersModel.patchUser(parseInt(id), parsedUser);
    return c.text('ok', 200);
  } catch (e) {
    return c.json({ message: e }, 400);
  }
};

export const login: Handler = async (c) => {
  const loginBodySchema = z.object({
    email: z.string(),
    password: z.string(),
  });

  type bodySchema<T extends { partial?: boolean } = {}> = z.infer<
    T['partial'] extends true
      ? ReturnType<typeof loginBodySchema.partial>
      : typeof loginBodySchema
  >;

  const body = await c.req.json<bodySchema<{ partial: true }>>();

  const { success, data } = loginBodySchema.safeParse(body);
  if (!success) {
    return c.json(
      {
        message: 'The body provided had wrong format.',
      },
      400
    );
  }
  return c.json(await authModel.login(data.email, data.password));
};
