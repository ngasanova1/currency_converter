import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutAnimation,
  Platform,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsive } from "../../hooks/use-responsive";
import api from "../api";

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

const CATEGORIES = [
  { key: "general", label: "Общие", icon: "help-circle-outline" as const },
  {
    key: "bank_transfers",
    label: "Переводы",
    icon: "swap-horizontal-outline" as const,
  },
  { key: "banks", label: "Банки", icon: "business-outline" as const },
];

const FALLBACK_FAQ: Record<string, { q: string; a: string }[]> = {
  general: [
    {
      q: "Как создать заявку на обмен?",
      a: "Перейдите на вкладку «Обмен», выберите исходную и целевую валюты, введите сумму и нажмите «Создать заявку». Заявка будет обработана в течение 24 часов.",
    },
    {
      q: "Как работает верификация карты?",
      a: "Перейдите в Меню → Верификация карты, введите 16-значный номер карты. После подтверждения карта будет привязана к вашему аккаунту.",
    },
    {
      q: "Какие валюты поддерживаются?",
      a: "Мы поддерживаем USD, EUR, GBP, JPY, RUB, CHF, CAD, AUD, CNY, INR и криптовалюты BTC, ETH.",
    },
    {
      q: "Как отслеживать статус заявки?",
      a: "Все заявки отображаются в разделе «История» на вкладке «Мои заявки». Статус обновляется автоматически.",
    },
  ],
  bank_transfers: [
    {
      q: "Какие реквизиты нужны для перевода?",
      a: "Для банковского перевода потребуется номер счёта или карты получателя, БИК банка (для переводов по России) или SWIFT/IBAN для международных переводов.",
    },
    {
      q: "Сколько времени занимает перевод?",
      a: "Внутрибанковские переводы — мгновенно. Межбанковские внутри страны — от 1 до 3 рабочих дней. Международные SWIFT-переводы — от 1 до 5 рабочих дней.",
    },
    {
      q: "Есть ли лимиты на сумму перевода?",
      a: "Минимальная сумма обмена — эквивалент 10 USD. Максимальная сумма для верифицированных пользователей — 50 000 USD в сутки.",
    },
    {
      q: "Какие комиссии взимаются?",
      a: "Комиссия за обмен зависит от выбранной валютной пары и составляет от 0.5% до 2%. Точная комиссия отображается при создании заявки.",
    },
  ],
  banks: [
    {
      q: "Какие банки поддерживаются?",
      a: "Мы работаем со всеми крупными банками России, стран СНГ и международными банками. Полный список доступен в разделе поддержки.",
    },
    {
      q: "Можно ли переводить через Сбербанк?",
      a: "Да, переводы через Сбербанк, ВТБ, Альфа-Банк, Тинькофф и другие крупные банки поддерживаются в полной мере.",
    },
    {
      q: "Поддерживаются ли платёжные системы?",
      a: "Мы поддерживаем QIWI, ЮMoney, WebMoney, PayPal (для верифицированных аккаунтов) и систему быстрых платежей (СБП).",
    },
    {
      q: "Как добавить новый способ оплаты?",
      a: "Для добавления карты перейдите в Профиль → Сохранённые карты → Добавить карту и пройдите процедуру верификации.",
    },
  ],
};

