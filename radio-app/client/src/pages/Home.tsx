import { useState, useEffect } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import StationCard from "@/components/StationCard";
import RadioPlayer from "@/components/RadioPlayer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Station {
  id: string;
  name: string;
  url: string;
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

export default function Home() {
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("BR");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);

  // Fetch stations from Radio Browser API
  const fetchStations = async (country: string, query: string = "") => {
    setIsLoading(true);
    setError(null);
    try {
      let url = `https://de1.api.radio-browser.info/json/stations/search?`;

      if (query) {
        url += `name=${encodeURIComponent(query)}&`;
      }

      url += `countrycode=${country}&limit=50&order=votes&reverse=true`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Erro ao buscar estações");

      const data = await response.json();
      setStations(data);
      setFilteredStations(data);
    } catch (err) {
      setError("Erro ao carregar estações. Tente novamente.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStations("BR");
  }, []);

  // Handle country change
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSearchQuery("");
    fetchStations(country);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      fetchStations(selectedCountry, query);
    } else {
      fetchStations(selectedCountry);
    }
  };

  const handleStationPlay = (station: Station) => {
    setCurrentStation(station);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
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
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-3 text-center">
              Descubra rádios incríveis
            </h1>
            <p className="text-lg text-gray-600 font-sans text-center mb-8">
              Transmita estações de rádio do Brasil e do mundo inteiro
            </p>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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

      {/* Filters */}
      <section className="container py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <label className="text-sm font-sans font-medium text-gray-700">
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
            <p className="text-gray-600 font-sans">Carregando estações...</p>
          </div>
        ) : filteredStations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-10 h-10 text-gray-300 mb-4" />
            <p className="text-gray-600 font-sans text-center">
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
