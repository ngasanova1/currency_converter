import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
};

export default function ContactsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { centered } = useResponsive();
  const [contacts, setContacts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getContacts();
        setContacts(res);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function openUrl(url: string) {
    if (!url) return;
    const full = url.startsWith("http") ? url : `https://${url}`;
    Linking.openURL(full).catch(() => {});
  }

  function openEmail(email: string) {
    if (!email) return;
    Linking.openURL(`mailto:${email}`).catch(() => {});
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: C.bg }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
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
        <Text style={styles.pageTitle}>Контакты</Text>
        <Text style={styles.pageSubtitle}>
          Мы всегда готовы помочь вам
        </Text>
      </View>

      <View style={[styles.content, centered(640)]}>
        {loading ? (
          <ActivityIndicator
            color={C.primary}
            size="large"
            style={{ marginTop: 48 }}
          />
        ) : (
          <>
            {/* ── TECH SUPPORT ── */}
            <ContactSection
              icon="headset-outline"
              iconBg="#EFF6FF"
              iconColor={C.action}
              title="Техническая поддержка"
              subtitle="Онлайн-помощь 24 часа в сутки, 7 дней в неделю"
              badge="24/7"
              badgeColor={C.success}
              items={[
                {
                  icon: "mail-outline",
                  label: "Email поддержки",
                  value: contacts?.support || "support@exchangepro.app",
                  onPress: () =>
                    openEmail(contacts?.support || "support@exchangepro.app"),
                },
                {
                  icon: "chatbubble-outline",
                  label: "Онлайн-чат",
                  value: "Написать в чат",
                  onPress: () => {},
                },
              ]}
            />

            {/* ── FEEDBACK ── */}
            <ContactSection
              icon="create-outline"
              iconBg="#FDF4FF"
              iconColor="#9333EA"
              title="Обратная связь"
              subtitle="Предложения и пожелания по улучшению сервиса"
              items={[
                {
                  icon: "globe-outline",
                  label: "Форма обратной связи",
                  value:
                    contacts?.feedback_url
                      ? contacts.feedback_url
                      : "feedback.exchangepro.app",
                  onPress: () =>
                    openUrl(
                      contacts?.feedback_url || "https://feedback.exchangepro.app"
                    ),
                },
                {
                  icon: "mail-outline",
                  label: "Email для предложений",
                  value: "feedback@exchangepro.app",
                  onPress: () => openEmail("feedback@exchangepro.app"),
                },
              ]}
            />

            {/* ── REVIEWS ── */}
            <ContactSection
              icon="star-outline"
              iconBg="#FFFBEB"
              iconColor="#D97706"
              title="Отзывы о сервисе"
              subtitle="Ваше мнение помогает нам становиться лучше"
              items={[
                {
                  icon: "star-outline",
                  label: "Оставить отзыв",
                  value: "App Store / Google Play",
                  onPress: () => {},
                },
                {
                  icon: "chatbubbles-outline",
                  label: "Отзывы в Telegram",
                  value: "@ExchangePro_reviews",
                  onPress: () =>
                    openUrl("https://t.me/ExchangePro_reviews"),
                },
              ]}
            />

            {/* ── SOCIAL BLOCK ── */}
            <View style={styles.socialCard}>
              <Text style={styles.socialTitle}>Мы в социальных сетях</Text>
              <View style={styles.socialRow}>
                <SocialBtn
                  icon="logo-telegram"
                  label="Telegram"
                  color="#2AABEE"
                  onPress={() => openUrl("https://t.me/exchangepro")}
                />
                <SocialBtn
                  icon="logo-instagram"
                  label="Instagram"
                  color="#E4405F"
                  onPress={() =>
                    openUrl("https://instagram.com/exchangepro")
                  }
                />
                <SocialBtn
                  icon="logo-vk"
                  label="VKontakte"
                  color="#4C75A3"
                  onPress={() => openUrl("https://vk.com/exchangepro")}
                />
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

function ContactSection({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  badge,
  badgeColor,
  items,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  items: {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    label: string;
    value: string;
    onPress: () => void;
  }[];
}) {
  return (
    <View style={cs.card}>
      <View style={cs.header}>
        <View style={[cs.iconWrap, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={cs.titleRow}>
            <Text style={cs.title}>{title}</Text>
            {badge && (
              <View style={[cs.badge, { backgroundColor: badgeColor }]}>
                <Text style={cs.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          <Text style={cs.subtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={cs.divider} />
      {items.map((item, i) => (
        <TouchableOpacity
          key={i}
          style={cs.item}
          onPress={item.onPress}
          activeOpacity={0.7}
        >
          <Ionicons name={item.icon} size={16} color={C.textLight} style={cs.itemIcon} />
          <View style={{ flex: 1 }}>
            <Text style={cs.itemLabel}>{item.label}</Text>
            <Text style={cs.itemValue} numberOfLines={1}>
              {item.value}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color={C.textLight} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const cs = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  header: { flexDirection: "row", alignItems: "flex-start", padding: 16, gap: 14 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  title: { fontSize: 15, fontWeight: "700", color: C.text },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#FFFFFF" },
  subtitle: { fontSize: 12, color: C.textLight, lineHeight: 18 },
  divider: { height: 1, backgroundColor: C.border },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemIcon: { marginRight: 12 },
  itemLabel: { fontSize: 12, color: C.textLight, marginBottom: 2 },
  itemValue: { fontSize: 14, fontWeight: "600", color: C.action },
});

function SocialBtn({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[sb.btn, { borderColor: color + "33" }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[sb.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const sb = StyleSheet.create({
  btn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginHorizontal: 4,
    gap: 6,
  },
  label: { fontSize: 12, fontWeight: "600" },
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

  socialCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  socialTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
    marginBottom: 14,
    textAlign: "center",
  },
  socialRow: { flexDirection: "row", gap: 8 },
});
