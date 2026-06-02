import { Platform } from "react-native";

// ─── Legacy Colors (kept for backward compat with explore.tsx etc.) ───────────
const tintColorLight = "#1B3A6B";
const tintColorDark = "#4F9EE8";

export const Colors = {
  light: {
    text: "#111827",
    background: "#F5F7FA",
    tint: tintColorLight,
    icon: "#4B5563",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#F9FAFB",
    background: "#0F1117",
    tint: tintColorDark,
    icon: "#9CA3AF",
    tabIconDefault: "#6B7280",
    tabIconSelected: tintColorDark,
  },
};

// ─── App Design System ─────────────────────────────────────────────────────────
export const AppTheme = {
  colors: {
    // Brand
    primary: "#1B3A6B",       // Deep navy — trust, stability
    primaryDark: "#0F2340",   // Darkest navy
    action: "#2563EB",        // Interactive blue — CTAs, links
    actionLight: "#EFF6FF",   // Light blue tint

    // Accent
    teal: "#0D9488",
    tealLight: "#F0FDFA",

    // Surfaces
    bg: "#F5F7FA",
    surface: "#FFFFFF",
    surfaceAlt: "#F9FAFB",

    // Text
    text: "#111827",
    textMid: "#4B5563",
    textLight: "#9CA3AF",
    textInverse: "#FFFFFF",

    // Borders
    border: "#E5E7EB",
    borderLight: "#F3F4F6",

    // Status
    success: "#059669",
    successBg: "#ECFDF5",
    successBorder: "#A7F3D0",

    error: "#DC2626",
    errorBg: "#FEF2F2",
    errorBorder: "#FECACA",

    pending: "#D97706",
    pendingBg: "#FFFBEB",
    pendingBorder: "#FDE68A",

    // Tab bar
    tabBar: "#FFFFFF",
    tabBarBorder: "#E5E7EB",
    tabActive: "#1B3A6B",
    tabInactive: "#9CA3AF",
  },

  shadow: {
    sm: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 5,
    },
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
} as const;

// ─── Fonts ─────────────────────────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
