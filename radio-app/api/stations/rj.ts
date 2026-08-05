import type { IncomingMessage, ServerResponse } from "node:http";
import { rjStationsHandler } from "../../server/api/rj-stations";

export default function rjHandler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
) {
  return rjStationsHandler(req, res, () => {});
}