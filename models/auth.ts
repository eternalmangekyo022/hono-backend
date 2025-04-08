import prisma from 'db';
import { sign } from 'hono/jwt';
import { schemas } from 'schemas';
import { z } from 'zod';

export const login = z
  .function()
  .args(z.string().email(), z.string())
  .returns(
    z.promise(
      schemas.user.extend({ permissionId: z.number(), registered: z.date() })
    )
  )
  .implement(async (email, password) => {
    const user = await prisma.users.findUniqueOrThrow({
      where: {
        email,
        password: Buffer.from(Bun.MD5.hash(password).buffer).toString('hex'),
      },
      omit: {
        password: true,
      },
    });

    const { firstname, lastname, ...rest } = {
      ...user,
      firstName: user.firstname,
      lastName: user.lastname,
    };

    return rest;
  });

export const register = z
  .function()
  .args(
    z.object({
      email: z.string(),
      password: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      phone: z.string(),
    })
  )
  .returns(
    z.promise(
      z.object({
        access: z.string().jwt(),
        refresh: z.string().jwt(),
        user: schemas.user.omit({ id: true }).extend({ password: z.string() }),
      })
    )
  )
  .implement(async function register({
    email,
    firstName,
    lastName,
    password,
    phone,
  }) {
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
      switch ((e as { code: string }).code) {
        case 'P2002': {
          throw 'User already exists';
        }
        case 'P2003': {
          throw 'Permission ID error';
        }
        default: {
          throw e;
        }
      }
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

    const { id: _id, registered, permissionId, ...rest } = user;

    return {
      access,
      refresh,
      user: {
        ...rest,
        firstName: rest.lastname,
        lastName: rest.firstname,
      },
    };
  });
