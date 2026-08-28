import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Search, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import StationCard from "@/components/StationCard";
import { usePlayer } from "@/contexts/PlayerContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useLocation } from "wouter";
import {
  fetchStationsByCountryCode,
  fetchStationsByState,
  fetchCountries,
  type RadioStationCard,
  type RadioBrowserCountry,
} from "@/lib/radioApi";

type Station = RadioStationCard;

interface CountryDef {
  code: string; // ISO 3166-1 alpha-2 (bandeira + busca na API)
  name: string; // nome em pt-BR
}

interface StateDef {
  uf: string; // sigla (ex.: RJ)
  name: string; // nome completo
}

// Países principais/populares do catálogo.
const POPULAR_COUNTRIES: CountryDef[] = [
  { code: "BR", name: "Brasil" },
  { code: "US", name: "Estados Unidos" },
  { code: "ES", name: "Espanha" },
  { code: "GB", name: "Reino Unido" },
  { code: "AR", name: "Argentina" },
  { code: "BO", name: "Bolívia" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colômbia" },
  { code: "EC", name: "Equador" },
  { code: "GY", name: "Guiana" },
  { code: "PY", name: "Paraguai" },
  { code: "PE", name: "Peru" },
  { code: "SR", name: "Suriname" },
  { code: "UY", name: "Uruguai" },
  { code: "VE", name: "Venezuela" },
  { code: "FR", name: "França" },
  { code: "JP", name: "Japão" },
  { code: "IT", name: "Itália" },
  { code: "DE", name: "Alemanha" },
  { code: "PT", name: "Portugal" },
  { code: "MX", name: "México" },
  { code: "CA", name: "Canadá" },
  { code: "NL", name: "Países Baixos" },
  { code: "CH", name: "Suíça" },
  { code: "SE", name: "Suécia" },
  { code: "AU", name: "Austrália" },
  { code: "RU", name: "Rússia" },
  { code: "IN", name: "Índia" },
  { code: "KR", name: "Coreia do Sul" },
  { code: "TR", name: "Turquia" },
];

// Estados brasileiros (catálogo ao clicar no Brasil).
const BR_STATES: StateDef[] = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
];

