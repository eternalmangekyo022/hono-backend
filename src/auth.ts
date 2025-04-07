import type { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { decode, verify } from 'hono/jwt';
import { z } from 'zod';

export default async function auth(app: Hono) {
  app.use('/auth/*', async function (c, next) {
    const access = getCookie(c, 'access');
    if (!access) return c.text('Unauthorized', 401);

    try {
      await verify(access, process.env.JWT_ACCESS);
      const { payload } = decode(access);
      z.object({ id: z.number() }).parse(payload);
      c.set('user', { id: payload.id as number });
      await next();
    } catch (e) {
      return c.text('Unauthorized', 401);
    }
  });
}
