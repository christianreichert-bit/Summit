/** Expo Go preview link — scan to load Summit in Expo Go. */
const EXPO_GO_OPEN_URL =
  "https://qr.expo.dev/eas-update?projectId=3cffbee0-3fb4-4456-977f-b324921fe86a&runtimeVersion=1.0.0&channel=preview";

export function getExpoGoOpenUrl(): string {
  return EXPO_GO_OPEN_URL;
}
