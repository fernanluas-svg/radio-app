import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useDragControls, type PanInfo } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Volume2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";

// Estações cujo servidor de áudio só aceita HTTP (não suportam TLS/HTTPS).
// Se o cliente tentar https nesses hosts, o browser lança ERR_SSL_PROTOCOL_ERROR.
const HTTP_ONLY_STREAM_HOSTS = [
  "a1rj.streams.com.br",
  "servidor36.brlogic.com",
];

// Normaliza a URL de streaming: para hosts na lista acima, força http no lugar
// de https. Não afeta as demais estações, que continuam usando https normalmente.
function normalizeStreamUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (
      parsed.protocol === "https:" &&
      HTTP_ONLY_STREAM_HOSTS.some((h) => host === h || host.endsWith("." + h))
    ) {
      parsed.protocol = "http:";
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

// Provedores que SÓ servem via HTTPS. Para esses, nunca converter para HTTP,
// mesmo que o stream falhe (senão gera ERR_CONNECTION_REFUSED na porta 80).
const HTTPS_ONLY_STREAM_HOSTS = ["streamtheworld.com"];

// Troca o protocolo de uma URL de https para http (sem tocar no resto).
// Retorna null quando a URL não pode ou não deve ser convertida.
function toHttp(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    const host = parsed.hostname.toLowerCase();
    if (
      HTTPS_ONLY_STREAM_HOSTS.some((h) => host === h || host.endsWith("." + h))
    ) {
      return null;
    }
    parsed.protocol = "http:";
    return parsed.toString();
  } catch {
    return null;
  }
}

