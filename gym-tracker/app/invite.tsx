import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { db } from "./backend/db";
import { storePendingInviteToken } from "./utils/friendInvite";
import { useTheme } from "./theme/ThemeContext";

export default function InviteScreen() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    (async () => {
      if (!token) {
        router.replace("/auth");
        return;
      }
      const { data: sessionData } = await db.getSession();
      const userId = sessionData?.session?.user?.id;
      if (userId) {
        const { error } = await db.redeemFriendInvite(token, userId);
        if (error) {
          await storePendingInviteToken(token);
        }
        router.replace("/(tabs)/friends");
      } else {
        await storePendingInviteToken(token);
        router.replace("/auth");
      }
    })();
  }, [token, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
