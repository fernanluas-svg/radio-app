import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [volume, setVolume] = useState(70);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying && station) {
      audioRef.current.src = station.url;
      audioRef.current.volume = volume / 100;
      audioRef.current.play().catch(() => {
        console.error("Erro ao reproduzir rádio");
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, station, volume]);

  const handlePlayPause = () => {
    if (!station) return;
    setIsPlaying(!isPlaying);
  };

  if (!station) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:right-6 md:max-w-sm bg-white border-t md:border md:rounded-xl shadow-2xl z-40">
      <audio ref={audioRef} crossOrigin="anonymous" />

      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-display font-bold text-gray-900 text-lg truncate">
              {station.name}
            </h3>
            {station.country && (
              <p className="text-sm text-gray-500 font-sans">{station.country}</p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Fechar player"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Progress bar (placeholder) */}
        <div className="w-full h-1 bg-gray-200 rounded-full mb-4 overflow-hidden">
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
            <Volume2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
              aria-label="Volume"
            />
            <span className="text-xs text-gray-500 font-sans w-8 text-right">
              {volume}%
            </span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-4 text-center">
          {isPlaying ? (
            <p className="text-xs text-primary font-sans font-medium flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Transmitindo ao vivo
            </p>
          ) : (
            <p className="text-xs text-gray-400 font-sans">Pausado</p>
          )}
        </div>
      </div>
    </div>
  );
}