interface RadioPlayerProps {
  station: {
    name: string;
    url: string;
    favicon?: string;
    country?: string;
  } | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  /** Usado quando o stream falha, para resetar a interface para "pausado". */
  onPause: () => void;
  onClose?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export default function RadioPlayer({
  station,
  isPlaying,
  onTogglePlay,
  onPause,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: RadioPlayerProps) {
  const [hasError, setHasError] = useState(false);
  const [volume, setVolume] = useState(70);
  const [expanded, setExpanded] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const retriedHttpRef = useRef(false);
  const didDragRef = useRef(false);
  const dragControls = useDragControls();

  const isMobile = useIsMobile();
  // O recolhimento é exclusivo do mobile; no desktop o player segue como card flutuante.
  const collapsible = Boolean(isMobile && station);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && station) {
      retriedHttpRef.current = false;
      audio.src = normalizeStreamUrl(station.url);
      audio.volume = volume / 100;
      // load() aborta o carregamento do stream anterior — evita sobreposição ao
      // alternar rapidamente entre estações.
      audio.load();
      audio.play().catch(() => {
        console.error("Erro ao reproduzir rádio");
        setHasError(true);
        onPause();
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

  // Trocar de estação (anterior/próxima) limpa o erro da rádio que falhou.
  useEffect(() => {
    setHasError(false);
  }, [station]);

  const handleError = () => {
    const audio = audioRef.current;
    if (audio && station && !retriedHttpRef.current) {
      const fallback = toHttp(audio.src);
      if (fallback) {
        retriedHttpRef.current = true;
        audio.src = fallback;
        audio.load();
        audio.play().catch(() => {
          console.error("Falha ao reproduzir stream de áudio");
          setHasError(true);
          onPause();
        });
        return;
      }
    }
    console.error("Falha ao reproduzir stream de áudio");
    setHasError(true);
    onPause();
  };

  const handlePlayPause = () => {
    if (!station) return;
    setHasError(false);
    onTogglePlay();
  };

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    if (info.offset.y > 70 || info.velocity.y > 600) {
      setExpanded(false);
    } else if (info.offset.y < -50 || info.velocity.y < -500) {
      setExpanded(true);
    }
    // O click do handle dispara depois do pointerup; zeramos a flag no próximo
    // tick para o gesto não acabar alternando o estado duas vezes.
    window.setTimeout(() => {
      didDragRef.current = false;
    }, 0);
  };

  const handleDragStart = useCallback(() => {
    didDragRef.current = true;
  }, []);

  const toggleExpanded = useCallback(() => {
    if (!collapsible || didDragRef.current) return;
    setExpanded((v) => !v);
  }, [collapsible]);

  if (!station) return null;

  return (
    <motion.section
      drag={collapsible ? "y" : false}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.02, bottom: 0.45 }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      aria-label="Player de rádio"
      className="fixed bottom-0 left-0 right-0 z-40 overflow-hidden border-t border-border bg-card shadow-2xl md:bottom-6 md:left-auto md:right-6 md:max-w-sm md:rounded-2xl md:border"
    >
      <audio ref={audioRef} onError={handleError} />

      {/* Barra indicadora arrastável */}
      <button
        type="button"
        onPointerDown={(e) => {
          if (collapsible) dragControls.start(e);
        }}
        onClick={toggleExpanded}
        aria-label={expanded ? "Recolher player" : "Expandir player"}
        aria-expanded={expanded}
        className="flex w-full touch-none justify-center pt-3 pb-1.5 md:hidden"
      >
        <span className="h-1.5 w-11 rounded-full bg-primary/70 transition-colors hover:bg-primary" />
      </button>

      {/* Barra sempre visível: identificação + play rápido (recolhido) */}
      <div className="flex items-center gap-3 px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] md:px-6 md:py-3">
        {station.favicon && (
          <img
            src={station.favicon}
            alt=""
            className="h-11 w-11 shrink-0 rounded-lg object-cover shadow-md"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}

        <button
          type="button"
          onClick={toggleExpanded}
          disabled={!collapsible}
          className="min-w-0 flex-1 text-left disabled:pointer-events-none"
        >
          <p className="truncate font-display text-base font-bold text-card-foreground">
            {station.name}
          </p>
          {station.country && (
            <p className="truncate font-sans text-xs text-muted-foreground">
              {station.country}
            </p>
          )}
        </button>

        {/* Com o player recolhido é o único controle de reprodução disponível. */}
        {collapsible && !expanded && (
          <Button
            onClick={handlePlayPause}
            size="icon"
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
            className="shrink-0 rounded-full bg-primary text-white shadow-md hover:bg-primary/90"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </Button>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar player"
            className="shrink-0 rounded-lg p-1.5 transition-colors hover:bg-muted"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Recolhimento por max-height em CSS: sem medir nada e sem risco de a folha
          colapsar para 0px (o que esconderia o player inteiro). */}
      <div
        className={cn(
          "overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
          collapsible && !expanded
            ? "max-h-0 opacity-0"
            : "max-h-[26rem] opacity-100",
        )}
      >
        {/* Controles — inertes enquanto recolhido para não receber foco/teclado */}
        <div
          inert={collapsible && !expanded ? true : undefined}
          className="space-y-4 px-4 pb-5 md:px-6 md:pb-6"
        >
          {/* Controles de mídia: anterior / play / próxima */}
          <div className="flex items-center justify-center gap-5 md:gap-7">
            <Button
              onClick={onPrev}
              disabled={!hasPrev}
              size="icon-lg"
              aria-label="Rádio anterior"
              title="Rádio anterior"
              className="rounded-full text-primary transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-7 w-7" />
            </Button>

            <Button
              onClick={handlePlayPause}
              size="lg"
              aria-label={isPlaying ? "Pausar" : "Reproduzir"}
              className="h-16 w-16 rounded-full bg-primary text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl active:scale-95"
            >
              {isPlaying ? (
                <Pause className="h-7 w-7 fill-current" />
              ) : (
                <Play className="h-7 w-7 fill-current ml-0.5" />
              )}
            </Button>

            <Button
              onClick={onNext}
              disabled={!hasNext}
              size="icon-lg"
              aria-label="Próxima rádio"
              title="Próxima rádio"
              className="rounded-full text-primary transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-7 w-7" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
              aria-label="Volume"
            />
            <span className="w-8 text-right font-sans text-xs text-muted-foreground">
              {volume}%
            </span>
          </div>

          {/* Status */}
          <div className="text-center">
            {hasError ? (
              <p className="font-sans text-xs font-medium text-red-500">
                Não foi possível reproduzir esta estação
              </p>
            ) : isPlaying ? (
              <p className="flex items-center justify-center gap-1 font-sans text-xs font-medium text-primary">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                Transmitindo ao vivo
              </p>
            ) : (
              <p className="font-sans text-xs text-muted-foreground">Pausado</p>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
