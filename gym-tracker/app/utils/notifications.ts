import { Platform } from "react-native";
import * as Device from "expo-device";

type NotificationsModule = typeof import("expo-notifications");

function getNotifications(): NotificationsModule | null {
  if (Platform.OS === "web") return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("expo-notifications") as NotificationsModule;
}

const notifications = getNotifications();
if (notifications) {
  notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

let scheduledNotifId: string | null = null;

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!notifications || !Device.isDevice) return false;

  if (Platform.OS === "android") {
    await notifications.setNotificationChannelAsync("rest-timer", {
      name: "Rest Timer",
      importance: notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existing } = await notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleRestDoneNotification(seconds: number): Promise<void> {
  if (!notifications) return;

  await cancelRestDoneNotification();

  const id = await notifications.scheduleNotificationAsync({
    content: {
      title: "Rest complete",
      body: "Time to lift! Your rest period is over.",
      sound: "default",
    },
    trigger: {
      type: notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });

  scheduledNotifId = id;
}

export async function cancelRestDoneNotification(): Promise<void> {
  if (!notifications || !scheduledNotifId) return;

  await notifications.cancelScheduledNotificationAsync(scheduledNotifId).catch(() => {});
  scheduledNotifId = null;
}
