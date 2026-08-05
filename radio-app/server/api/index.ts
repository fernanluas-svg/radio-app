import { createApiRouter, sendJson, type ApiHandler } from "./handler";
import { rjStationsHandler } from "./rj-stations";
import { searchStationsHandler } from "./search";

const healthHandler: ApiHandler = (_req, res) => {
  sendJson(res, 200, { status: "ok" });
};

/**
 * Registro central das APIs. Para adicionar uma nova API:
 * 1. Crie um módulo em `server/api/` com um `ApiHandler`.
 * 2. Registre aqui no objeto `routes`.
 */
export const apiRouter = createApiRouter({
  "/health": healthHandler,
  "/stations/search": searchStationsHandler,
  "/stations/rj": rjStationsHandler,
});
