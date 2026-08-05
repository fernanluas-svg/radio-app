import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import StationCard from "@/components/StationCard";
import RadioPlayer from "@/components/RadioPlayer";
import RJSection from "@/components/RJSection";
import {
  searchStations,
  toStationCard,
  type RadioStationCard,
} from "@/lib/radioApi";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Station extends RadioStationCard {
  country: string;
  favicon?: string;
  tags?: string;
}

const COUNTRIES = [
  { code: "BR", name: "Brasil" },
  { code: "US", name: "Estados Unidos" },
  { code: "MX", name: "México" },
  { code: "AR", name: "Argentina" },
  { code: "ES", name: "Espanha" },
  { code: "PT", name: "Portugal" },
  { code: "FR", name: "França" },
  { code: "IT", name: "Itália" },
  { code: "DE", name: "Alemanha" },
  { code: "JP", name: "Japão" },
];

// Estados brasileiros mais comuns (busca por estado na Radio-Browser).
const STATES = [
  { code: "", name: "Todos os estados" },
  { code: "Rio de Janeiro", name: "Rio de Janeiro" },
  { code: "São Paulo", name: "São Paulo" },
  { code: "Minas Gerais", name: "Minas Gerais" },
  { code: "Bahia", name: "Bahia" },
  { code: "Rio Grande do Sul", name: "Rio Grande do Sul" },
  { code: "Paraná", name: "Paraná" },
  { code: "Pernambuco", name: "Pernambuco" },
  { code: "Ceará", name: "Ceará" },
];

export default function Home() {
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("BR");
  const [selectedState, setSelectedState] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);

  // Busca estações direto na Radio-Browser API (com fallback de proxy CORS).
  const fetchStations = async (country: string, query: string = "", state: string = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const apiStations = await searchStations({
        countryCode: country,
        name: query || undefined,
        state: state || undefined,
      });
      const list = apiStations.map(toStationCard);
      console.log(`[Home] ${list.length} estações carregadas (${country}${state ? " / " + state : ""})`);
      setStations(list);
      setFilteredStations(list);
    } catch (err) {
      console.error("[Home] Erro ao buscar estações:", err);
      setError("Erro ao carregar estações. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStations("BR");
    return () => {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }
    };
  }, []);

  // Handle country change
  const handleCountryChange = (country: string) => {
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
      searchTimer.current = null;
    }
    setSelectedCountry(country);
    setSelectedState("");
    setSearchQuery("");
    fetchStations(country);
  };

  // Handle state change (estados brasileiros)
  const handleStateChange = (state: string) => {
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
      searchTimer.current = null;
    }
    setSelectedState(state);
    setSearchQuery("");
    fetchStations(selectedCountry, "", state);
  };

  // Handle search (debounced to avoid a request per keystroke)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    searchTimer.current = setTimeout(() => {
      fetchStations(selectedCountry, query, selectedState);
    }, 400);
  }, [selectedCountry, selectedState]);

  const handleStationPlay = (station: Station) => {
    setCurrentStation(station);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <Header />

      {/* Hero Section */}
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
              Descubra rádios incríveis
            </h1>
            <p className="text-lg text-muted-foreground font-sans text-center mb-8">
              Transmita estações de rádio do Brasil e do mundo inteiro
            </p>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar rádios..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 pr-4 py-3 md:py-4 text-base rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* RJ Stations - lista curada local */}
      <RJSection onPlay={handleStationPlay} />

      {/* Filters */}
      <section className="container py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <label className="text-sm font-sans font-medium text-card-foreground">
            País:
          </label>
          <Select value={selectedCountry} onValueChange={handleCountryChange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCountry === "BR" && (
            <>
              <label className="text-sm font-sans font-medium text-card-foreground">
                Estado:
              </label>
              <Select value={selectedState} onValueChange={handleStateChange}>
                <SelectTrigger className="w-full md:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map((state) => (
                    <SelectItem key={state.code || "all"} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </section>

      {/* Stations Grid */}
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
        ) : filteredStations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-10 h-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-sans text-center">
              Nenhuma rádio encontrada. Tenta outro termo?
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredStations.map((station) => (
              <StationCard
                key={station.id}
                id={station.id}
                name={station.name}
                country={station.country}
                favicon={station.favicon}
                url={station.url}
                onPlay={handleStationPlay}
              />
            ))}
          </div>
        )}
      </section>

      {/* Radio Player */}
      {currentStation && (
        <RadioPlayer
          station={currentStation}
          onClose={() => setCurrentStation(null)}
        />
      )}
    </div>
  );
}
