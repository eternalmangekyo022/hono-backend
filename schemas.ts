import { z } from 'zod';

export namespace schemas {
  export const user = z.object(
    {
      id: z.number(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email({ message: 'Invalid email' }),
      phone: z.string({ message: 'Invalid phone' }),
    },
    {
      required_error: 'This field is required',
    }
  );

  export const patchedUser = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
  });
}
