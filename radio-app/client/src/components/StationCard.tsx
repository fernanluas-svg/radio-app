import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Station {
  id: string;
  name: string;
  country: string;
  favicon?: string;
  url: string;
}

interface StationCardProps extends Station {
  onPlay: (station: Station) => void;
}

export default function StationCard({
  id,
  name,
  country,
  favicon,
  url,
  onPlay,
}: StationCardProps) {
  const handlePlay = () => {
    onPlay({ id, name, url, country, favicon });
  };

  return (
    <div className="group relative overflow-hidden rounded-xl bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-300"
        style={{
          backgroundImage: favicon
            ? `url(${favicon})`
            : "url(/manus-storage/station-card-bg_c1984fdb.png)",
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/50 to-card" />

      {/* Content */}
      <div className="relative p-4 h-full flex flex-col justify-between">
        {/* Station Info */}
        <div className="mb-4">
          {favicon && (
            <img
              src={favicon}
              alt={name}
              className="w-12 h-12 rounded-lg object-cover mb-3 shadow-md"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <h3 className="font-display font-bold text-card-foreground text-base line-clamp-2">
            {name}
          </h3>
          <p className="text-xs text-muted-foreground font-sans mt-1">{country}</p>
        </div>

        {/* Play Button */}
        <Button
          onClick={handlePlay}
          size="sm"
          className="w-full rounded-lg bg-primary hover:bg-primary/90 text-white font-sans font-medium transition-all transform active:scale-95 shadow-md hover:shadow-lg"
        >
          <Play className="w-4 h-4 fill-current mr-2" />
          Toca aí
        </Button>
      </div>
    </div>
  );
}
