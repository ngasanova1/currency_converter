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
  error: "#DC2626",
};

const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", CHF: "🇨🇭",
  CAD: "🇨🇦", AUD: "🇦🇺", NZD: "🇳🇿", CNY: "🇨🇳", INR: "🇮🇳",
  MXN: "🇲🇽", BRL: "🇧🇷", RUB: "🇷🇺", BTC: "₿", ETH: "Ξ",
};

// Days options for the chart period selector
const PERIODS = [
  { label: "7д", days: 7 },
  { label: "30д", days: 30 },
  { label: "90д", days: 90 },
];

type VictoryModule = {
  VictoryChart: any;
  VictoryLine: any;
  VictoryAxis: any;
  VictoryTheme: any;
  VictoryArea: any;
};

function getFlag(code: string) {
  return CURRENCY_FLAGS[code] || "💱";
}

function formatRate(rate: number): string {
  if (rate >= 0.01) return rate.toFixed(2);
  if (rate >= 0.0001) return rate.toFixed(6);
  return rate.toExponential(4);
}

export default function RatesScreen() {
  const insets = useSafeAreaInsets();
  const { centered, chartHeight, sectionGap } = useResponsive();

  const [rates, setRates] = useState<LiveRate[]>([]);
  const [victory, setVictory] = useState<VictoryModule | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPair, setSelectedPair] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartDays, setChartDays] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const chartFetchRef = useRef(0);

  // Filter: "crypto" | "fiat"
  const [filter, setFilter] = useState<"crypto" | "fiat">("crypto");

  async function loadRates() {
    try {
      setError(null);
      const data = await getLiveRates();
      setRates(data);
      // Auto-select first pair
      if (!selectedPair && data.length > 0) {
        setSelectedPair(data[0].pair);
      }
    } catch (e: any) {
      setError("Не удалось загрузить курсы. Проверьте интернет.");
    }
  }

  async function loadChart(pair: string, days: number) {
    const r = rates.find((r) => r.pair === pair);
    if (!r) return;
    const token = ++chartFetchRef.current;
    setChartLoading(true);
    try {
      const data = await getHistoricalChart(r.base, r.quote, days);
      if (chartFetchRef.current === token) {
        setChartData(data);
      }
    } catch {
      if (chartFetchRef.current === token) setChartData([]);
    } finally {
      if (chartFetchRef.current === token) setChartLoading(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadRates().finally(() => setRefreshing(false));
  }

  useEffect(() => {
    (async () => {
      try {
        // @ts-ignore
        const mod: VictoryModule = await import("victory-native");
        // Guard: some components may be undefined on web builds
        if (mod.VictoryChart && mod.VictoryLine && mod.VictoryAxis) {
          setVictory(mod);
        }
      } catch {
        setVictory(null);
      }
    })();
    loadRates().finally(() => setInitialLoading(false));
  }, []);

  // Reload chart when selected pair or days change
  useEffect(() => {
    if (selectedPair) loadChart(selectedPair, chartDays);
  }, [selectedPair, chartDays, rates.length]);

  // Auto-reselect first pair when filter changes
  useEffect(() => {
    if (rates.length === 0) return;
    const filteredRates = rates.filter((r) =>
      filter === "crypto" ? r.base === "BTC" || r.base === "ETH" : r.base !== "BTC" && r.base !== "ETH"
    );
    if (filteredRates.length > 0 && !filteredRates.find((r) => r.pair === selectedPair)) {
      setSelectedPair(filteredRates[0].pair);
    }
  }, [filter, rates.length]);

  // Filtered list
  const filtered = rates.filter((r) =>
    filter === "crypto" ? r.base === "BTC" || r.base === "ETH" : r.base !== "BTC" && r.base !== "ETH"
  );

  const currentPairData = rates.find((r) => r.pair === selectedPair);

  const rateMin = chartData.length ? Math.min(...chartData.map((d) => d.y)) : 0;
  const rateMax = chartData.length ? Math.max(...chartData.map((d) => d.y)) : 1;
  const rateChange =
    chartData.length >= 2
      ? chartData[chartData.length - 1].y - chartData[0].y
      : 0;
  const rateChangePct =
    chartData.length >= 2
      ? ((rateChange / (chartData[0].y || 1)) * 100).toFixed(2)
      : null;
  const trendUp = rateChange >= 0;

  if (initialLoading) {
    return (
      <View style={[styles.loader, { backgroundColor: C.bg }]}>
        <ActivityIndicator color={C.primary} size="large" />
        <Text style={styles.loaderText}>Загрузка курсов...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* ── PAGE HEADER ── */}
      <View style={[styles.pageHeader, { paddingTop: insets.top + 16 }]}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Курсы валют</Text>
            <Text style={styles.pageSubtitle}>
              Данные CoinGecko · обновлено только что
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={onRefresh}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={18} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={centered(680)}>
          {/* ── ERROR ── */}
          {error && (
            <View style={styles.errorCard}>
              <Ionicons name="wifi-outline" size={20} color={C.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={loadRates} style={styles.errorBtn}>
                <Text style={styles.errorBtnText}>Повторить</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── FILTER TABS ── */}
          <View style={styles.filterRow}>
            {(["crypto", "fiat"] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterTab, filter === f && styles.filterTabActive]}
                onPress={() => setFilter(f)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                  {f === "crypto" ? "Крипто" : "Фиатные"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── CHART CARD ── */}
          {currentPairData && victory && victory.VictoryChart && (
            <View style={styles.chartCard}>
              {/* Chart header */}
              <View style={styles.chartTopRow}>
                <View>
                  <View style={styles.chartPairRow}>
                    <Text style={styles.chartFlag}>
                      {getFlag(currentPairData.base)}
                    </Text>
                    <Text style={styles.chartArrow}>→</Text>
                    <Text style={styles.chartFlag}>
                      {getFlag(currentPairData.quote)}
                    </Text>
                    <Text style={styles.chartPairLabel}>
                      {currentPairData.pair}
                    </Text>
                  </View>
                  <Text style={styles.chartRate}>
                    {formatRate(currentPairData.rate)}{" "}
                    <Text style={styles.chartQuote}>{currentPairData.quote}</Text>
                  </Text>
                  {rateChangePct && (
                    <View style={styles.changeRow}>
                      <Ionicons
                        name={trendUp ? "trending-up-outline" : "trending-down-outline"}
                        size={14}
                        color={trendUp ? C.success : C.error}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.changeText, { color: trendUp ? C.success : C.error }]}>
                        {trendUp ? "+" : ""}{rateChangePct}% за {chartDays}д
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.chartStats}>
                  <StatBadge label="Мин" value={formatRate(rateMin)} color={C.error} />
                  <StatBadge label="Макс" value={formatRate(rateMax)} color={C.success} />
                </View>
              </View>

              {/* Period selector */}
              <View style={styles.periodRow}>
                {PERIODS.map((p) => (
                  <TouchableOpacity
                    key={p.days}
                    style={[styles.periodBtn, chartDays === p.days && styles.periodBtnActive]}
                    onPress={() => setChartDays(p.days)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        chartDays === p.days && styles.periodTextActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Chart */}
              {chartLoading ? (
                <View style={[styles.chartLoader, { height: chartHeight }]}>
                  <ActivityIndicator color={C.action} />
                </View>
              ) : chartData.length > 2 ? (
                <victory.VictoryChart
                  height={chartHeight}
                  padding={{ top: 10, bottom: 30, left: 54, right: 16 }}
                  theme={victory.VictoryTheme?.material}
                >
                  <victory.VictoryAxis
                    tickCount={4}
                    tickFormat={(_, i: number) => {
                      const pt = chartData[Math.round((i / 3) * (chartData.length - 1))];
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
                <View style={[styles.chartLoader, { height: chartHeight }]}>
                  <Text style={styles.noChartText}>Нет данных для графика</Text>
                </View>
              )}
            </View>
          )}

          {/* ── RATES LIST ── */}
          <View style={[styles.listSection, { marginTop: sectionGap }]}>
            <Text style={styles.sectionTitle}>
              {filter === "crypto" ? "Криптовалюты" : "Фиатные валюты"}
            </Text>

            {filtered.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="stats-chart-outline" size={36} color={C.textLight} />
                <Text style={styles.emptyText}>Нет данных о курсах</Text>
                <Text style={styles.emptySubtext}>Потяните вниз для обновления</Text>
              </View>
            ) : (
              filtered.map((r) => {
                const isSelected = selectedPair === r.pair;
                const up = (r.change24h ?? 0) >= 0;
                const isCrypto = r.base === "BTC" || r.base === "ETH";
                return (
                  <TouchableOpacity
                    key={r.pair}
                    style={[styles.rateCard, isSelected && styles.rateCardActive]}
                    onPress={() => setSelectedPair(r.pair)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.rateLeft}>
                      <View style={styles.flagStack}>
                        <View
                          style={[
                            styles.flagCircle,
                            isCrypto && styles.flagCircleCrypto,
                          ]}
                        >
                          <Text style={isCrypto ? styles.flagCrypto : styles.flagBig}>
                            {getFlag(r.base)}
                          </Text>
                        </View>
                        <View style={[styles.flagCircleSmall]}>
                          <Text style={styles.flagSmall}>{getFlag(r.quote)}</Text>
                        </View>
                      </View>
                      <View>
                        <Text style={styles.ratePair}>{r.pair}</Text>
                        <Text style={styles.rateBase}>1 {r.base}</Text>
                      </View>
                    </View>
                    <View style={styles.rateRight}>
                      <Text style={styles.rateValue}>{formatRate(r.rate)}</Text>
                      <View style={styles.changeChip}>
                        <Ionicons
                          name={up ? "caret-up" : "caret-down"}
                          size={9}
                          color={up ? C.success : C.error}
                        />
                        {r.change24h !== undefined && (
                          <Text
                            style={[
                              styles.changePct,
                              { color: up ? C.success : C.error },
                            ]}
                          >
                            {Math.abs(r.change24h).toFixed(2)}%
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={sb.wrap}>
      <Text style={sb.label}>{label}</Text>
      <Text style={[sb.value, { color }]}>{value}</Text>
    </View>
  );
}

const sb = StyleSheet.create({
  wrap: { alignItems: "center", marginLeft: 12 },
  label: { fontSize: 10, color: C.textLight, marginBottom: 2 },
  value: { fontSize: 12, fontWeight: "700" },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loaderText: { fontSize: 13, color: C.textLight },

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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    lineHeight: 32,
  },
  pageSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 18,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 14,
    margin: 16,
    marginBottom: 0,
    gap: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: { flex: 1, fontSize: 13, color: C.error },
  errorBtn: {
    backgroundColor: C.error,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  errorBtnText: { fontSize: 12, color: "#FFFFFF", fontWeight: "700" },

  filterRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    backgroundColor: C.bg,
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 10,
  },
  filterTabActive: {
    backgroundColor: C.primary,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTabText: { fontSize: 13, fontWeight: "600", color: C.textMid },
  filterTabTextActive: { color: "#FFFFFF" },

  chartCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
    overflow: "hidden",
  },
  chartTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  chartPairRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 4,
  },
  chartFlag: { fontSize: 18 },
  chartArrow: { fontSize: 12, color: C.textLight },
  chartPairLabel: { fontSize: 14, fontWeight: "700", color: C.textMid, marginLeft: 4 },
  chartRate: { fontSize: 24, fontWeight: "700", color: C.text, marginBottom: 4 },
  chartQuote: { fontSize: 14, fontWeight: "400", color: C.textLight },
  changeRow: { flexDirection: "row", alignItems: "center" },
  changeText: { fontSize: 13, fontWeight: "600" },
  chartStats: { flexDirection: "row", alignItems: "center" },

  periodRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 4,
    gap: 6,
  },
  periodBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: C.bg,
  },
  periodBtnActive: { backgroundColor: "#EFF6FF" },
  periodText: { fontSize: 12, fontWeight: "600", color: C.textLight },
  periodTextActive: { color: C.action },

  chartLoader: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
  },
  noChartText: { fontSize: 13, color: C.textLight },

  listSection: { paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textLight,
    textTransform: "uppercase",
    letterSpacing: 1.0,
    marginBottom: 12,
  },

  rateCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  rateCardActive: { borderColor: C.action, backgroundColor: "#FAFCFF" },
  rateLeft: { flexDirection: "row", alignItems: "center", gap: 12 },

  flagStack: { width: 52, height: 38, position: "relative" },
  flagCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    borderWidth: 1.5,
    borderColor: C.surface,
  },
  flagCircleCrypto: { backgroundColor: "#0F2340" },
  flagCircleSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 1.5,
    borderColor: C.surface,
  },
  flagBig: { fontSize: 18 },
  flagCrypto: { fontSize: 13, fontWeight: "700", color: "#F59E0B" },
  flagSmall: { fontSize: 12 },

  ratePair: { fontSize: 15, fontWeight: "700", color: C.text, marginBottom: 2 },
  rateBase: { fontSize: 12, color: C.textLight },
  rateRight: { alignItems: "flex-end" },
  rateValue: { fontSize: 17, fontWeight: "700", color: C.primary, marginBottom: 2 },
  changeChip: { flexDirection: "row", alignItems: "center", gap: 2 },
  changePct: { fontSize: 11, fontWeight: "600" },

  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyText: { fontSize: 15, fontWeight: "600", color: C.textMid, marginTop: 12 },
  emptySubtext: { fontSize: 13, color: C.textLight, marginTop: 4 },
});
