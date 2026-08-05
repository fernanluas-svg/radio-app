import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Radio } from "lucide-react";
import StationCard from "./StationCard";

interface RJStation {
  id: string;
  name: string;
  frequency: string;
  genre: string;
  city: string;
  url: string;
  favicon?: string;
}

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
  const [stations, setStations] = useState<RJStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stations/rj")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar rádios do RJ");
        return res.json();
      })
      .then((data: { stations: RJStation[] }) => setStations(data.stations))
      .catch(() => setError("Erro ao carregar rádios do RJ. Tente novamente."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="container py-8 md:py-12">
      <div className="flex items-center gap-3 mb-6">
        <Radio className="w-6 h-6 text-primary" />
        <h2 className="text-2xl md:text-3xl font-display font-bold text-card-foreground">
          Rádios do Rio de Janeiro
        </h2>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700 font-sans">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground font-sans">Carregando rádios do RJ...</p>
        </div>
      ) : stations.length > 0 ? (
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