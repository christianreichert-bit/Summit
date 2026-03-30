import { useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { db } from "./backend/db";
import { useTheme } from "./theme/ThemeContext";

export default function AuthScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    if (mode === "signUp" && !username.trim()) {
      setError("Username is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "signIn") {
        const { error: signInError } = await db.signIn(email.trim(), password);
        if (signInError) {
          setError(signInError.message ?? "Failed to sign in.");
          return;
        }
      } else {
        const { error: signUpError } = await db.signUp(email.trim(), password, username.trim());
        if (signUpError) {
          setError(signUpError.message ?? "Failed to create account.");
          return;
        }
      }
      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Welcome to Summit</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {mode === "signIn" ? "Sign in to continue" : "Create an account to start tracking"}
        </Text>

        <View style={styles.form}>
          {mode === "signUp" && (
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBackground }]}
              placeholder="Username"
              placeholderTextColor={colors.textTertiary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          )}
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBackground }]}
            placeholder="Email"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBackground }]}
            placeholder="Password"
            placeholderTextColor={colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.85 },
              loading && { opacity: 0.6 },
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>{mode === "signIn" ? "Sign In" : "Create Account"}</Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.75 }]}
            onPress={() => {
              setMode((prev) => (prev === "signIn" ? "signUp" : "signIn"));
              setError(null);
            }}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
              {mode === "signIn" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 28,
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: {
    fontSize: 13,
    marginTop: 2,
  },
  primaryButton: {
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    minHeight: 40,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
