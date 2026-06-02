import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
};

type MenuItem = {
  label: string;
  sub: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconBg: string;
  iconColor: string;
  action: () => void;
};

export default function MoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { centered, hPad, sectionGap } = useResponsive();

  const sections: { title: string; items: MenuItem[] }[] = [
    {
      title: "Обмен и курсы",
      items: [
        {
          label: "Создать заявку",
          sub: "Обменять валюту или криптовалюту",
          icon: "swap-horizontal-outline",
          iconBg: "#EFF6FF",
          iconColor: C.action,
          action: () => router.push("/(tabs)/exchange"),
        },
        {
          label: "Курсы валют",
          sub: "Текущие котировки и графики",
          icon: "stats-chart-outline",
          iconBg: "#F0FDF4",
          iconColor: "#059669",
          action: () => router.push("/(tabs)/rates"),
        },
        {
          label: "История заявок",
          sub: "Все ваши операции обмена",
          icon: "time-outline",
          iconBg: "#FFF7ED",
          iconColor: "#D97706",
          action: () => router.push("/(tabs)/history"),
        },
      ],
    },
    {
      title: "Информация",
      items: [
        {
          label: "FAQ",
          sub: "Ответы на частые вопросы",
          icon: "help-circle-outline",
          iconBg: "#EFF6FF",
          iconColor: C.primary,
          action: () => router.push("/(tabs)/faq"),
        },
        {
          label: "Контакты",
          sub: "Поддержка, обратная связь, отзывы",
          icon: "chatbubble-ellipses-outline",
          iconBg: "#FDF4FF",
          iconColor: "#9333EA",
          action: () => router.push("/(tabs)/contacts"),
        },
      ],
    },
    {
      title: "Безопасность",
      items: [
        {
          label: "Верификация карты",
          sub: "Привязать и подтвердить карту",
          icon: "shield-checkmark-outline",
          iconBg: "#F0FDF4",
          iconColor: "#059669",
          action: () => router.push("/(tabs)/card-verify"),
        },
      ],
    },
  ];

  // iconPad(16) + iconSize(40) + iconMarginRight(14) = 70
  const dividerLeft = hPad + 40 + 14;

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
        <Text style={styles.pageTitle}>Меню</Text>
        <Text style={styles.pageSubtitle}>Все функции сервиса</Text>
      </View>

      {/* ── SECTIONS ── */}
      <View style={[styles.content, centered(640)]}>
        {sections.map((section, si) => (
          <View
            key={si}
            style={[styles.sectionWrap, { marginBottom: sectionGap }]}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <React.Fragment key={idx}>
                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={item.action}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.menuIconWrap,
                        { backgroundColor: item.iconBg },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={item.iconColor}
                      />
                    </View>
                    <View style={styles.menuLabels}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      <Text style={styles.menuSub}>{item.sub}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={C.textLight}
                    />
                  </TouchableOpacity>
                  {idx < section.items.length - 1 && (
                    <View
                      style={[styles.rowDivider, { marginLeft: dividerLeft }]}
                    />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* ── FOOTER ── */}
      {/* <View style={styles.footer}>
        <View style={styles.footerLogoRow}>
          <Ionicons name="swap-horizontal" size={16} color={C.textLight} />
          <Text style={styles.footerAppName}>ExchangePro</Text>
        </View>
        <Text style={styles.footerVersion}>Версия 1.0.0</Text>
        <Text style={styles.footerCopy}>
          Надёжный обмен валют с 2024 года
        </Text>
      </View> */}
    </ScrollView>
  );
}

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
    marginBottom: 4,
    lineHeight: 32,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 20,
  },

  content: { padding: 16 },

  sectionWrap: {},
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textLight,
    textTransform: "uppercase",
    letterSpacing: 1.0,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuLabels: { flex: 1 },
  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
    marginBottom: 2,
  },
  menuSub: { fontSize: 12, color: C.textLight },
  rowDivider: {
    height: 1,
    backgroundColor: C.border,
  },

  footer: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  footerLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  footerAppName: { fontSize: 13, fontWeight: "700", color: C.textLight },
  footerVersion: { fontSize: 12, color: C.textLight, marginBottom: 2 },
  footerCopy: { fontSize: 11, color: C.textLight, textAlign: "center" },
});
