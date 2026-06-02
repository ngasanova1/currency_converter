import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsive } from "../../hooks/use-responsive";
import { useAuth } from "../AuthProvider";
import api from "../api";
import {
  type ChartPoint,
  type LiveRate,
  getHistoricalChart,
  getLiveRates,
} from "../../coingecko";

const C = {
  primary: "#1B3A6B",
  action: "#2563EB",
  bg: "#F5F7FA",
  surface: "#FFFFFF",
  text: "#111827",
  textMid: "#4B5563",
  textLight: "#9CA3AF",
  border: "#E5E7EB",
  success: "#059669",
  successBg: "#ECFDF5",
  successBorder: "#A7F3D0",
  pending: "#D97706",
  pendingBg: "#FFFBEB",
  pendingBorder: "#FDE68A",
  error: "#DC2626",
  errorBg: "#FEF2F2",
};

const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  CHF: "🇨🇭",
  CAD: "🇨🇦",
  AUD: "🇦🇺",
  NZD: "🇳🇿",
  CNY: "🇨🇳",
  INR: "🇮🇳",
  MXN: "🇲🇽",
  BRL: "🇧🇷",
  RUB: "🇷🇺",
  BTC: "₿",
  ETH: "Ξ",
};

const PERIODS = [
  // { label: "7д", days: 7 },
  { label: "30д", days: 30 },
  { label: "90д", days: 90 },
];

const POPULAR_PAIRS = [
  "BTC/USD",
  "ETH/USD",
  "EUR/USD",
  "USD/RUB",
  "GBP/USD",
  "EUR/RUB",
  "USD/JPY",
  "AUD/USD",
];

