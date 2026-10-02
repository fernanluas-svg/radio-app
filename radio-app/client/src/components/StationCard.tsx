import { Play, Star } from "lucide-react";
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
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export default function StationCard({
  id,
  name,
  country,
  favicon,
  url,
  onPlay,
  isFavorite = false,
  onToggleFavorite,
}: StationCardProps) {
  const handlePlay = () => {
    onPlay({ id, name, url, country, favicon });
  };

  const handleToggleFavorite = () => {
    onToggleFavorite?.(id);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105">
      {/* Favorite Star */}
      <button
        onClick={handleToggleFavorite}
        className="absolute top-2 right-2 md:top-3 md:right-3 z-20 p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label={
          isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
        }
        title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Star
          className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${
            isFavorite
              ? "fill-yellow-400 text-yellow-400"
              : "fill-transparent text-muted-foreground/70 group-hover:text-muted-foreground"
          }`}
        />
      </button>
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
      <div className="relative p-3 md:p-4 h-full flex flex-col justify-between">
        {/* Station Info */}
        <div className="mb-3 md:mb-4">
          {favicon && (
            <img
              src={favicon}
              alt={name}
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover mb-2 md:mb-3 shadow-md"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <h3 className="font-display font-bold text-card-foreground text-sm md:text-base line-clamp-2 break-words">
            {name}
          </h3>
          <p className="text-[11px] md:text-xs text-muted-foreground font-sans mt-1 line-clamp-1 break-words">
            {country}
          </p>
        </div>

        {/* Play Button */}
        <Button
          onClick={handlePlay}
          size="sm"
          className="w-full rounded-lg bg-primary hover:bg-primary/90 text-white font-sans font-medium text-xs md:text-sm transition-all transform active:scale-95 shadow-md hover:shadow-lg"
        >
          <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current mr-1 md:mr-2" />
          Toca aí
        </Button>
      </div>
    </div>
  );
}
