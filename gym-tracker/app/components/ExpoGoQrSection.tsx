import { useState } from "react";
import { Image, Linking, Platform, Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../theme/ThemeContext";
import { getExpoGoOpenUrl } from "../utils/expoGoLink";

function qrImageUrl(data: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=12&data=${encodeURIComponent(data)}`;
}

export default function ExpoGoQrSection() {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);
  const openUrl = getExpoGoOpenUrl();

  const handleCopyLink = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(openUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <View style={{ marginTop: 28, paddingHorizontal: 16, alignItems: "center" }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: colors.textSecondary,
          marginBottom: 12,
          textTransform: "uppercase",
          letterSpacing: 0.4,
          alignSelf: "flex-start",
          marginLeft: 4,
        }}
      >
        Open in Expo Go
      </Text>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 14,
          padding: 20,
          width: "100%",
          alignItems: "center",
        }}
      >
        <View style={{ padding: 12, backgroundColor: "#fff", borderRadius: 12, marginBottom: 14 }}>
          <Image
            source={{ uri: qrImageUrl(openUrl) }}
            style={{ width: 200, height: 200 }}
            accessibilityLabel="QR code to open Summit in Expo Go"
          />
        </View>

        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text, textAlign: "center", marginBottom: 6 }}>
          Scan to try Summit on mobile
        </Text>
        <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: "center", lineHeight: 20, marginBottom: 14 }}>
          Install Expo Go, then scan with your phone camera.
        </Text>

        {Platform.OS === "web" ? (
          <Pressable
            style={({ pressed }) => [
              {
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 10,
                backgroundColor: colors.surfaceSecondary,
              },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => void handleCopyLink()}
          >
            <Ionicons name={copied ? "checkmark" : "copy-outline"} size={16} color={colors.primary} />
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary }}>
              {copied ? "Link copied" : "Copy Expo Go link"}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              {
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 10,
                backgroundColor: colors.surfaceSecondary,
              },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => Linking.openURL(openUrl)}
          >
            <Ionicons name="open-outline" size={16} color={colors.primary} />
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary }}>Open in Expo Go</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