function getFlag(code: string) {
  return CURRENCY_FLAGS[code] || "💱";
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatRate(rate: number): string {
  if (rate >= 0.01) return rate.toFixed(2);
  if (rate >= 0.0001) return rate.toFixed(6);
  return rate.toExponential(4);
}

type TabType = "rates" | "exchanges";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { centered, chartHeight } = useResponsive();

  const [exchanges, setExchanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("rates");

  async function load() {
    if (user?.id) {
      try {
        const r = await api.getExchanges(user.id);
        setExchanges(r.data || []);
      } catch {
        // silent
      }
    }
    setLoading(false);
  }

  function onRefresh() {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }

  useEffect(() => {
    load();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: C.bg }]}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* ── PAGE HEADER ── */}
      <View style={[styles.pageHeader, { paddingTop: insets.top + 16 }]}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.dotGrid}>
          {[0, 1, 2, 3].map((col) => (
            <View key={col} style={{ gap: 8 }}>
              {[0, 1, 2].map((row) => (
                <View key={row} style={styles.dot} />
              ))}
            </View>
          ))}
        </View>
        <Text style={styles.pageTitle}>История</Text>
        <Text style={styles.pageSubtitle}>График курсов и ваши заявки</Text>
      </View>

      {/* ── SEGMENTED CONTROL ── */}
      <View style={styles.segmentWrap}>
        <View style={[styles.segmentBar, centered(640)]}>
          <TouchableOpacity
            style={[
              styles.segment,
              activeTab === "rates" && styles.segmentActive,
            ]}
            onPress={() => setActiveTab("rates")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="stats-chart-outline"
              size={15}
              color={activeTab === "rates" ? "#FFFFFF" : C.textMid}
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === "rates" && styles.segmentTextActive,
              ]}
            >
              Курсы валют
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segment,
              activeTab === "exchanges" && styles.segmentActive,
            ]}
            onPress={() => setActiveTab("exchanges")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="swap-horizontal-outline"
              size={15}
              color={activeTab === "exchanges" ? "#FFFFFF" : C.textMid}
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === "exchanges" && styles.segmentTextActive,
              ]}
            >
              Мои заявки
              {exchanges.length > 0 && (
                <Text style={styles.badge}> {exchanges.length}</Text>
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── CONTENT ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
      >
        <View style={centered(640)}>
          {activeTab === "rates" ? (
            <RatesTab chartHeight={chartHeight} />
          ) : (
            <ExchangesTab rows={exchanges} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Rates Tab with CoinGecko chart ──────────────────────────────────────────

function RatesTab({ chartHeight }: { chartHeight: number }) {
  const [liveRates, setLiveRates] = useState<LiveRate[]>([]);
  const [selectedPair, setSelectedPair] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartDays, setChartDays] = useState(30);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [victory, setVictory] = useState<any>(null);
  const chartFetchRef = useRef(0);

  useEffect(() => {
    // Load Victory
    // @ts-ignore
    import("victory-native")
      .then((mod: any) => {
        if (mod.VictoryChart && mod.VictoryLine && mod.VictoryAxis) {
          setVictory(mod);
        }
      })
      .catch(() => {});

    // Load live rates
    getLiveRates()
      .then((rates) => {
        setLiveRates(rates);
        const first = rates.find((r) => POPULAR_PAIRS.includes(r.pair));
        setSelectedPair(first?.pair || rates[0]?.pair || null);
      })
      .catch(() => {})
      .finally(() => setRatesLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedPair || liveRates.length === 0) return;
    const r = liveRates.find((r) => r.pair === selectedPair);
    if (!r) return;
    const token = ++chartFetchRef.current;
    setChartLoading(true);
    getHistoricalChart(r.base, r.quote, chartDays)
      .then((data) => {
        if (chartFetchRef.current === token) setChartData(data);
      })
      .catch(() => {
        if (chartFetchRef.current === token) setChartData([]);
      })
      .finally(() => {
        if (chartFetchRef.current === token) setChartLoading(false);
      });
  }, [selectedPair, chartDays, liveRates.length]);

  const popularRates = liveRates.filter((r) => POPULAR_PAIRS.includes(r.pair));
  const currentRate = liveRates.find((r) => r.pair === selectedPair);
  const trendUp =
    chartData.length >= 2
      ? chartData[chartData.length - 1].y >= chartData[0].y
      : true;
  const rateChangePct =
    chartData.length >= 2
      ? (
          ((chartData[chartData.length - 1].y - chartData[0].y) /
            (chartData[0].y || 1)) *
          100
        ).toFixed(2)
      : null;

  if (ratesLoading) {
    return (
      <View style={{ alignItems: "center", paddingVertical: 48 }}>
        <ActivityIndicator color={C.action} size="large" />
        <Text style={{ marginTop: 12, fontSize: 13, color: C.textLight }}>
          Загрузка курсов...
        </Text>
      </View>
    );
  }

  return (
    <>
      {/* ── Pair chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 12 }}
        contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
      >
        {popularRates.map((r) => (
          <TouchableOpacity
            key={r.pair}
            style={[
              styles.pairChip,
              selectedPair === r.pair && styles.pairChipActive,
            ]}
            onPress={() => setSelectedPair(r.pair)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.pairChipText,
                selectedPair === r.pair && styles.pairChipTextActive,
              ]}
            >
              {r.pair}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Chart card ── */}
      {currentRate && (
        <View style={styles.histChartCard}>
          {/* Card header: rate info + period selector */}
          <View style={styles.histChartHeader}>
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 2,
                }}
              >
                <Text style={styles.histFlag}>{getFlag(currentRate.base)}</Text>
                <Text style={{ fontSize: 12, color: C.textLight }}>→</Text>
                <Text style={styles.histFlag}>
                  {getFlag(currentRate.quote)}
                </Text>
                <Text style={styles.histPairLabel}>{currentRate.pair}</Text>
              </View>
              <Text style={styles.histRate}>
                {formatRate(currentRate.rate)}{" "}
                <Text style={styles.histQuote}>{currentRate.quote}</Text>
              </Text>
              {rateChangePct && (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
                >
                  <Ionicons
                    name={
                      trendUp ? "trending-up-outline" : "trending-down-outline"
                    }
                    size={13}
                    color={trendUp ? C.success : C.error}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: trendUp ? C.success : C.error,
                    }}
                  >
                    {trendUp ? "+" : ""}
                    {rateChangePct}% за {chartDays}д
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.histPeriodCol}>
              {PERIODS.map((p) => (
                <TouchableOpacity
                  key={p.days}
                  style={[
                    styles.histPeriodBtn,
                    chartDays === p.days && styles.histPeriodBtnActive,
                  ]}
                  onPress={() => setChartDays(p.days)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.histPeriodText,
                      chartDays === p.days && styles.histPeriodTextActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Chart */}
          {chartLoading ? (
            <View style={[styles.histChartLoader, { height: chartHeight }]}>
              <ActivityIndicator color={C.action} />
            </View>
          ) : chartData.length > 2 ? (
            victory && victory.VictoryChart ? (
              <victory.VictoryChart
                height={chartHeight}
                padding={{ top: 10, bottom: 30, left: 54, right: 16 }}
                theme={victory.VictoryTheme?.material}
              >
                <victory.VictoryAxis
                  tickCount={4}
                  tickFormat={(_: any, i: number) => {
                    const pt =
                      chartData[Math.round((i / 3) * (chartData.length - 1))];
                    return pt?.date || "";
                  }}
                  style={{
                    axis: { stroke: C.border },
                    tickLabels: { fontSize: 8, fill: C.textLight },
                    grid: { stroke: "transparent" },
                  }}
                />
                <victory.VictoryAxis
                  dependentAxis
                  tickFormat={(t: number) => {
                    if (t >= 10000) return `${(t / 1000).toFixed(0)}k`;
                    if (t >= 1000) return t.toFixed(0);
                    if (t >= 1) return t.toFixed(2);
                    return t.toFixed(4);
                  }}
                  style={{
                    axis: { stroke: C.border },
                    tickLabels: { fontSize: 8, fill: C.textLight },
                    grid: { stroke: C.border, strokeDasharray: "4" },
                  }}
                />
                <victory.VictoryLine
                  data={chartData}
                  style={{
                    data: {
                      stroke: trendUp ? C.success : C.error,
                      strokeWidth: 2,
                    },
                  }}
                  animate={{ duration: 300 }}
                />
              </victory.VictoryChart>
            ) : (
              <SimpleMiniChart
                data={chartData}
                height={chartHeight}
                trendUp={trendUp}
              />
            )
          ) : (
            <View style={[styles.histChartLoader, { height: chartHeight }]}>
              <Text style={{ fontSize: 13, color: C.textLight }}>
                Нет данных для графика
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ── Popular rates list ── */}
      <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 10 }]}>
        Популярные пары
      </Text>
      {popularRates.map((r) => {
        const up = (r.change24h ?? 0) >= 0;
        const isSelected = selectedPair === r.pair;
        return (
          <TouchableOpacity
            key={r.pair}
            style={[styles.rateRow, isSelected && styles.rateRowActive]}
            onPress={() => setSelectedPair(r.pair)}
            activeOpacity={0.7}
          >
            <View style={styles.rateLeft}>
              <View style={styles.flagRow}>
                <Text style={styles.flag}>{getFlag(r.base)}</Text>
                <Ionicons name="arrow-forward" size={10} color={C.textLight} />
                <Text style={styles.flag}>{getFlag(r.quote)}</Text>
              </View>
              <View>
                <Text style={styles.ratePair}>{r.pair}</Text>
                <Text style={styles.rateDate}>1 {r.base}</Text>
              </View>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.rateVal}>{formatRate(r.rate)}</Text>
              {r.change24h !== undefined && (
                <Text
                  style={{
                    fontSize: 11,
                    color: up ? C.success : C.error,
                    fontWeight: "600",
                    marginTop: 2,
                  }}
                >
                  {up ? "+" : ""}
                  {r.change24h.toFixed(2)}%
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </>
  );
}

// ── Simple bar chart fallback (no Victory required) ─────────────────────────

function SimpleMiniChart({
  data,
  height,
  trendUp,
}: {
  data: ChartPoint[];
  height: number;
  trendUp: boolean;
}) {
  const min = Math.min(...data.map((d) => d.y));
  const max = Math.max(...data.map((d) => d.y));
  const range = max - min || 1;

  // Sample to ~60 bars max
  const step = Math.max(1, Math.floor(data.length / 60));
  const sampled = data.filter((_, i) => i % step === 0);
  const barColor = trendUp ? C.success : C.error;
  const innerH = height - 28; // room for bottom labels

  // Pick 3 date labels evenly
  const labelIdx = [0, Math.floor(sampled.length / 2), sampled.length - 1];

  return (
    <View style={{ height, paddingHorizontal: 16, paddingBottom: 4 }}>
      {/* Bars */}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 1,
        }}
      >
        {sampled.map((pt, i) => {
          const pct = (pt.y - min) / range;
          const barH = Math.max(3, pct * innerH);
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: barH,
                backgroundColor: barColor,
                opacity: 0.35 + pct * 0.65,
                borderRadius: 1,
              }}
            />
          );
        })}
      </View>
      {/* Date labels */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 4,
        }}
      >
        {labelIdx.map((idx) => (
          <Text key={idx} style={{ fontSize: 9, color: C.textLight }}>
            {sampled[idx]?.date || ""}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ── Exchanges Tab ────────────────────────────────────────────────────────────

function ExchangesTab({ rows }: { rows: any[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon="swap-horizontal-outline"
        text="Нет заявок на обмен"
        sub="Создайте первую заявку на вкладке Обмен"
      />
    );
  }
  return (
    <>
      {rows.map((ex, i) => {
        const isCompleted = ex.status === "completed";
        const sc = isCompleted
          ? { color: C.success, bg: C.successBg, border: C.successBorder }
          : { color: C.pending, bg: C.pendingBg, border: C.pendingBorder };
        return (
          <View
            key={i}
            style={[
              styles.exchangeCard,
              { backgroundColor: sc.bg, borderColor: sc.border },
            ]}
          >
            <View style={styles.exchangeTop}>
              <View style={styles.exchangePairRow}>
                <Text style={styles.exchangeFlag}>
                  {getFlag(ex.from_currency)}
                </Text>
                <View style={styles.exchangeArrowWrap}>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={C.textLight}
                  />
                </View>
                <Text style={styles.exchangeFlag}>
                  {getFlag(ex.to_currency)}
                </Text>
                <View>
                  <Text style={styles.exchangePair}>
                    {ex.from_currency} → {ex.to_currency}
                  </Text>
                  {ex.created_at && (
                    <Text style={styles.exchangeDate}>
                      {formatDate(ex.created_at)}
                    </Text>
                  )}
                </View>
              </View>
              <View style={[styles.statusPill, { backgroundColor: sc.color }]}>
                <Text style={styles.statusText}>
                  {isCompleted ? "Выполнено" : "В обработке"}
                </Text>
              </View>
            </View>
            <View style={styles.exchangeAmounts}>
              <View style={styles.amountCol}>
                <Text style={styles.amountLabel}>Отдали</Text>
                <Text style={styles.amountVal}>
                  {Number(ex.from_amount).toFixed(2)}{" "}
                  <Text style={styles.amountCur}>{ex.from_currency}</Text>
                </Text>
              </View>
              <Ionicons
                name="arrow-forward-circle-outline"
                size={22}
                color={sc.color}
              />
              <View style={[styles.amountCol, { alignItems: "flex-end" }]}>
                <Text style={styles.amountLabel}>Получили</Text>
                <Text style={[styles.amountVal, { color: sc.color }]}>
                  {ex.to_amount ? Number(ex.to_amount).toFixed(2) : "—"}{" "}
                  <Text style={styles.amountCur}>{ex.to_currency}</Text>
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </>
  );
}

function EmptyState({
  icon,
  text,
  sub,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  text: string;
  sub?: string;
}) {
  return (
    <View style={styles.emptyWrap}>
      <Ionicons name={icon} size={40} color={C.textLight} />
      <Text style={styles.emptyText}>{text}</Text>
      {sub && <Text style={styles.emptySub}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  pageHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: C.primary,
    overflow: "hidden",
  },
  decoCircle1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -60,
    right: -40,
  },
  decoCircle2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: -30,
    left: 20,
  },
  dotGrid: {
    position: "absolute",
    right: 68,
    top: 18,
    flexDirection: "row",
    gap: 10,
    opacity: 0.15,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#FFFFFF",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    lineHeight: 32,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 20,
  },

  segmentWrap: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  segmentBar: {
    flexDirection: "row",
    backgroundColor: C.bg,
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
  },
  segmentActive: {
    backgroundColor: C.primary,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: { fontSize: 13, fontWeight: "600", color: C.textMid },
  segmentTextActive: { color: "#FFFFFF" },
  badge: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.75)" },

  listContent: { padding: 16, paddingBottom: 40 },

  // ── Chart Tab ──
  pairChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  pairChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  pairChipText: { fontSize: 12, fontWeight: "600", color: C.textMid },
  pairChipTextActive: { color: "#FFFFFF" },

  histChartCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingTop: 16,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
    overflow: "hidden",
  },
  histChartHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  histFlag: { fontSize: 18 },
  histPairLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textMid,
    marginLeft: 2,
  },
  histRate: { fontSize: 22, fontWeight: "700", color: C.text, marginBottom: 2 },
  histQuote: { fontSize: 13, fontWeight: "400", color: C.textLight },
  histPeriodCol: { gap: 4 },
  histPeriodBtn: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: C.bg,
  },
  histPeriodBtnActive: { backgroundColor: "#EFF6FF" },
  histPeriodText: { fontSize: 11, fontWeight: "600", color: C.textLight },
  histPeriodTextActive: { color: C.action },
  histChartLoader: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textLight,
    textTransform: "uppercase",
    letterSpacing: 1.0,
  },

  // Rate rows
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  rateRowActive: { borderColor: C.action, backgroundColor: "#FAFCFF" },
  rateLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  flagRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  flag: { fontSize: 18 },
  ratePair: { fontSize: 14, fontWeight: "600", color: C.text, marginBottom: 2 },
  rateDate: { fontSize: 11, color: C.textLight },
  rateVal: { fontSize: 16, fontWeight: "700", color: C.primary },

  // Exchange cards
  exchangeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  exchangeTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  exchangePairRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  exchangeFlag: { fontSize: 22 },
  exchangeArrowWrap: { width: 20, alignItems: "center" },
  exchangePair: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
    marginBottom: 2,
  },
  exchangeDate: { fontSize: 11, color: C.textLight },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  exchangeAmounts: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountCol: { flex: 1 },
  amountLabel: {
    fontSize: 11,
    color: C.textLight,
    marginBottom: 3,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  amountVal: { fontSize: 16, fontWeight: "700", color: C.text },
  amountCur: { fontSize: 12, fontWeight: "600", color: C.textMid },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: C.textMid,
    marginTop: 14,
  },
  emptySub: {
    fontSize: 13,
    color: C.textLight,
    marginTop: 6,
    textAlign: "center",
  },
});
