import type { IncomingMessage, ServerResponse } from "node:http";
import { searchStationsHandler } from "../../server/api/search";

export default function searchHandler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
) {
  return searchStationsHandler(req as never, res, () => {});
}