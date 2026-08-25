import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface Station {
  id: string;
  name: string;
  url: string;
  country?: string;
  favicon?: string;
}

interface PlayerContextValue {
  currentStation: Station | null;
  history: Station[];
  play: (station: Station) => void;
  close: () => void;
  clearHistory: () => void;
}

const STORAGE_KEY = "wavefm:history";
const MAX_HISTORY = 30;

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

function loadHistory(): Station[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is Station =>
        s &&
        typeof s.id === "string" &&
        typeof s.name === "string" &&
        typeof s.url === "string",
    );
  } catch {
    return [];
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [history, setHistory] = useState<Station[]>([]);

  // Carrega o histórico persistido ao montar.
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Persiste o histórico a cada alteração.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // armazenamento indisponível (ex.: modo privado) — segue em memória
    }
  }, [history]);

  // Toca uma estação e a registra no histórico (sem duplicar, mais recente no topo).
  const play = (station: Station) => {
    setCurrentStation(station);
    setHistory((prev) => {
      const filtered = prev.filter((s) => s.url !== station.url);
      return [station, ...filtered].slice(0, MAX_HISTORY);
    });
  };

  const close = () => setCurrentStation(null);

  const clearHistory = () => setHistory([]);

  return (
    <PlayerContext.Provider
      value={{ currentStation, history, play, close, clearHistory }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer deve ser usado dentro de um PlayerProvider");
  }
  return ctx;
}
