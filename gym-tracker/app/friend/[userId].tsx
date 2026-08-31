import { useLocalSearchParams, useRouter } from "expo-router";
import ProfileView from "../components/ProfileView";

export default function FriendProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();

  return (
    <ProfileView
      userId={String(userId)}
      readOnly
      showBack
      onBack={() => router.back()}
    />
  );
}
