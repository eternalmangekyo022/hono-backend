import prisma from 'db';
import { sign, verify } from 'hono/jwt';

export async function login() {}
/* 
export const register = z
  .function()
  .args(
    z.string({ required_error: 'Email is required' }).email(),
    z
      .string()
      .min(8, 'Password has to be at least 8 characters')
      .max(16, 'Password has to be at most 16 characters'),
    z.string(),
    z.string(),
    z.string()
  )
  .returns(
    z.promise(
      z.object({
        access: z.string().jwt(),
        refresh: z.string().jwt(),
      })
    )
  )
  .implement();
 */

export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string
) {
  let user;
  try {
    user = await prisma.users.create({
      data: {
        firstname: firstName,
        email,
        lastname: lastName,
        password: Buffer.from(Bun.MD5.hash(password).buffer).toString('hex'),
        phone,
      },
    });
  } catch (e) {
    throw (e as { code: string }).code === 'P2002' ? 'User already exists' : e;
  }

  const { id } = user;

  const access = await sign(
    {
      id,
      email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 /* 7 days */,
    },
    process.env.JWT_ACCESS
  );

  const refresh = await sign(
    {
      id,
      email,
      exp: Math.floor(Date.now() / 1000) + 15 * 60 /* 15 minutes */,
    },
    process.env.JWT_ACCESS
  );

  return {
    access,
    refresh,
    user,
  };
}
