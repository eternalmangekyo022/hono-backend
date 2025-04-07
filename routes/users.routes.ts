import { Hono } from 'hono';
import { register, mockToken, patchUser } from 'c/users.controller.js';

export default (app: Hono<any>) => {
  const router = new Hono();
  router.post('/register', register);
  router.get('/__mock__', mockToken);

  const authRouter = new Hono();
  authRouter.patch('/:id', patchUser);

  app.route('/users', router);
  app.route('/auth/users', authRouter);
};
