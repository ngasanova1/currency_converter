import { Ionicons } from "@expo/vector-icons";
import { CurrencyPicker } from "@/components/currency-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../AuthProvider";
import api from "../api";
import { convertAmount, getRate } from "../../coingecko";
import { useResponsive } from "../../hooks/use-responsive";

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
  pending: "#D97706",
  pendingBg: "#FFFBEB",
};

const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", CHF: "🇨🇭",
  CAD: "🇨🇦", AUD: "🇦🇺", NZD: "🇳🇿", CNY: "🇨🇳", INR: "🇮🇳",
  MXN: "🇲🇽", BRL: "🇧🇷", RUB: "🇷🇺", BTC: "₿", ETH: "Ξ",
};

function getFlag(code: string) {
  return CURRENCY_FLAGS[code] || "💱";
}

function statusColor(status: string) {
  if (status === "completed") return { color: C.success, bg: C.successBg };
  return { color: C.pending, bg: C.pendingBg };
}

function statusLabel(status: string) {
  if (status === "completed") return "Выполнено";
  if (status === "pending") return "В обработке";
  return status;
}

function formatPreview(val: number | null): string {
  if (val === null) return "—";
  return val.toFixed(2);
}

export default function ExchangeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { centered, hPad, isWide } = useResponsive();

  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState("100");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"from" | "to" | null>(null);

  // Live rate preview
  const [liveRate, setLiveRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const rateFetchRef = useRef(0);

  function handleSwap() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
    setLiveRate(null);
  }

  // Fetch live rate when currencies change
  useEffect(() => {
    if (fromCurrency === toCurrency) { setLiveRate(1); return; }
    const token = ++rateFetchRef.current;
    setRateLoading(true);
    setLiveRate(null);
    getRate(fromCurrency, toCurrency)
      .then((r) => {
        if (rateFetchRef.current === token) setLiveRate(r);
      })
      .catch(() => {
        if (rateFetchRef.current === token) setLiveRate(null);
      })
      .finally(() => {
        if (rateFetchRef.current === token) setRateLoading(false);
      });
  }, [fromCurrency, toCurrency]);

  // Estimated "to" amount from live rate
  const numAmount = Number(amount.replace(",", ".")) || 0;
  const estimatedTo = liveRate !== null && numAmount > 0
    ? numAmount * liveRate
    : null;

  async function handleExchange() {
    if (!user?.id) {
      Alert.alert(
        "Требуется вход",
        "Авторизуйтесь для создания заявки на обмен",
        [
          { text: "Отмена", style: "cancel" },
          { text: "Войти", onPress: () => router.push("/login") },
        ]
      );
      return;
    }
    if (!amount || numAmount <= 0) {
      return Alert.alert("Некорректная сумма", "Введите сумму больше нуля");
    }
    setLoading(true);
    try {
      const res = await api.createExchange(
        user.id,
        fromCurrency,
        toCurrency,
        numAmount,
        liveRate ?? 0,
        estimatedTo ?? 0,
      );
      setResult(res);
    } catch (err: any) {
      Alert.alert("Ошибка", err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const sc = result ? statusColor(result.status) : null;

  return (
    <View style={{ flex: 1 }}>
      {/* ── PAGE HEADER (fixed above scroll) ── */}
      <View style={[styles.pageHeader, { paddingTop: insets.top + 16 }]}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <Text style={styles.pageTitle}>Обмен валют</Text>
        <Text style={styles.pageSubtitle}>
          Переводите между валютами и криптовалютами
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
      <ScrollView
        style={[styles.root, { backgroundColor: C.bg }]}
        contentContainerStyle={[
          { flexGrow: 1, justifyContent: "center", paddingVertical: 24 },
          isWide && { alignItems: "center" },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── CONTENT WRAPPER ── */}
        <View style={[centered(560), isWide && { width: "100%", maxWidth: 560 }, { width: "100%" }]}>
          {/* ── EXCHANGE CARD ── */}
          <View style={[styles.exchangeCard, { marginHorizontal: hPad }]}>
            {/* FROM */}
            <View style={styles.halfSection}>
              <Text style={styles.sectionLabel}>Отдаёте</Text>
              <View style={styles.currencyRow}>
                <TouchableOpacity
                  style={styles.currencyPill}
                  onPress={() => setPickerTarget("from")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.flagEmoji}>{getFlag(fromCurrency)}</Text>
                  <Text style={styles.currencyCode}>{fromCurrency}</Text>
                  <Ionicons
                    name="chevron-down"
                    size={14}
                    color={C.primary}
                    style={{ marginLeft: 2 }}
                  />
                </TouchableOpacity>
                <TextInput
                  value={amount}
                  onChangeText={(v) => {
                    setAmount(v);
                    setResult(null);
                  }}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={C.textLight}
                  style={styles.amountInput}
                  maxLength={12}
                />
              </View>
            </View>

            {/* SWAP DIVIDER */}
            <View style={styles.swapRow}>
              <View style={styles.swapLine} />
              <TouchableOpacity
                style={styles.swapBtn}
                onPress={handleSwap}
                activeOpacity={0.75}
              >
                <Ionicons name="swap-vertical" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.swapLine} />
            </View>

            {/* TO */}
            <View style={styles.halfSection}>
              <Text style={styles.sectionLabel}>Получаете</Text>
              <View style={styles.currencyRow}>
                <TouchableOpacity
                  style={styles.currencyPill}
                  onPress={() => setPickerTarget("to")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.flagEmoji}>{getFlag(toCurrency)}</Text>
                  <Text style={styles.currencyCode}>{toCurrency}</Text>
                  <Ionicons
                    name="chevron-down"
                    size={14}
                    color={C.primary}
                    style={{ marginLeft: 2 }}
                  />
                </TouchableOpacity>
                {rateLoading ? (
                  <ActivityIndicator
                    color={C.action}
                    style={styles.rateSpinner}
                  />
                ) : (
                  <Text
                    style={[
                      styles.toAmount,
                      !estimatedTo && !result && { color: C.textLight, fontSize: 24 },
                    ]}
                  >
                    {result
                      ? formatPreview(Number(result.to_amount))
                      : estimatedTo !== null
                      ? formatPreview(estimatedTo)
                      : "—"}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* ── LIVE RATE HINT ── */}
          <View style={[styles.rateHint, { marginHorizontal: hPad }]}>
            <Ionicons
              name={rateLoading ? "sync-outline" : "information-circle-outline"}
              size={14}
              color={C.action}
            />
            <Text style={styles.rateHintText}>
              {rateLoading
                ? "Загрузка курса..."
                : liveRate !== null
                ? `Курс CoinGecko: 1 ${fromCurrency} = ${formatPreview(liveRate)} ${toCurrency}`
                : "Курс фиксируется в момент создания заявки"}
            </Text>
          </View>

          {/* ── SUBMIT ── */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              { marginHorizontal: hPad },
              loading && { opacity: 0.7 },
            ]}
            onPress={handleExchange}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="arrow-forward-circle"
                  size={20}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.submitBtnText}>Создать заявку</Text>
              </>
            )}
          </TouchableOpacity>

          {/* ── RESULT CARD ── */}
          {result && sc && (
            <View
              style={[
                styles.resultCard,
                { marginHorizontal: hPad, backgroundColor: sc.bg },
              ]}
            >
              <View style={styles.resultHeader}>
                <Ionicons name="checkmark-circle" size={22} color={sc.color} />
                <Text style={[styles.resultTitle, { color: sc.color }]}>
                  Заявка создана
                </Text>
              </View>
              <ResultRow
                label="Статус"
                value={statusLabel(result.status)}
                valueColor={sc.color}
              />
              <ResultRow
                label="Отдаёте"
                value={`${numAmount.toFixed(2)} ${fromCurrency}`}
              />
              <ResultRow
                label="Получаете"
                value={`${formatPreview(Number(result.to_amount))} ${toCurrency}`}
                valueColor={C.primary}
                bold
              />
              {result.rate && (
                <ResultRow
                  label="Курс сделки"
                  value={`1 ${fromCurrency} = ${formatPreview(Number(result.rate))} ${toCurrency}`}
                />
              )}
              {liveRate !== null && (
                <ResultRow
                  label="Курс CoinGecko"
                  value={`1 ${fromCurrency} = ${formatPreview(liveRate)} ${toCurrency}`}
                />
              )}
            </View>
          )}

          {/* ── INFO BLOCK ── */}
          <View style={[styles.infoBlock, { marginHorizontal: hPad }]}>
            <InfoRow icon="shield-checkmark-outline" text="Защищённая транзакция" />
            <InfoRow icon="time-outline" text="Обработка до 24 часов" />
            <InfoRow icon="wallet-outline" text="Без скрытых комиссий" />
          </View>
        </View>
      </ScrollView>

      </KeyboardAvoidingView>

      {/* Currency picker modal */}

      <CurrencyPicker
        visible={pickerTarget !== null}
        selectedCurrency={
          pickerTarget === "from" ? fromCurrency : toCurrency
        }
        onSelect={(cur) => {
          if (pickerTarget === "from") {
            if (cur === toCurrency) setToCurrency(fromCurrency);
            setFromCurrency(cur);
          } else {
            if (cur === fromCurrency) setFromCurrency(toCurrency);
            setToCurrency(cur);
          }
          setResult(null);
          setPickerTarget(null);
        }}
        onClose={() => setPickerTarget(null)}
      />
    </View>
  );
}

