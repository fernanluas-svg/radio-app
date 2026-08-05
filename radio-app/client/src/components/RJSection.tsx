import { RJ_STATIONS, type RJStation } from "@shared/rjStations";
import { Radio } from "lucide-react";
import StationCard from "./StationCard";

function toStationCard(station: RJStation) {
  return {
    id: station.id,
    name: station.name,
    url: station.url,
    country: `RJ • ${station.city}`,
    favicon: station.favicon,
  };
}

export default function RJSection({
  onPlay,
}: {
  onPlay: (station: {
    id: string;
    name: string;
    url: string;
    country: string;
    favicon?: string;
  }) => void;
}) {
  const stations = RJ_STATIONS;

  return (
    <section className="container py-8 md:py-12">
      <div className="flex items-center gap-3 mb-6">
        <Radio className="w-6 h-6 text-primary" />
        <h2 className="text-2xl md:text-3xl font-display font-bold text-card-foreground">
          Rádios do Rio de Janeiro
        </h2>
      </div>

      {stations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {stations.map((station) => (
            <StationCard
              key={station.id}
              {...toStationCard(station)}
              onPlay={onPlay}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}