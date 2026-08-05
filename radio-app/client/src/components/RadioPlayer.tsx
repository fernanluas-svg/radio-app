import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Estações cujo servidor de áudio só aceita HTTP (não suportam TLS/HTTPS).
// Se o cliente tentar https nesses hosts, o browser lança ERR_SSL_PROTOCOL_ERROR.
const HTTP_ONLY_STREAM_HOSTS = ["a1rj.streams.com.br"];

// Normaliza a URL de streaming: para hosts na lista acima, força http no lugar
// de https. Não afeta as demais estações, que continuam usando https normalmente.
function normalizeStreamUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (
      parsed.protocol === "https:" &&
      HTTP_ONLY_STREAM_HOSTS.some(
        (h) => host === h || host.endsWith("." + h),
      )
    ) {
      parsed.protocol = "http:";
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

interface RadioPlayerProps {
  station: {
    name: string;
    url: string;
    favicon?: string;
    country?: string;
  } | null;
  onClose?: () => void;
}

export default function RadioPlayer({ station, onClose }: RadioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [volume, setVolume] = useState(70);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && station) {
      audio.src = normalizeStreamUrl(station.url);
      audio.volume = volume / 100;
      audio.play().catch(() => {
        console.error("Erro ao reproduzir rádio");
        setHasError(true);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, station]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
    }
  }, [volume]);

  const handleError = () => {
    console.error("Falha ao reproduzir stream de áudio");
    setHasError(true);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (!station) return;
    setHasError(false);
    setIsPlaying(!isPlaying);
  };

  if (!station) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:right-6 md:max-w-sm bg-card border-t md:border md:rounded-xl border-border shadow-2xl z-40">
      <audio ref={audioRef} onError={handleError} />

      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-display font-bold text-card-foreground text-lg truncate">
              {station.name}
            </h3>
            {station.country && (
              <p className="text-sm text-muted-foreground font-sans">{station.country}</p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 p-1 hover:bg-muted rounded-lg transition-colors"
              aria-label="Fechar player"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Progress bar (placeholder) */}
        <div className="w-full h-1 bg-muted rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: isPlaying ? "30%" : "0%" }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Play/Pause Button */}
          <Button
            onClick={handlePlayPause}
            size="lg"
            className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all transform active:scale-95"
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </Button>

          {/* Volume Control */}
          <div className="flex items-center gap-2 flex-1 ml-4">
            <Volume2 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
              aria-label="Volume"
            />
            <span className="text-xs text-muted-foreground font-sans w-8 text-right">
              {volume}%
            </span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-4 text-center">
          {hasError ? (
            <p className="text-xs text-red-500 font-sans font-medium">
              Não foi possível reproduzir esta estação
            </p>
          ) : isPlaying ? (
            <p className="text-xs text-primary font-sans font-medium flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Transmitindo ao vivo
            </p>
          ) : (
            <p className="text-xs text-muted-foreground font-sans">Pausado</p>
          )}
        </div>
      </div>
    </div>
  );
}
