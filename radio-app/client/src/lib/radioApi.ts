// Módulo de acesso à Radio-Browser API.
// Chama a API pública diretamente do navegador e, se houver bloqueio de CORS,
// cai para proxies de CORS públicos (fallback).
//
// Logs de debug ficam no console com o prefixo [radioApi].

export interface RadioBrowserStation {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  url_homepage: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  language: string;
  codec: string;
  bitrate: number;
  votes: number;
  [key: string]: unknown;
}

const RADIO_BROWSER_BASE = "https://de1.api.radio-browser.info";

// Proxies CORS públicos usados como fallback quando a chamada direta falha.
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
];

function buildSearchUrl(params: Record<string, string | number>) {
  const url = new URL(`${RADIO_BROWSER_BASE}/json/stations/search`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

function describe(source: number) {
  return source === 0 ? "direto" : `proxyCORS[${source}]`;
}

async function requestJson(url: string): Promise<RadioBrowserStation[]> {
  const attempts: Array<() => Promise<Response>> = [
    () => fetch(url, { headers: { "User-Agent": "WaveFM/1.0" } }),
  ];
  CORS_PROXIES.forEach((proxy) => {
    attempts.push(() =>
      fetch(proxy(url), { headers: { "User-Agent": "WaveFM/1.0" } }),
    );
  });

  let lastError: unknown;
  for (let i = 0; i < attempts.length; i++) {
    const via = describe(i);
    try {
      console.log(`[radioApi] Tentativa ${i + 1} (${via}):`, url);
      const res = await attempts[i]();
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as RadioBrowserStation[];
      console.log(
        `[radioApi] Sucesso (${via}): ${data.length} estações recebidas`,
      );
      return data;
    } catch (err) {
      lastError = err;
      console.warn(`[radioApi] Falhou via ${via}:`, err);
    }
  }

  console.error("[radioApi] Todas as tentativas falharam:", lastError);
  throw new Error("Não foi possível acessar a Radio-Browser API.");
}

export interface SearchOptions {
  name?: string;
  countryCode?: string;
  state?: string;
  language?: string;
  limit?: number;
}

export async function searchStations(
  opts: SearchOptions = {},
): Promise<RadioBrowserStation[]> {
  const params: Record<string, string | number> = {
    hidebroken: 1,
    reverse: 1,
    order: "votes",
    limit: opts.limit ?? 60,
  };
  if (opts.name) params.name = opts.name;
  if (opts.countryCode) params.countrycode = opts.countryCode;
  if (opts.state) params.state = opts.state;
  if (opts.language) params.language = opts.language;

  return requestJson(buildSearchUrl(params));
}

// Converte uma estação da Radio-Browser no formato usado pelos cards do app.
export interface RadioStationCard {
  id: string;
  name: string;
  url: string;
  country: string;
  favicon?: string;
  tags?: string;
}

export function toStationCard(s: RadioBrowserStation): RadioStationCard {
  const parts: string[] = [];
  if (s.countrycode) parts.push(s.countrycode);
  if (s.state) parts.push(s.state);
  return {
    id: s.stationuuid,
    name: s.name,
    url: s.url_resolved || s.url,
    country: parts.join(" • ") || s.country || "Desconhecido",
    favicon: s.favicon || undefined,
    tags: s.tags,
  };
}