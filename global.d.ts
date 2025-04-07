export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_ACCESS: string;
      JWT_REFRESH: string;
    }
  }
}

declare module 'hono' {
  interface ContextVariableMap {
    user: {
      id: number;
    };
  }
}
