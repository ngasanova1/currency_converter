import { Platform, useWindowDimensions } from "react-native";

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isWeb = Platform.OS === "web";
  const isWide = isTablet || isWeb;
  const chartHeight = Math.min(Math.round(width * 0.45), 220);
  const hPad = isTablet ? 28 : 20;
  const sectionGap = isWide ? 32 : 24;

  function centered(maxWidth = 680) {
    if (!isWide) return {};
    return { maxWidth, alignSelf: "center" as const, width: "100%" as const };
  }

  return { width, height, isTablet, isWeb, isWide, chartHeight, hPad, sectionGap, centered };
}
