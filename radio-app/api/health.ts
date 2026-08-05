import type { IncomingMessage, ServerResponse } from "node:http";
import { sendJson } from "../server/api/handler";

export default function healthHandler(
  _req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
) {
  sendJson(res, 200, { status: "ok" });
}