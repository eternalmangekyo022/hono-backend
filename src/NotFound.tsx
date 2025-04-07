import { FC } from 'hono/jsx';

const NotFound: FC = () => {
  return (
    <html>
      <head>
        <title>404 - Not Found</title>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      </head>
      <body>
        <div class="w-screen h-screen flex flex-col items-center gap-5 bg-zinc-800">
          <h1 class="text-amber-500 text-6xl mt-[5%]">🚧404 Wait!</h1>
          <h2 class="text-2xl text-neutral-300">
            Are you sure you want to go here?
          </h2>
        </div>
      </body>
    </html>
  );
};
export default NotFound;
