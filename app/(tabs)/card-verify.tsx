import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
  successBorder: "#A7F3D0",
  error: "#DC2626",
};

function formatCardNumber(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function getCardDisplay(digits: string) {
  const d = digits.padEnd(16, "•");
  return `${d.slice(0, 4)} ${d.slice(4, 8)} ${d.slice(8, 12)} ${d.slice(12, 16)}`;
}

export default function CardVerifyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { centered, isWide } = useResponsive();

  const [card, setCard] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const rawDigits = card.replace(/\D/g, "");

  async function handleVerify() {
    if (!user?.id) {
      Alert.alert(
        "Требуется вход",
        "Войдите в аккаунт для верификации карты",
        [
          { text: "Отмена", style: "cancel" },
          { text: "Войти", onPress: () => router.push("/login") },
        ]
      );
      return;
    }
    if (rawDigits.length < 16) {
      return Alert.alert("Ошибка", "Введите полный номер карты (16 цифр)");
    }
    setLoading(true);
    try {
      const res = await api.verifyCard(user.id, rawDigits);
      setResult(res);
    } catch (err: any) {
      Alert.alert("Ошибка верификации", err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={[styles.root, { backgroundColor: C.bg }]}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── PAGE HEADER ── */}
        <View style={[styles.pageHeader, { paddingTop: insets.top + 16 }]}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Верификация карты</Text>
          <Text style={styles.pageSubtitle}>
            Подтвердите вашу банковскую карту
          </Text>
        </View>

        <View style={[styles.content, centered(420)]}>
          {/* ── CARD VISUAL ── */}
          <View style={[
            styles.cardVisual,
            isWide && { alignSelf: "center", width: 360 },
          ]}>
            <View style={styles.cardTop}>
              <View style={styles.cardChipWrap}>
                <View style={styles.cardChip} />
              </View>
              <Ionicons name="wifi" size={18} color="rgba(255,255,255,0.6)" style={{ transform: [{ rotate: "90deg" }] }} />
            </View>
            <Text style={styles.cardNumberDisplay}>
              {getCardDisplay(rawDigits)}
            </Text>
            <View style={styles.cardBottom}>
              <View>
                <Text style={styles.cardLabel}>Держатель карты</Text>
                <Text style={styles.cardValue}>CARD HOLDER</Text>
              </View>
              {result ? (
                <View style={styles.cardVerifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#6EE7B7" />
                  <Text style={styles.cardVerifiedText}>Верифицирована</Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.cardLabel}>Действует до</Text>
                  <Text style={styles.cardValue}>MM/YY</Text>
                </View>
              )}
            </View>
          </View>

          {/* ── INPUT FORM ── */}
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Номер карты</Text>
            <View
              style={[
                styles.inputWrap,
                focused && styles.inputWrapFocused,
              ]}
            >
              <Ionicons
                name="card-outline"
                size={20}
                color={focused ? C.action : C.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                value={formatCardNumber(card)}
                onChangeText={(v) => setCard(v.replace(/\D/g, ""))}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={C.textLight}
                keyboardType="number-pad"
                maxLength={19}
                style={styles.cardInput}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
              {rawDigits.length === 16 && (
                <Ionicons name="checkmark-circle" size={20} color={C.success} />
              )}
            </View>
            <Text style={styles.inputHint}>
              Введите 16-значный номер с лицевой стороны карты
            </Text>
          </View>

          {/* ── SECURITY INFO ── */}
          <View style={styles.securityRow}>
            <Ionicons name="lock-closed" size={14} color={C.success} />
            <Text style={styles.securityText}>
              Данные защищены 256-битным шифрованием SSL
            </Text>
          </View>

          {/* ── SUBMIT ── */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (loading || rawDigits.length < 16) && styles.submitBtnDisabled,
            ]}
            onPress={handleVerify}
            disabled={loading || rawDigits.length < 16}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.submitBtnText}>Верифицировать карту</Text>
              </>
            )}
          </TouchableOpacity>

          {/* ── RESULT ── */}
          {result && (
            <View style={styles.resultCard}>
              <View style={styles.resultIconWrap}>
                <Ionicons name="checkmark-circle" size={40} color={C.success} />
              </View>
              <Text style={styles.resultTitle}>Карта верифицирована!</Text>
              <Text style={styles.resultSub}>
                Карта •••• •••• •••• {result.card_last4} успешно привязана к
                вашему аккаунту
              </Text>
              <TouchableOpacity
                style={styles.resultBtn}
                onPress={() => router.push("/(tabs)/profile")}
                activeOpacity={0.85}
              >
                <Text style={styles.resultBtnText}>Перейти в профиль</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── INFO BLOCK ── */}
          <View style={styles.infoBlock}>
            <InfoRow
              icon="shield-outline"
              text="Мы не храним полные данные карты"
            />
            <InfoRow
              icon="card-outline"
              text="Поддерживаются Visa, Mastercard, МИР"
            />
            <InfoRow
              icon="lock-closed-outline"
              text="Верификация занимает несколько секунд"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InfoRow({
  icon,
  text,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  text: string;
}) {
  return (
    <View style={ir.row}>
      <Ionicons name={icon} size={15} color={C.textLight} style={ir.icon} />
      <Text style={ir.text}>{text}</Text>
    </View>
  );
}

const ir = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  icon: { marginRight: 8 },
  text: { fontSize: 12, color: C.textLight, flex: 1 },
});

const styles = StyleSheet.create({
  root: { flex: 1 },

  pageHeader: {
    paddingHorizontal: 20,
    paddingBottom: 24,
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
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

  content: { padding: 16 },

  cardVisual: {
    backgroundColor: C.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  cardChipWrap: {},
  cardChip: {
    width: 36,
    height: 28,
    borderRadius: 6,
    backgroundColor: "rgba(255,200,100,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,220,120,0.5)",
  },
  cardNumberDisplay: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 3,
    marginBottom: 24,
    fontVariant: ["tabular-nums"],
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  cardValue: { fontSize: 13, fontWeight: "600", color: "#FFFFFF", letterSpacing: 0.5 },
  cardVerifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(6,78,59,0.5)",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 4,
  },
  cardVerifiedText: { fontSize: 11, color: "#6EE7B7", fontWeight: "600" },

  formCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  formLabel: { fontSize: 13, fontWeight: "600", color: C.text, marginBottom: 10 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapFocused: { borderColor: C.action, backgroundColor: "#FAFCFF" },
  inputIcon: { marginRight: 10 },
  cardInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    letterSpacing: 2,
    outlineWidth: 0,
  } as any,
  inputHint: { fontSize: 12, color: C.textLight, marginTop: 8 },

  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  securityText: { fontSize: 12, color: C.success, fontWeight: "500" },

  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
    borderRadius: 14,
    height: 54,
    marginBottom: 20,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },

  resultCard: {
    backgroundColor: C.successBg,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.successBorder,
  },
  resultIconWrap: { marginBottom: 12 },
  resultTitle: { fontSize: 18, fontWeight: "700", color: C.success, marginBottom: 8 },
  resultSub: {
    fontSize: 13,
    color: C.textMid,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  resultBtn: {
    backgroundColor: C.success,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  resultBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },

  infoBlock: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
});
