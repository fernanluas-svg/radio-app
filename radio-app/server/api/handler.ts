import type { IncomingMessage, ServerResponse } from "node:http";

export type ApiHandler = (
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
  next: () => void,
) => void;

export function sendJson(res: ServerResponse, status: number, data: unknown) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-cache",
  });
  res.end(body);
}

export function sendError(res: ServerResponse, status: number, message: string) {
  sendJson(res, status, { error: message });
}

/**
 * Creates a connect/express-style middleware that routes `/api` requests
 * by pathname (the part after the mount path). Shared between the Vite dev
 * server and the production Express server so APIs work in both modes.
 */
export function createApiRouter(routes: Record<string, ApiHandler>) {
  return (
    req: IncomingMessage & { body?: unknown },
    res: ServerResponse,
    next: () => void,
  ) => {
    const pathname = (req.url ?? "/").split("?")[0];
    const handler = routes[pathname];
    if (!handler) {
      next();
      return;
    }
    handler(req, res, next);
  };
}
