import { Hono } from 'hono';
import users from 'r/users.routes';
import NotFound from './NotFound';
import auth from './auth';
import { error as errorHandler } from '../handlers';

const app = new Hono();

auth(app);
users(app);
app.notFound((c) => c.html(<NotFound />));
app.onError(errorHandler);

export default app;
