import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { db } from "./backend/db";
import { ThemeProvider, useTheme } from "./theme/ThemeContext";
import { useSyncManager } from "./utils/useSyncManager";
import { ActiveWorkoutProvider } from "./utils/ActiveWorkoutContext";
import MinimizedWorkoutBar from "./components/MinimizedWorkoutBar";
import { redeemPendingInvite } from "./utils/friendInvite";

function RootNav() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const { colors } = useTheme();
  const userId = session?.user?.id ?? null;
  const { isSyncing, lastSyncedCount } = useSyncManager(userId);

  useEffect(() => {
    let active = true;
    db.getSession()
      .then((result: any) => {
        if (!active) return;
        setSession(result?.data?.session ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setSession(null);
        setLoading(false);
      });

    const result = db.onAuthStateChange(
      (_event: string, session: any) => {
        setSession(session);
        setLoading(false);
      }
    );

    const subscription = result?.data?.subscription;

    return () => {
      active = false;
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    redeemPendingInvite(userId).catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (loading) return;

    const inPublicScreen =
      segments[0] === "auth" || segments[0] === "reset-password" || segments[0] === "invite";

    if (session && segments[0] === "auth") {
      router.replace("/(tabs)");
    } else if (!session && !inPublicScreen) {
      router.replace("/auth");
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {isSyncing && (
        <View style={{ backgroundColor: colors.primary, paddingVertical: 6, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Syncing offline workouts…</Text>
        </View>
      )}
      {!isSyncing && lastSyncedCount > 0 && (
        <View style={{ backgroundColor: colors.success, paddingVertical: 6, paddingHorizontal: 16 }}>
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
            {lastSyncedCount} workout{lastSyncedCount > 1 ? "s" : ""} synced!
          </Text>
        </View>
      )}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "none",
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="invite" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="friend/[userId]" options={{ animation: "slide_from_right", animationDuration: 280 }} />
        <Stack.Screen name="workout-edit/[sessionId]" options={{ animation: "slide_from_bottom", animationDuration: 280 }} />
        <Stack.Screen name="workout" options={{ animation: "slide_from_bottom", animationDuration: 280 }} />
        <Stack.Screen name="settings" options={{ animation: "slide_from_bottom", animationDuration: 280 }} />
        <Stack.Screen name="routine/[routineId]" options={{ animation: "slide_from_bottom", animationDuration: 280 }} />
        <Stack.Screen name="exercise-detail/[exerciseId]" options={{ animation: "slide_from_right", animationDuration: 280 }} />
        <Stack.Screen name="index" />
      </Stack>
      <MinimizedWorkoutBar />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ActiveWorkoutProvider>
          <RootNav />
        </ActiveWorkoutProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
