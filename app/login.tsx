import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { useAuth } from "./AuthProvider";
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
  error: "#DC2626",
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const router = useRouter();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const { centered, isWeb } = useResponsive();

  async function handleLogin() {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      if (!login) throw new Error("Auth not ready");
      await login(email.trim(), password);
      router.replace("/(tabs)/exchange");
    } catch {
      // AuthProvider handles the alert
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.root}
        contentContainerStyle={
          isWeb
            ? { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 24 }
            : { flexGrow: 1 }
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER BANNER — mobile only ── */}
        {!isWeb && (
          <View style={[styles.header, { paddingTop: insets.top + 48 }]}>
            <View style={styles.decoCircle1} />
            <View style={styles.decoCircle2} />
            <View style={styles.logoRing}>
              <Ionicons name="swap-horizontal" size={30} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>ExchangePro</Text>
            <Text style={styles.tagline}>Быстрый и безопасный обмен валют</Text>
          </View>
        )}

        {/* ── FORM CARD ── */}
        <View style={isWeb ? [styles.formCardWeb, centered(480)] : [styles.formCard, centered(480)]}>
          {isWeb && (
            <View style={styles.webBranding}>
              <View style={styles.webLogoRing}>
                <Ionicons name="swap-horizontal" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.webBrandName}>ExchangePro</Text>
            </View>
          )}
          <Text style={styles.formTitle}>Вход в аккаунт</Text>
          <Text style={styles.formSubtitle}>
            Введите данные для продолжения
          </Text>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View
              style={[
                styles.inputWrap,
                emailFocused && styles.inputWrapFocused,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={18}
                color={emailFocused ? C.action : C.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={C.textLight}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                style={styles.input}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Пароль</Text>
            <View
              style={[
                styles.inputWrap,
                passFocused && styles.inputWrapFocused,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={passFocused ? C.action : C.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={C.textLight}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                style={[styles.input, { flex: 1 }]}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setShowPass((v) => !v)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={C.textLight}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Войти</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>или</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Нет аккаунта? </Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerLink}>Зарегистрироваться</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Bottom safe area padding */}
        <View style={{ height: insets.bottom + 16 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.primary },

  header: {
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 24,
    backgroundColor: C.primary,
    overflow: "hidden",
  },
  decoCircle1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -80,
    right: -60,
  },
  decoCircle2: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: 0,
    left: -20,
  },
  logoRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
  },
  appName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
  },

  formCard: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6,
  },
  formCardWeb: {
    backgroundColor: C.surface,
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  webBranding: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 10,
  },
  webLogoRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  webBrandName: {
    fontSize: 20,
    fontWeight: "700",
    color: C.primary,
    letterSpacing: 0.3,
  },
  formTitle: { fontSize: 22, fontWeight: "700", color: C.text, marginBottom: 6 },
  formSubtitle: { fontSize: 14, color: C.textMid, marginBottom: 28 },

  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: C.text, marginBottom: 6 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bg,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapFocused: { borderColor: C.action, backgroundColor: "#FAFCFF" },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: C.text, outlineWidth: 0 } as any,
  eyeBtn: { padding: 4, marginLeft: 8 },

  primaryBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },

  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { marginHorizontal: 12, fontSize: 13, color: C.textLight },

  registerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  registerText: { fontSize: 14, color: C.textMid },
  registerLink: { fontSize: 14, fontWeight: "700", color: C.action },
});
