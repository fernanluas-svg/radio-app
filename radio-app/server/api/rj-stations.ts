import { RJ_STATIONS } from "../../shared/rjStations";
import { sendJson, type ApiHandler } from "./handler";

export { type RJStation } from "../../shared/rjStations";

export const rjStationsHandler: ApiHandler = (_req, res) => {
  sendJson(res, 200, {
    region: "Rio de Janeiro",
    count: RJ_STATIONS.length,
    stations: RJ_STATIONS,
  });
};
