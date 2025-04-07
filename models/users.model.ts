import db from 'db';
import { z } from 'zod';

export const patchUser = z
  .function()
  .args(
    z.number(),
    z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
    })
  )
  .returns(z.promise(z.void()))
  .implement(async (id, { firstName, lastName, phone }) => {
    await db.users.update({
      where: {
        id,
      },
      data: {
        firstname: firstName,
        lastname: lastName,
        phone,
      },
    });
  });