function ResultRow({
  label,
  value,
  valueColor,
  bold,
}: {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
}) {
  return (
    <View style={rr.row}>
      <Text style={rr.label}>{label}</Text>
      <Text
        style={[
          rr.value,
          valueColor ? { color: valueColor } : {},
          bold ? { fontWeight: "700" } : {},
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const rr = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  label: { fontSize: 13, color: C.textMid },
  value: { fontSize: 13, fontWeight: "600", color: C.text },
});

function InfoRow({
  icon,
  text,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  text: string;
}) {
  return (
    <View style={ir.row}>
      <Ionicons name={icon} size={16} color={C.textLight} style={ir.icon} />
      <Text style={ir.text}>{text}</Text>
    </View>
  );
}

const ir = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  icon: { marginRight: 8 },
  text: { fontSize: 13, color: C.textLight },
});

const styles = StyleSheet.create({
  root: { flex: 1 },

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
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
    lineHeight: 32,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 18,
  },

  exchangeCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },

  halfSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textLight,
    textTransform: "uppercase",
    letterSpacing: 1.0,
    marginBottom: 12,
  },
  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currencyPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bg,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: C.border,
    gap: 6,
  },
  flagEmoji: { fontSize: 20 },
  currencyCode: { fontSize: 16, fontWeight: "700", color: C.primary },
  amountInput: {
    fontSize: 32,
    fontWeight: "700",
    color: C.text,
    flex: 1,
    minWidth: 0,
    textAlign: "right",
    outlineWidth: 0,
    paddingVertical: 4,
    paddingHorizontal: 8,
  } as any,
  toAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: C.action,
    textAlign: "right",
    flex: 1,
    minWidth: 0,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  rateSpinner: { flex: 1, marginRight: 8 },

  swapRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  swapLine: { flex: 1, height: 1, backgroundColor: C.border },
  swapBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.15)",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },

  rateHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
    backgroundColor: "#F0F4FF",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  rateHintText: { fontSize: 12, color: C.action, fontWeight: "500", flex: 1 },

  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
    borderRadius: 16,
    height: 58,
    marginTop: 24,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  resultCard: {
    marginTop: 16,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  resultTitle: { fontSize: 15, fontWeight: "700" },

  infoBlock: {
    marginTop: 24,
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },

});
