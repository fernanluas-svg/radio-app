import { useState, useCallback } from "react";

const STORAGE_KEY = "wavefm:favorites";

function readFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

/**
 * Gerencia a lista de rádios favoritas, persistindo os IDs no localStorage.
 * A seleção permanece ao recarregar a página.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(readFavorites()),
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // armazenamento indisponível (ex.: modo privado) — segue em memória
      }
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
}