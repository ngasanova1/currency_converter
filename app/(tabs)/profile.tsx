import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
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
  error: "#DC2626",
  errorBg: "#FEF2F2",
  errorBorder: "#FECACA",
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, loading, logout, token } = useAuth();
  const { centered, sectionGap } = useResponsive();

  const [cards, setCards] = useState<any[]>([]);
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user?.id) {
        setCardsLoading(false);
        return;
      }
      try {
        const [cardsRes, exchRes] = await Promise.all([
          api.getCards(user.id),
          api.getExchanges(user.id),
        ]);
        setCards(cardsRes.data || []);
        setExchanges(exchRes.data || []);
      } catch {
        // silent
      } finally {
        setCardsLoading(false);
      }
    })();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: C.bg }]}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  const isGuest = !user;

  const initials = isGuest ? null : (user.name || user.email || "?")
    .split(" ")
    .map((s: string) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const completedExchanges = exchanges.filter(
    (e) => e.status === "completed"
  ).length;

  function confirmLogout() {
    const doLogout = () => {
      logout?.();
      router.replace("/login");
    };
    if (Platform.OS === "web") {
      if (window.confirm("Вы уверены, что хотите выйти из аккаунта?")) doLogout();
      return;
    }
    Alert.alert("Выйти?", "Вы уверены, что хотите выйти из аккаунта?", [
      { text: "Отмена", style: "cancel" },
      { text: "Выйти", style: "destructive", onPress: doLogout },
    ]);
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: C.bg }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* ── BANNER ── */}
      <View style={[styles.banner, { paddingTop: insets.top + 20 }]}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        {isGuest ? (
          <>
            <View style={[styles.avatarWrap, styles.avatarWrapGuest]}>
              <Ionicons name="person-outline" size={34} color="rgba(255,255,255,0.7)" />
            </View>
            <Text style={styles.bannerName}>Гость</Text>
            <Text style={styles.bannerEmail}>Войдите для доступа к личному кабинету</Text>
            <View style={styles.guestBannerBtns}>
              <TouchableOpacity
                style={styles.bannerLoginBtn}
                onPress={() => router.push("/login")}
                activeOpacity={0.85}
              >
                <Text style={styles.bannerLoginBtnText}>Войти</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bannerRegBtn}
                onPress={() => router.push("/register")}
                activeOpacity={0.85}
              >
                <Text style={styles.bannerRegBtnText}>Регистрация</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.bannerName}>{user.name || "Пользователь"}</Text>
            <Text style={styles.bannerEmail}>{user.email}</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#6EE7B7" />
              <Text style={styles.verifiedText}>Аккаунт активен</Text>
            </View>
          </>
        )}
      </View>

      <View style={centered(640)}>
        {/* ── STATS ROW ── */}
        <View style={styles.statsRow}>
          <StatCard
            icon="swap-horizontal-outline"
            label="Всего заявок"
            value={String(exchanges.length)}
          />
          <StatCard
            icon="checkmark-circle-outline"
            label="Выполнено"
            value={String(completedExchanges)}
            valueColor={C.success}
          />
          <StatCard
            icon="card-outline"
            label="Карт"
            value={String(cards.length)}
          />
        </View>

        {/* ── CARDS SECTION (logged-in only) ── */}
        {!isGuest && <View style={[styles.section, { marginBottom: sectionGap }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Сохранённые карты</Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/card-verify")}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionAction}>+ Добавить</Text>
            </TouchableOpacity>
          </View>

          {cardsLoading ? (
            <ActivityIndicator color={C.primary} style={{ marginVertical: 16 }} />
          ) : cards.length === 0 ? (
            <TouchableOpacity
              style={styles.addCardBtn}
              onPress={() => router.push("/(tabs)/card-verify")}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={20} color={C.action} />
              <Text style={styles.addCardText}>Верифицировать карту</Text>
              <Ionicons name="chevron-forward" size={16} color={C.textLight} />
            </TouchableOpacity>
          ) : (
            cards.map((card, i) => (
              <View key={card.id || i} style={styles.cardItem}>
                <View style={styles.cardIconWrap}>
                  <Ionicons name="card" size={22} color={C.action} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardNumber}>
                    •••• •••• •••• {card.card_last4}
                  </Text>
                  <Text style={styles.cardSub}>Верифицирована</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color={C.success} />
              </View>
            ))
          )}
        </View>}

        {/* ── QUICK ACTIONS ── */}
        <View style={[styles.section, { marginBottom: sectionGap }]}>
          <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>
            Быстрые действия
          </Text>
          <SettingsRow
            icon="swap-horizontal-outline"
            label="Создать заявку на обмен"
            onPress={() => router.push("/(tabs)/exchange")}
          />
          <SettingsRow
            icon="time-outline"
            label="История заявок"
            onPress={() => router.push("/(tabs)/history")}
          />
          <SettingsRow
            icon="help-circle-outline"
            label="Часто задаваемые вопросы"
            onPress={() => router.push("/(tabs)/faq")}
          />
          <SettingsRow
            icon="chatbubble-outline"
            label="Контакты и поддержка"
            onPress={() => router.push("/(tabs)/contacts")}
          />
        </View>

        {/* ── LOGOUT (logged-in only) ── */}
        {!isGuest && (
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={confirmLogout}
            activeOpacity={0.8}
          >
            <Ionicons
              name="log-out-outline"
              size={18}
              color={C.error}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.logoutText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={sc.card}>
      <Ionicons name={icon} size={20} color={valueColor || C.primary} />
      <Text style={[sc.value, valueColor ? { color: valueColor } : {}]}>
        {value}
      </Text>
      <Text style={sc.label}>{label}</Text>
    </View>
  );
}

const sc = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  value: { fontSize: 22, fontWeight: "700", color: C.primary, marginTop: 6, marginBottom: 2 },
  label: {
    fontSize: 10,
    color: C.textLight,
    fontWeight: "600",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});

function SettingsRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={sr.row} onPress={onPress} activeOpacity={0.7}>
      <View style={sr.iconWrap}>
        <Ionicons name={icon} size={18} color={C.primary} />
      </View>
      <Text style={sr.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={C.textLight} />
    </TouchableOpacity>
  );
}

const sr = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  label: { flex: 1, fontSize: 14, fontWeight: "500", color: C.text },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  banner: {
    backgroundColor: C.primary,
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  decoCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -80,
    right: -60,
  },
  decoCircle2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: -40,
    left: 10,
  },
  avatarWrapGuest: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  guestBannerBtns: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  bannerLoginBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  bannerLoginBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  bannerRegBtn: {
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  bannerRegBtnText: { color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: "600" },

  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: "700", color: "#FFFFFF" },
  bannerName: { fontSize: 22, fontWeight: "700", color: "#FFFFFF", marginBottom: 4 },
  bannerEmail: { fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 10 },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 4,
  },
  verifiedText: { fontSize: 11, color: "#6EE7B7", fontWeight: "600" },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 16,
  },

  section: { marginHorizontal: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textLight,
    textTransform: "uppercase",
    letterSpacing: 1.0,
  },
  sectionAction: { fontSize: 13, fontWeight: "600", color: C.action },

  addCardBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: C.action,
    borderStyle: "dashed",
    gap: 10,
  },
  addCardText: { flex: 1, fontSize: 14, fontWeight: "600", color: C.action },

  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardSub: { fontSize: 11, color: C.success, fontWeight: "600" },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: C.errorBg,
    borderWidth: 1,
    borderColor: C.errorBorder,
  },
  logoutText: { fontSize: 15, fontWeight: "700", color: C.error },
});
