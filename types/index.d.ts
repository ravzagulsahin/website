// Project-wide ambient declarations to satisfy TypeScript and downstream tooling.
// Keep minimal and strictly typed; avoid `any`.

export {};

declare global {
  interface ErrorLike {
    message?: string;
  }
}

