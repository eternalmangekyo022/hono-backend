import { Handler } from 'hono';
import { setCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';
import * as authModel from 'm/auth';
import * as usersModel from 'm/users.model';
import { schemas } from 'schemas';
import { z } from 'zod';

export const register: Handler = async (c, next) => {
  const body = await c.req.json();

  const { success, error } = schemas.user.omit({ id: true }).safeParse(body);
  console.log(success, error);

  if (error) return c.json({ message: error }, 400);

  const { access, refresh, user } = await authModel.register(
    body.email,
    body.password,
    body.firstName,
    body.lastName,
    body.phone
  );

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

export const mockToken: Handler = async (c, next) => {
  if (c.req.header('Authorization')?.split(' ')[1] !== 'pankkixxx')
    return c.text('Unauthorized', 401);
  const access = await sign({ id: 12 }, process.env.JWT_ACCESS);
  const refresh = await sign({ id: 12 }, process.env.JWT_REFRESH);
  return c.json({ access, refresh }, 200);
};

export const patchUser: Handler = async (c, next) => {
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
