import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { db } from "../backend/db";
import { useTheme } from "../theme/ThemeContext";
import { useUnits } from "../utils/units";

export default function FriendProfileScreen() {
  const { userId, username } = useLocalSearchParams<{ userId: string; username?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { toDisplay, label: unitLabel } = useUnits();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: me } = await db.getUser();
      const viewerId = me?.user?.id;
      if (!viewerId || !userId) {
        setError("Not authenticated.");
        setLoading(false);
        return;
      }
      const { data, error: err } = await db.getFriendProfileSummary(viewerId, String(userId));
      if (err) setError(err.message);
      else setSummary(data);
      setLoading(false);
    })();
  }, [userId]);

  const displayName = summary?.profile?.username ?? username ?? "Friend";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{displayName}</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} />
      ) : error ? (
        <Text style={{ color: colors.danger, textAlign: "center", marginTop: 48, paddingHorizontal: 24 }}>{error}</Text>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 + insets.bottom }}>
          <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {summary?.profile?.avatar_url ? (
              <Image source={{ uri: summary.profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primaryLight }]}>
                <Text style={{ fontSize: 32, fontWeight: "800", color: colors.primary }}>{displayName.slice(0, 1).toUpperCase()}</Text>
              </View>
            )}
            <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text, marginTop: 12 }}>{displayName}</Text>
            {summary?.profile?.bio ? (
              <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 6, textAlign: "center" }}>{summary.profile.bio}</Text>
            ) : null}
          </View>

          <View style={styles.statsRow}>
            {[
              { label: "Workouts", value: String(summary?.totalWorkouts ?? 0) },
              { label: "Sets", value: String(summary?.totalSets ?? 0) },
              { label: "Volume", value: `${toDisplay(summary?.totalVolume ?? 0) ?? 0} ${unitLabel}` },
            ].map((s) => (
              <View key={s.label} style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={{ fontSize: 20, fontWeight: "800", color: colors.primary }}>{s.value}</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Recent workouts</Text>
          {(summary?.recentSessions ?? []).length === 0 ? (
            <Text style={{ color: colors.textTertiary, fontSize: 14 }}>No completed workouts yet.</Text>
          ) : (
            (summary.recentSessions as any[]).map((s) => (
              <View key={s.session_id} style={[styles.sessionRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{s.session_name}</Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>{s.session_date?.slice(0, 10)}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "600", textAlign: "center" },
  profileCard: { alignItems: "center", borderWidth: 1, borderRadius: 16, padding: 24, marginBottom: 16 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statBox: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 14, alignItems: "center" },
  sectionTitle: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 },
  sessionRow: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 8 },
});