function flagEmoji(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export default function Explore() {
  const [view, setView] = useState<"catalog" | "states" | "stations">("catalog");
  const [selected, setSelected] = useState<CountryDef | null>(null);
  const [selectedState, setSelectedState] = useState<StateDef | null>(null);
  const [countryQuery, setCountryQuery] = useState("");
  const [stateQuery, setStateQuery] = useState("");
  const [stationQuery, setStationQuery] = useState("");

  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  const { play } = usePlayer();
  const { favorites, toggleFavorite } = useFavorites();
  const [, navigate] = useLocation();

  // Contagem de rádios por país (catálogo), indexada pelo ISO 3166-1.
  useEffect(() => {
    fetchCountries()
      .then((list: RadioBrowserCountry[]) => {
        const m = new Map<string, number>();
        list.forEach((x) => {
          const key = (x.iso_3166_1 || x.name).toUpperCase();
          m.set(key, x.stationcount);
        });
        setCounts(m);
      })
      .catch(() => {
        /* contagem opcional: ignora falha */
      });
  }, []);

  const loadCountryStations = (code: string) => {
    setIsLoading(true);
    setError(null);
    setStations([]);
    fetchStationsByCountryCode(code, 80)
      .then((list) => setStations(list))
      .catch((err) => {
        console.error("[Explore] erro ao buscar país:", err);
        setError("Erro ao carregar estações. Tente novamente.");
      })
      .finally(() => setIsLoading(false));
  };

  const loadStateStations = (stateName: string) => {
    setIsLoading(true);
    setError(null);
    setStations([]);
    fetchStationsByState(stateName, 80)
      .then((list) => setStations(list))
      .catch((err) => {
        console.error("[Explore] erro ao buscar estado:", err);
        setError("Erro ao carregar estações. Tente novamente.");
      })
      .finally(() => setIsLoading(false));
  };

  const openCountry = (c: CountryDef) => {
    if (c.code === "BR") {
      setSelected(c);
      setSelectedState(null);
      setView("states");
      return;
    }
    setSelected(c);
    setSelectedState(null);
    setView("stations");
    loadCountryStations(c.code);
  };

  const openState = (st: StateDef) => {
    setSelectedState(st);
    setStateQuery("");
    setView("stations");
    loadStateStations(st.name);
  };

  const goBack = () => {
    if (view === "states") {
      setView("catalog");
      setSelected(null);
      setSelectedState(null);
      return;
    }
    // view === "stations"
    if (selectedState) {
      setView("states");
      setSelectedState(null);
      setStations([]);
    } else {
      setView("catalog");
      setSelected(null);
      setStations([]);
    }
  };

  const filteredCountries = POPULAR_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countryQuery.trim().toLowerCase()),
  );

  const filteredStates = BR_STATES.filter((s) =>
    s.name.toLowerCase().includes(stateQuery.trim().toLowerCase()),
  );

  const visibleStations = stationQuery
    ? stations.filter((s) => s.name.toLowerCase().includes(stationQuery.toLowerCase()))
    : stations;

  const backLabel =
    view === "states"
      ? "Voltar para Países"
      : selectedState
        ? "Voltar para Estados"
        : "Voltar para Países";

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
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-card-foreground mb-3">
              Explore rádios do mundo
            </h1>
            <p className="text-lg text-muted-foreground font-sans">
              Escolha um destino e sintonize estações ao vivo
            </p>
          </div>
        </div>
      </section>

      {view === "catalog" ? (
        <>
          {/* Busca de países */}
          <section className="container py-6 md:py-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar país..."
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 md:py-4 text-base rounded-xl border-2 border-border bg-card text-card-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </section>

          {/* Grid de países */}
          <section className="container py-8 md:py-12 pb-32 md:pb-12">
            {filteredCountries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="w-10 h-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-sans text-center">
                  Nenhum país encontrado para "{countryQuery}".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredCountries.map((c) => {
                  const count = counts.get(c.code);
                  return (
                    <button
                      key={c.code}
                      onClick={() => openCountry(c)}
                      className="group flex flex-col items-center gap-2 rounded-2xl bg-card border border-border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[0_8px_30px_rgba(168,85,247,0.25)]"
                    >
                      <span className="text-5xl transition-transform duration-300 group-hover:scale-110">
                        {flagEmoji(c.code)}
                      </span>
                      <span className="font-display font-semibold text-card-foreground text-center">
                        {c.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {count != null ? `${count} rádios` : " "}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </>
      ) : view === "states" ? (
        <>
          {/* Barra de volta + título dos estados */}
          <section className="container pt-6 md:pt-8">
            <button
              onClick={goBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border bg-card text-card-foreground font-sans text-sm font-medium hover:border-primary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Países
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-card-foreground flex items-center gap-3">
                <span className="text-3xl">{flagEmoji("BR")}</span>
                Brasil — escolha um estado
              </h2>

              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar estado..."
                  value={stateQuery}
                  onChange={(e) => setStateQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 text-sm rounded-xl border-2 border-border bg-card text-card-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>
          </section>

          {/* Grid de estados */}
          <section className="container py-8 md:py-12 pb-32 md:pb-12">
            {filteredStates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="w-10 h-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-sans text-center">
                  Nenhum estado encontrado para "{stateQuery}".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredStates.map((s) => (
                  <button
                    key={s.uf}
                    onClick={() => openState(s)}
                    className="group flex flex-col items-center gap-2 rounded-2xl bg-card border border-border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[0_8px_30px_rgba(168,85,247,0.25)]"
                  >
                    <span className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary font-display font-bold text-xl transition-transform duration-300 group-hover:scale-110">
                      {s.uf}
                    </span>
                    <span className="font-display font-semibold text-card-foreground text-center">
                      {s.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <>
          {/* Barra de volta + título das estações */}
          <section className="container pt-6 md:pt-8">
            <button
              onClick={goBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border bg-card text-card-foreground font-sans text-sm font-medium hover:border-primary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-card-foreground flex items-center gap-3">
                {selectedState ? (
                  <>
                    <span className="text-3xl">{flagEmoji("BR")}</span>
                    {selectedState.name}
                  </>
                ) : (
                  <>
                    <span className="text-3xl">{selected && flagEmoji(selected.code)}</span>
                    {selected?.name}
                  </>
                )}
              </h2>

              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filtrar estações..."
                  value={stationQuery}
                  onChange={(e) => setStationQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 text-sm rounded-xl border-2 border-border bg-card text-card-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>
          </section>

          {/* Grid de estações */}
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
            ) : visibleStations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="w-10 h-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-sans text-center">
                  {stationQuery
                    ? `Nenhuma rádio encontrada para "${stationQuery}".`
                    : selectedState
                      ? `Nenhuma rádio disponível para ${selectedState.name}.`
                      : "Nenhuma rádio disponível para este país."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {visibleStations.map((station) => (
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
        </>
      )}
    </div>
  );
}
