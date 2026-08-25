import { History as HistoryIcon, Trash2, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import StationCard from "@/components/StationCard";
import { usePlayer } from "@/contexts/PlayerContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useLocation } from "wouter";

export default function History() {
  const { history, play, clearHistory } = usePlayer();
  const { favorites, toggleFavorite } = useFavorites();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <Header onHomeClick={() => navigate("/")} onFavoritesClick={() => navigate("/")} />

      <section className="container py-8 md:py-12">
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <HistoryIcon className="w-7 h-7 text-primary" />
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-card-foreground">
                Histórico
              </h1>
              <p className="text-sm text-muted-foreground font-sans">
                Rádios que você já escutou — toque para ouvir de novo
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Limpar histórico
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <HistoryIcon className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-sans">
              Você ainda não escutou nenhuma rádio.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 flex items-center gap-2 text-primary font-sans text-sm hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o início
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {history.map((station) => (
              <StationCard
                key={station.url}
                id={station.id}
                name={station.name}
                country={station.country ?? ""}
                favicon={station.favicon}
                url={station.url}
                onPlay={play}
                isFavorite={favorites.has(station.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
