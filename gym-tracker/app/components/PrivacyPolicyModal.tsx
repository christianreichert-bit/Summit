import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { privacyPolicySections, PRIVACY_POLICY_LAST_UPDATED } from "../utils/privacyPolicy";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function PrivacyPolicyModal({ visible, onClose }: Props) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: "85%" }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginBottom: 16 }} />
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 4 }}>Privacy Policy</Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 16 }}>
            Last updated: {PRIVACY_POLICY_LAST_UPDATED}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }}>
            {privacyPolicySections.map((s, i) => (
              <View key={i} style={{ marginBottom: 16 }}>
                {s.heading && (
                  <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 6 }}>{s.heading}</Text>
                )}
                <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>{s.body}</Text>
              </View>
            ))}
            <View style={{ height: 16 }} />
          </ScrollView>
          <Pressable
            style={{ paddingVertical: 14, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center", marginTop: 8 }}
            onPress={onClose}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
