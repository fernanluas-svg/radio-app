import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

export interface Station {
  id: string;
  name: string;
  url: string;
  country?: string;
  favicon?: string;
}

// Lista de rádios visível na tela onde a reprodução começou + posição atual.
// `currentStation` é derivado daqui, então não existe estado duplicado para dessincronizar.
interface Navigation {
  queue: Station[];
  index: number;
}

interface PlayerContextValue {
  currentStation: Station | null;
  /**
   * Intenção de reprodução. Vive no contexto (e não no player) para que tocar
   * num card da lista já comece a tocar, sem exigir um segundo clique no player.
   */
  isPlaying: boolean;
  history: Station[];
  /** Lista completa de rádios da tela em que a reprodução foi iniciada. */
  queue: Station[];
  /** Índice da estação tocando dentro de `queue`. */
  queueIndex: number;
  hasPrev: boolean;
  hasNext: boolean;
  /** Toca `stationId` e usa `queue` como fila para navegação anterior/próxima. */
  playFrom: (queue: Station[], stationId: string) => void;
  togglePlay: () => void;
  /** Interrompe a reprodução (usado quando o stream falha). */
  pause: () => void;
  next: () => void;
  prev: () => void;
  close: () => void;
  clearHistory: () => void;
}

const STORAGE_KEY = "wavefm:history";
const MAX_HISTORY = 30;

const EMPTY_NAV: Navigation = { queue: [], index: 0 };

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
        typeof s.url === "string"
    );
  } catch {
    return [];
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<Station[]>([]);
  const [nav, setNav] = useState<Navigation>(EMPTY_NAV);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const pushHistory = useCallback((station: Station) => {
    setHistory((prev) =>
      [station, ...prev.filter((s) => s.url !== station.url)].slice(
        0,
        MAX_HISTORY
      )
    );
  }, []);

  const playFrom = useCallback(
    (queue: Station[], stationId: string) => {
      const index = queue.findIndex((s) => s.id === stationId);
      if (index < 0) {
        // Fila e estação costumam vir de telas diferentes. Sem este aviso, a
        // falha é 100% silenciosa e parece "o player não funciona".
        console.warn("[PlayerContext] estação ausente na fila:", stationId);
        return;
      }
      // Re-tocar no mesmo card não recria a fila: mantém a referência da estação
      // para o player não reiniciar o stream do zero.
      setNav((prev) =>
        prev.index === index && prev.queue[index] === queue[index]
          ? prev
          : { queue, index }
      );
      setIsPlaying(true);
      pushHistory(queue[index]);
    },
    [pushHistory]
  );

  const togglePlay = useCallback(() => setIsPlaying((v) => !v), []);
  const pause = useCallback(() => setIsPlaying(false), []);

  // Navega a fila sem dar a volta nas pontas (voltar na primeira / avançar na última não faz nada).
  const step = useCallback(
    (delta: number) => {
      const total = nav.queue.length;
      if (total < 2) return;
      const index = Math.min(total - 1, Math.max(0, nav.index + delta));
      if (index === nav.index) return;
      setNav({ queue: nav.queue, index });
      pushHistory(nav.queue[index]);
    },
    [nav, pushHistory]
  );

  const close = useCallback(() => {
    setNav(EMPTY_NAV);
    setIsPlaying(false);
  }, []);
  const clearHistory = useCallback(() => setHistory([]), []);

  const currentStation =
    nav.index >= 0 && nav.index < nav.queue.length
      ? nav.queue[nav.index]
      : null;

  const value = useMemo<PlayerContextValue>(
    () => ({
      currentStation,
      isPlaying,
      history,
      queue: nav.queue,
      queueIndex: nav.index,
      hasPrev: nav.index > 0,
      hasNext: nav.queue.length > 0 && nav.index < nav.queue.length - 1,
      playFrom,
      togglePlay,
      pause,
      next: () => step(1),
      prev: () => step(-1),
      close,
      clearHistory,
    }),
    [
      currentStation,
      isPlaying,
      history,
      nav,
      playFrom,
      togglePlay,
      pause,
      step,
      close,
      clearHistory,
    ]
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer deve ser usado dentro de um PlayerProvider");
  }
  return ctx;
}
