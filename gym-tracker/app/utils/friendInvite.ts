import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../backend/db";

export const PENDING_INVITE_KEY = "@gym_tracker_pending_invite";

export function buildFriendInviteUrl(token: string): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${window.location.origin}/invite?token=${encodeURIComponent(token)}`;
  }
  return `gymtracker://invite?token=${encodeURIComponent(token)}`;
}

export async function storePendingInviteToken(token: string): Promise<void> {
  await AsyncStorage.setItem(PENDING_INVITE_KEY, token);
}

export async function redeemPendingInvite(userId: string): Promise<{ ok: boolean; message?: string }> {
  const token = await AsyncStorage.getItem(PENDING_INVITE_KEY);
  if (!token) return { ok: true };
  await AsyncStorage.removeItem(PENDING_INVITE_KEY);
  const { error } = await db.redeemFriendInvite(token, userId);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