export default function FAQScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { centered } = useResponsive();

  const [faqData, setFaqData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getFAQ();
        setFaqData(res);
      } catch {
        // use fallback
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function toggle(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  const catKey = CATEGORIES[activeCategory].key;
  const items: { q: string; a: string }[] =
    (faqData && faqData[catKey]) || FALLBACK_FAQ[catKey] || [];

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
        <Text style={styles.pageTitle}>Частые вопросы</Text>
        <Text style={styles.pageSubtitle}>
          Найдите ответы на популярные вопросы
        </Text>
      </View>

      {/* ── CATEGORY TABS ── */}
      <View style={styles.tabsWrap}>
        <View style={centered(640)}>
          <View style={styles.tabsInner}>
            {CATEGORIES.map((cat, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.tab, activeCategory === i && styles.tabActive]}
                onPress={() => {
                  setActiveCategory(i);
                  setExpanded(new Set());
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icon}
                  size={14}
                  color={activeCategory === i ? "#FFFFFF" : C.textMid}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeCategory === i && styles.tabTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* ── FAQ ITEMS ── */}
      <View style={[styles.content, centered(640)]}>
        {loading ? (
          <ActivityIndicator
            color={C.primary}
            size="large"
            style={{ marginTop: 32 }}
          />
        ) : items.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons
              name="help-circle-outline"
              size={40}
              color={C.textLight}
            />
            <Text style={styles.emptyText}>Нет вопросов в этой категории</Text>
          </View>
        ) : (
          <View style={styles.accordionCard}>
            {items.map((item, i) => (
              <AccordionItem
                key={i}
                item={item}
                index={i}
                isOpen={expanded.has(i)}
                onToggle={toggle}
                showSeparator={i < items.length - 1}
              />
            ))}
          </View>
        )}

        {/* ── SUPPORT CTA ── */}
        <View style={styles.supportCard}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={28}
            color={C.primary}
          />
          <View style={styles.supportText}>
            <Text style={styles.supportTitle}>Не нашли ответ?</Text>
            <Text style={styles.supportSub}>
              Свяжитесь с нашей службой поддержки
            </Text>
          </View>
          <TouchableOpacity
            style={styles.supportBtn}
            onPress={() => router.push("/(tabs)/contacts")}
            activeOpacity={0.8}
          >
            <Text style={styles.supportBtnText}>Написать</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function AccordionItem({
  item,
  index,
  isOpen,
  onToggle,
  showSeparator,
}: {
  item: { q: string; a: string };
  index: number;
  isOpen: boolean;
  onToggle: (i: number) => void;
  showSeparator: boolean;
}) {
  const rotAnim = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const rotate = rotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  function handlePress() {
    LayoutAnimation.configureNext({
      duration: 280,
      create: { type: "easeInEaseOut", property: "opacity" },
      update: { type: "easeInEaseOut" },
      delete: { type: "easeInEaseOut", property: "opacity" },
    });
    onToggle(index);
  }

  return (
    <>
      <TouchableOpacity
        style={styles.accordionRow}
        onPress={handlePress}
        activeOpacity={0.75}
      >
        <View style={styles.accordionLeft}>
          <View style={styles.qNumWrap}>
            <Text style={styles.qNum}>{index + 1}</Text>
          </View>
          <Text style={styles.question}>{item.q}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons
            name="chevron-down"
            size={18}
            color={isOpen ? C.action : C.textLight}
          />
        </Animated.View>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.answerWrap}>
          <Text style={styles.answer}>{item.a}</Text>
        </View>
      )}
      {showSeparator && <View style={styles.separator} />}
    </>
  );
}

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

  tabsWrap: {
    backgroundColor: C.surface,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tabsInner: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: { fontSize: 11, fontWeight: "600", color: C.textMid },
  tabTextActive: { color: "#FFFFFF" },

  content: { padding: 16 },

  accordionCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  accordionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  accordionLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 12,
    marginRight: 8,
  },
  qNumWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  qNum: { fontSize: 11, fontWeight: "700", color: C.action },
  question: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
    flex: 1,
    lineHeight: 20,
  },
  answerWrap: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 0,
    paddingLeft: 52,
  },
  answer: { fontSize: 14, color: C.textMid, lineHeight: 24 },
  separator: { height: 1, backgroundColor: C.border, marginHorizontal: 16 },

  emptyWrap: { alignItems: "center", paddingVertical: 48 },
  emptyText: { fontSize: 15, color: C.textLight, marginTop: 12 },

  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  supportText: { flex: 1 },
  supportTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.primary,
    marginBottom: 2,
  },
  supportSub: { fontSize: 12, color: C.textMid },
  supportBtn: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  supportBtnText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
});
