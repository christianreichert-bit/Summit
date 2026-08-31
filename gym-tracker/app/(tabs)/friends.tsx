import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { db } from "../backend/db";
import { useTheme } from "../theme/ThemeContext";
import { buildFriendInviteUrl, redeemPendingInvite } from "../utils/friendInvite";

type FriendRow = {
  user_id: string;
  username: string;
  avatar_url: string | null;
};

export default function FriendsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optionsFriend, setOptionsFriend] = useState<FriendRow | null>(null);

  const loadFriends = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError(null);
    const { data: userData } = await db.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }
    await redeemPendingInvite(userId);
    const { data, error: err } = await db.getFriends(userId);
    if (err) setError(err.message);
    else setFriends((data as FriendRow[]) ?? []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [loadFriends])
  );

  const handleShareInvite = async () => {
    const { data: userData } = await db.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;
    setSharing(true);
    const { data, error: err } = await db.createFriendInvite(userId);
    setSharing(false);
    if (err || !data?.token) {
      Alert.alert("Error", err?.message ?? "Could not create invite link.");
      return;
    }
    const url = buildFriendInviteUrl(data.token);
    try {
      await Share.share({
        message: `Add me on Summit! Tap this link after you sign up: ${url}`,
        url,
        title: "Summit friend invite",
      });
    } catch {
      Alert.alert("Invite link", url);
    }
  };

  const handleBlock = async () => {
    if (!optionsFriend) return;
    const { data: userData } = await db.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;
    Alert.alert(
      "Block user",
      `Block ${optionsFriend.username}? They will no longer be able to view your progress.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            const { error: err } = await db.blockUser(userId, optionsFriend.user_id);
            setOptionsFriend(null);
            if (err) Alert.alert("Error", err.message);
            else loadFriends(false);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Friends</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 + insets.bottom }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadFriends(false); }} tintColor={colors.primary} />}
      >
        <Pressable
          style={[styles.inviteCard, { backgroundColor: colors.primary }]}
          onPress={handleShareInvite}
          disabled={sharing}
        >
          <Ionicons name="link-outline" size={22} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.inviteTitle}>{sharing ? "Creating link…" : "Invite a friend"}</Text>
            <Text style={styles.inviteSub}>Share a link — when they join, you become friends automatically</Text>
          </View>
          <Ionicons name="share-outline" size={22} color="#fff" />
        </Pressable>

        {error && <Text style={{ color: colors.danger, marginBottom: 12 }}>{error}</Text>}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : friends.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>👋</Text>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 6 }}>No friends yet</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: "center", lineHeight: 20 }}>
              Tap "Invite a friend" above to send a link. When they download Summit and sign up, you'll see their progress here.
            </Text>
          </View>
        ) : (
          <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {friends.map((friend, i) => (
              <View
                key={friend.user_id}
                style={[
                  styles.row,
                  i < friends.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <Pressable
                  style={styles.rowMain}
                  onPress={() => router.push({ pathname: "/friend/[userId]", params: { userId: friend.user_id, username: friend.username } })}
                >
                  {friend.avatar_url ? (
                    <Image source={{ uri: friend.avatar_url }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primaryLight }]}>
                      <Text style={{ fontWeight: "800", color: colors.primary }}>{friend.username.slice(0, 1).toUpperCase()}</Text>
                    </View>
                  )}
                  <Text style={{ flex: 1, fontSize: 16, fontWeight: "600", color: colors.text }}>{friend.username}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                </Pressable>
                <Pressable style={styles.menuBtn} onPress={() => setOptionsFriend(friend)} hitSlop={8}>
                  <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={!!optionsFriend} transparent animationType="fade" onRequestClose={() => setOptionsFriend(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOptionsFriend(null)}>
          <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 16, textAlign: "center" }}>
              {optionsFriend?.username}
            </Text>
            <Pressable
              style={[styles.sheetBtn, { backgroundColor: colors.dangerLight }]}
              onPress={handleBlock}
            >
              <Ionicons name="ban-outline" size={18} color={colors.danger} />
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.danger }}>Block user</Text>
            </Pressable>
            <Pressable style={[styles.sheetBtn, { backgroundColor: colors.surfaceSecondary }]} onPress={() => setOptionsFriend(null)}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.textSecondary }}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  headerTitle: { fontSize: 24, fontWeight: "800" },
  inviteCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 14, marginBottom: 20 },
  inviteTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  inviteSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 },
  empty: { borderWidth: 1, borderRadius: 14, padding: 28, alignItems: "center" },
  list: { borderWidth: 1, borderRadius: 14, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center" },
  rowMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, paddingLeft: 16 },
  menuBtn: { paddingHorizontal: 16, paddingVertical: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36, gap: 10 },
  sheetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 12 },
});
