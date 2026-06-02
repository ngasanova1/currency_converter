/**
 * CoinGecko API v3 client
 * Key: Demo plan — 30 req/min
 */

const CG_BASE = "https://api.coingecko.com/api/v3";
const CG_KEY = "CG-GEuHdpo6xVFaPYMguDTQC5uv";

// CoinGecko coin IDs for our crypto codes
const COIN_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
};

// Fiat currencies supported as vs_currency on CoinGecko
const FIAT_CODES = [
  "usd", "eur", "gbp", "rub", "jpy", "chf",
  "cad", "aud", "cny", "inr", "mxn", "brl", "nzd",
];

// Popular fiat/fiat pairs to display
const FIAT_PAIRS: [string, string][] = [
  ["EUR", "USD"],
  ["GBP", "USD"],
  ["USD", "RUB"],
  ["USD", "JPY"],
  ["USD", "CNY"],
  ["EUR", "RUB"],
  ["GBP", "EUR"],
  ["USD", "CHF"],
  ["AUD", "USD"],
  ["USD", "INR"],
];

// ── In-memory cache ──────────────────────────────────────────────────────────
const _cache = new Map<string, { data: any; ts: number }>();

async function cgFetch(
  path: string,
  params: Record<string, string> = {},
  ttl = 60_000,
): Promise<any> {
  const url = new URL(`${CG_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const key = url.toString();

  const hit = _cache.get(key);
  if (hit && Date.now() - hit.ts < ttl) return hit.data;

  const res = await fetch(key, {
    headers: { "x-cg-demo-api-key": CG_KEY },
  });
  if (!res.ok) throw new Error(`CoinGecko ${res.status}: ${path}`);
  const data = await res.json();
  _cache.set(key, { data, ts: Date.now() });
  return data;
}

// ── Types ────────────────────────────────────────────────────────────────────
export type LiveRate = {
  pair: string;
  base: string;
  quote: string;
  rate: number;
  change24h?: number;
};

export type ChartPoint = {
  x: number;
  y: number;
  date?: string;
};

// ── Live rates ───────────────────────────────────────────────────────────────

/**
 * Returns live rates for all popular pairs.
 * Crypto pairs come directly from CoinGecko.
 * Fiat cross-rates are derived via BTC as a reference.
 */
export async function getLiveRates(): Promise<LiveRate[]> {
  const data = await cgFetch(
    "/simple/price",
    {
      ids: "bitcoin,ethereum",
      vs_currencies: FIAT_CODES.join(","),
      include_24hr_change: "true",
    },
    60_000,
  );

  const btc: Record<string, number> = data.bitcoin || {};
  const eth: Record<string, number> = data.ethereum || {};
  const btcChange: Record<string, number> = {};
  const ethChange: Record<string, number> = {};

  // CoinGecko puts changes under keys like "bitcoin_24h_change"
  // but with include_24hr_change=true it returns them in the same object
  // as keys like usd_24h_change
  for (const fiat of FIAT_CODES) {
    btcChange[fiat] = data.bitcoin?.[`${fiat}_24h_change`] ?? 0;
    ethChange[fiat] = data.ethereum?.[`${fiat}_24h_change`] ?? 0;
  }

  const rates: LiveRate[] = [];

  // ── Crypto pairs ────────────────────────────────────────────────────────
  for (const fiat of FIAT_CODES) {
    const code = fiat.toUpperCase();
    if (btc[fiat])
      rates.push({
        pair: `BTC/${code}`,
        base: "BTC",
        quote: code,
        rate: btc[fiat],
        change24h: btcChange[fiat],
      });
    if (eth[fiat])
      rates.push({
        pair: `ETH/${code}`,
        base: "ETH",
        quote: code,
        rate: eth[fiat],
        change24h: ethChange[fiat],
      });
  }

  // ── Fiat cross-rates (derived via BTC) ──────────────────────────────────
  // fiatPerUsd[CODE] = how many CODE per 1 USD
  const fiatPerUsd: Record<string, number> = {};
  for (const fiat of FIAT_CODES) {
    if (btc[fiat] && btc.usd) {
      fiatPerUsd[fiat.toUpperCase()] = btc[fiat] / btc.usd;
    }
  }

  for (const [base, quote] of FIAT_PAIRS) {
    const rBase = fiatPerUsd[base];
    const rQuote = fiatPerUsd[quote];
    if (rBase && rQuote) {
      // quote units per 1 base
      rates.push({
        pair: `${base}/${quote}`,
        base,
        quote,
        rate: rQuote / rBase,
      });
    }
  }

  return rates;
}

/**
 * Returns the current rate for base→quote, or null if unavailable.
 */
export async function getRate(base: string, quote: string): Promise<number | null> {
  try {
    const rates = await getLiveRates();
    const direct = rates.find((r) => r.base === base && r.quote === quote);
    if (direct) return direct.rate;
    const inv = rates.find((r) => r.base === quote && r.quote === base);
    if (inv && inv.rate > 0) return 1 / inv.rate;

    // Try USD as pivot
    const toUsd = rates.find((r) => r.base === base && r.quote === "USD");
    const fromUsd = rates.find((r) => r.base === quote && r.quote === "USD");
    if (toUsd && fromUsd && fromUsd.rate > 0)
      return toUsd.rate / fromUsd.rate;

    return null;
  } catch {
    return null;
  }
}

// ── Historical chart ─────────────────────────────────────────────────────────

/**
 * Returns OHLC-ish price history as {x, y} points suitable for VictoryLine.
 * - Crypto vs fiat: direct CoinGecko market_chart endpoint (1 request)
 * - Fiat vs fiat:  BTC as a bridge (2 parallel requests, derived cross-rate)
 * Chart data is cached for 5 minutes.
 */
export async function getHistoricalChart(
  base: string,
  quote: string,
  days = 30,
): Promise<ChartPoint[]> {
  const interval = days <= 7 ? "hourly" : "daily";
  const ttl = 5 * 60_000;

  // ── Crypto vs fiat ──────────────────────────────────────────────────────
  const baseCoin = COIN_IDS[base];
  if (baseCoin) {
    const data = await cgFetch(
      `/coins/${baseCoin}/market_chart`,
      { vs_currency: quote.toLowerCase(), days: String(days), interval },
      ttl,
    );
    const prices: [number, number][] = data.prices || [];
    return prices.map(([ts, price], i) => ({
      x: i,
      y: price,
      date: new Date(ts).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }),
    }));
  }

  // ── Fiat vs crypto (e.g. USD/BTC) ───────────────────────────────────────
  const quoteCoin = COIN_IDS[quote];
  if (quoteCoin) {
    const data = await cgFetch(
      `/coins/${quoteCoin}/market_chart`,
      { vs_currency: base.toLowerCase(), days: String(days), interval },
      ttl,
    );
    const prices: [number, number][] = data.prices || [];
    return prices.map(([ts, price], i) => ({
      x: i,
      y: price > 0 ? 1 / price : 0,
      date: new Date(ts).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }),
    }));
  }

  // ── Fiat vs fiat (BTC-bridge) ────────────────────────────────────────────
  try {
    const [btcBase, btcQuote] = await Promise.all([
      cgFetch(`/coins/bitcoin/market_chart`, { vs_currency: base.toLowerCase(), days: String(days), interval: "daily" }, ttl),
      cgFetch(`/coins/bitcoin/market_chart`, { vs_currency: quote.toLowerCase(), days: String(days), interval: "daily" }, ttl),
    ]);
    const bP: [number, number][] = btcBase.prices || [];
    const qP: [number, number][] = btcQuote.prices || [];
    const len = Math.min(bP.length, qP.length);
    return Array.from({ length: len }, (_, i) => ({
      x: i,
      y: bP[i][1] > 0 ? qP[i][1] / bP[i][1] : 0,
      date: new Date(bP[i][0]).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }),
    }));
  } catch {
    return [];
  }
}

/**
 * Convert amount from base to quote using live rates.
 */
export async function convertAmount(
  base: string,
  quote: string,
  amount: number,
): Promise<number> {
  if (base === quote) return amount;
  const rate = await getRate(base, quote);
  if (rate === null) throw new Error(`Нет курса для ${base}/${quote}`);
  return amount * rate;
}
