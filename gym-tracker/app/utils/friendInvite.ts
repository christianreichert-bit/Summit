import { Alert, Platform, Share } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../backend/db";

export const PENDING_INVITE_KEY = "@gym_tracker_pending_invite";

export function buildFriendInviteUrl(token: string): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${window.location.origin}/invite?token=${encodeURIComponent(token)}`;
  }
  return `gymtracker://invite?token=${encodeURIComponent(token)}`;
}

/** Web Share API only works on HTTPS or localhost — LAN HTTP needs clipboard fallback. */
export async function shareFriendInviteUrl(url: string): Promise<"shared" | "copied" | "shown"> {
  const message = `Add me on Summit! Tap this link after you sign up: ${url}`;

  if (Platform.OS === "web" && typeof window !== "undefined") {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Summit friend invite", text: message, url });
        return "shared";
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") return "shown";
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return "copied";
    }
    window.prompt("Copy this invite link:", url);
    return "shown";
  }

  try {
    await Share.share({ message, url, title: "Summit friend invite" });
    return "shared";
  } catch {
    return "shown";
  }
}

export async function copyInviteLink(url: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function showInviteLinkFeedback(url: string, result: "shared" | "copied" | "shown") {
  if (result === "shared") return;
  if (result === "copied") {
    Alert.alert("Link copied", "Paste it in a text or email to send to your friend.");
    return;
  }
  Alert.alert("Invite link", url);
}

export async function storePendingInviteToken(token: string): Promise<void> {
  await AsyncStorage.setItem(PENDING_INVITE_KEY, token);
}

export async function redeemPendingInvite(userId: string): Promise<{ ok: boolean; message?: string }> {
  const token = await AsyncStorage.getItem(PENDING_INVITE_KEY);
  if (!token) return { ok: true };
  const { error } = await db.redeemFriendInvite(token, userId);
  if (error) return { ok: false, message: error.message };
  await AsyncStorage.removeItem(PENDING_INVITE_KEY);
  return { ok: true };
}
