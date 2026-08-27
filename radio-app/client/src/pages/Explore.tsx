import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Search } from "lucide-react";
import Header from "@/components/Header";
import StationCard from "@/components/StationCard";
import { usePlayer } from "@/contexts/PlayerContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useLocation } from "wouter";
import {
  searchStations,
  toStationCard,
  type RadioStationCard,
} from "@/lib/radioApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Países disponíveis no filtro de exploração (ISO 3166-1 alpha-2).
const COUNTRIES = [
  { code: "", name: "Todos os países" },
  { code: "BR", name: "Brasil" },
  { code: "US", name: "Estados Unidos" },
  { code: "AR", name: "Argentina" },
  { code: "PT", name: "Portugal" },
  { code: "ES", name: "Espanha" },
  { code: "MX", name: "México" },
  { code: "FR", name: "França" },
  { code: "IT", name: "Itália" },
  { code: "DE", name: "Alemanha" },
  { code: "GB", name: "Reino Unido" },
  { code: "JP", name: "Japão" },
  { code: "KR", name: "Coreia do Sul" },
  { code: "CN", name: "China" },
  { code: "IN", name: "Índia" },
  { code: "RU", name: "Rússia" },
  { code: "NL", name: "Países Baixos" },
  { code: "BE", name: "Bélgica" },
  { code: "CH", name: "Suíça" },
  { code: "AT", name: "Áustria" },
  { code: "SE", name: "Suécia" },
  { code: "NO", name: "Noruega" },
  { code: "DK", name: "Dinamarca" },
  { code: "FI", name: "Finlândia" },
  { code: "PL", name: "Polônia" },
  { code: "CZ", name: "República Tcheca" },
  { code: "TR", name: "Turquia" },
  { code: "GR", name: "Grécia" },
  { code: "RO", name: "Romênia" },
  { code: "UA", name: "Ucrânia" },
  { code: "CA", name: "Canadá" },
  { code: "AU", name: "Austrália" },
  { code: "ZA", name: "África do Sul" },
  { code: "NG", name: "Nigéria" },
  { code: "EG", name: "Egito" },
  { code: "MA", name: "Marrocos" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colômbia" },
];

type Station = RadioStationCard;

export default function Explore() {
  const [stations, setStations] = useState<Station[]>([]);
  const [country, setCountry] = useState("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { play } = usePlayer();
  const { favorites, toggleFavorite } = useFavorites();
  const [, navigate] = useLocation();

  // Busca dinâmica na Radio-Browser (sem dados locais), com filtro de país e busca.
  const load = async (c: string, q: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchStations({
        countryCode: c || undefined,
        name: q || undefined,
        limit: 60,
      });
      const list = data.map(toStationCard);
      setStations(list);
    } catch (err) {
      console.error("[Explore] erro ao buscar estações:", err);
      setError("Erro ao carregar estações. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce na busca por texto; troca de país busca imediatamente.
    const delay = query ? 400 : 0;
    const t = setTimeout(() => load(country, query), delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <Header onHomeClick={() => navigate("/")} onFavoritesClick={() => navigate("/")} />

      {/* Hero */}
      <section className="relative overflow-hidden py-8 md:py-12">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url(/manus-storage/hero-background_3f1b0d0a.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-card-foreground mb-3 text-center">
              Explore rádios do mundo
            </h1>
            <p className="text-lg text-muted-foreground font-sans text-center">
              Descubra estações de qualquer país, ao vivo
            </p>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="container py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <label className="text-sm font-sans font-medium text-card-foreground">
            País:
          </label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code || "all"} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar rádios..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-4 py-3 md:py-4 text-base rounded-xl border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="container py-8 md:py-12 pb-32 md:pb-12">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700 font-sans">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground font-sans">Carregando estações...</p>
          </div>
        ) : stations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-10 h-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-sans text-center">
              Nenhuma rádio encontrada. Tenta outro termo ou país?
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {stations.map((station) => (
              <StationCard
                key={station.id}
                id={station.id}
                name={station.name}
                country={station.country}
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
