import { sendError, sendJson, type ApiHandler } from "./handler";

const RADIO_BROWSER_BASE = "https://de1.api.radio-browser.info";

/**
 * Proxy de busca de estações para o radio-browser.
 * Chamar a API externa direto do navegador pode falhar por CORS/rede;
 * este endpoint repassa a busca pelo servidor com origem mesma do app.
 *
 * Query: ?name=... &countrycode=BR &limit=50 &order=votes &reverse=true
 */
export const searchStationsHandler: ApiHandler = async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    const query = url.searchParams.get("name") ?? "";
    const country = url.searchParams.get("countrycode") ?? "";
    const limit = url.searchParams.get("limit") ?? "50";
    const order = url.searchParams.get("order") ?? "votes";
    const reverse = url.searchParams.get("reverse") ?? "true";

    const remote = new URL("/json/stations/search", RADIO_BROWSER_BASE);
    if (query) remote.searchParams.set("name", query);
    if (country) remote.searchParams.set("countrycode", country);
    remote.searchParams.set("limit", limit);
    remote.searchParams.set("order", order);
    remote.searchParams.set("reverse", reverse);

    const resp = await fetch(remote.toString(), {
      headers: { "User-Agent": "WaveFM/1.0" },
    });
    if (!resp.ok) {
      return sendError(res, resp.status, "Erro ao buscar estações no radio-browser");
    }

    const data = await resp.json();
    sendJson(res, 200, { stations: data });
  } catch (err) {
    console.error("[api/search] error:", err);
    sendError(res, 502, "Erro ao acessar o radio-browser");
  }
};