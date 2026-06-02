import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Easing,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsive } from "../hooks/use-responsive";

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

type CurrencyInfo = {
  code: string;
  name: string;
  flag: string;
  type: "fiat" | "crypto";
};

const CURRENCIES: CurrencyInfo[] = [
  // Fiat
  { code: "USD", name: "Доллар США", flag: "🇺🇸", type: "fiat" },
  { code: "EUR", name: "Евро", flag: "🇪🇺", type: "fiat" },
  { code: "GBP", name: "Фунт стерлингов", flag: "🇬🇧", type: "fiat" },
  { code: "RUB", name: "Российский рубль", flag: "🇷🇺", type: "fiat" },
  { code: "JPY", name: "Японская йена", flag: "🇯🇵", type: "fiat" },
  { code: "CHF", name: "Швейцарский франк", flag: "🇨🇭", type: "fiat" },
  { code: "CAD", name: "Канадский доллар", flag: "🇨🇦", type: "fiat" },
  { code: "AUD", name: "Австралийский доллар", flag: "🇦🇺", type: "fiat" },
  { code: "CNY", name: "Китайский юань", flag: "🇨🇳", type: "fiat" },
  { code: "INR", name: "Индийская рупия", flag: "🇮🇳", type: "fiat" },
  { code: "BRL", name: "Бразильский реал", flag: "🇧🇷", type: "fiat" },
  { code: "MXN", name: "Мексиканское песо", flag: "🇲🇽", type: "fiat" },
  { code: "NZD", name: "Новозеландский доллар", flag: "🇳🇿", type: "fiat" },
  // Crypto
  { code: "BTC", name: "Bitcoin", flag: "₿", type: "crypto" },
  { code: "ETH", name: "Ethereum", flag: "Ξ", type: "crypto" },
];

interface CurrencyPickerProps {
  visible: boolean;
  onSelect: (currency: string) => void;
  onClose: () => void;
  selectedCurrency?: string;
}

export function CurrencyPicker({
  visible,
  onSelect,
  onClose,
  selectedCurrency,
}: CurrencyPickerProps) {
  const insets = useSafeAreaInsets();
  const { isWide } = useResponsive();
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "fiat" | "crypto">("all");

  const slideAnim = React.useRef(new Animated.Value(400)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      slideAnim.setValue(400);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  function animateClose(callback: () => void) {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(callback);
  }

  const filtered = CURRENCIES.filter((cur) => {
    const matchesSearch =
      cur.code.toLowerCase().includes(search.toLowerCase()) ||
      cur.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" || cur.type === filter;
    return matchesSearch && matchesFilter;
  });

  function handleClose() {
    animateClose(() => {
      setSearch("");
      setFilter("all");
      onClose();
    });
  }

  function handleSelect(code: string) {
    animateClose(() => {
      setSearch("");
      setFilter("all");
      onSelect(code);
    });
  }

  // On web/tablet, center the sheet with max width
  const sheetStyle = isWide
    ? { ...styles.sheet, maxWidth: 480, alignSelf: "center" as const, borderRadius: 24, paddingBottom: insets.bottom + 16 }
    : { ...styles.sheet, paddingBottom: insets.bottom + 16 };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={handleClose}
    >
      <View style={isWide
        ? { flex: 1, justifyContent: "center", alignItems: "center" }
        : { flex: 1, justifyContent: "flex-end" }
      }>
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.45)", opacity: fadeAnim }]}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
        </Animated.View>
        <Animated.View style={[sheetStyle, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle bar */}
        {!isWide && <View style={styles.handle} />}

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.sheetTitle}>Выберите валюту</Text>
            <Text style={styles.sheetSub}>
              {CURRENCIES.length} валют и криптовалют
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={C.textMid} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons
            name="search-outline"
            size={16}
            color={C.textLight}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Поиск по коду или названию..."
            placeholderTextColor={C.textLight}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={C.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <View style={styles.filterRow}>
          {(["all", "fiat", "crypto"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === f && styles.filterChipTextActive,
                ]}
              >
                {f === "all" ? "Все" : f === "fiat" ? "Фиатные" : "Крипто"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.list}
          renderItem={({ item }) => {
            const isSelected = item.code === selectedCurrency;
            const isCrypto = item.type === "crypto";
            return (
              <TouchableOpacity
                style={[
                  styles.item,
                  isSelected && styles.itemSelected,
                ]}
                onPress={() => handleSelect(item.code)}
                activeOpacity={0.7}
              >
                <View style={[styles.flagWrap, isCrypto && styles.flagWrapCrypto]}>
                  <Text style={isCrypto ? styles.flagCrypto : styles.flag}>
                    {item.flag}
                  </Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemCode, isSelected && styles.itemCodeSelected]}>
                    {item.code}
                  </Text>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color={C.action} />
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Ничего не найдено</Text>
            </View>
          }
        />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "82%",
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: C.text, marginBottom: 2 },
  sheetSub: { fontSize: 12, color: C.textLight },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bg,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.text, outlineWidth: 0 } as any,

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterChipText: { fontSize: 12, fontWeight: "600", color: C.textMid },
  filterChipTextActive: { color: "#FFFFFF" },

  list: { paddingHorizontal: 16 },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: "transparent",
  },
  itemSelected: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
  flagWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  flagWrapCrypto: { backgroundColor: "#0F2340", borderColor: "transparent" },
  flag: { fontSize: 22 },
  flagCrypto: { fontSize: 18, fontWeight: "700", color: "#F59E0B" },

  itemInfo: { flex: 1 },
  itemCode: { fontSize: 15, fontWeight: "700", color: C.text, marginBottom: 2 },
  itemCodeSelected: { color: C.action },
  itemName: { fontSize: 12, color: C.textLight },

  emptyWrap: { alignItems: "center", paddingVertical: 32 },
  emptyText: { fontSize: 14, color: C.textLight },
});
