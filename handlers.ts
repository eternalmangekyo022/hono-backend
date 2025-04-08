import type { ErrorHandler } from 'hono';

export const error: ErrorHandler = async (err, c) => {
  return c.json({ error: err.message });
};
