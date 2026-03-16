import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../backend/supabaseClient";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";

    if (!session && !inAuthGroup) {
      // User is not signed in and not on auth screen -> redirect to auth
      router.replace("/auth");
    } else if (session && inAuthGroup) {
      // User is signed in and on auth screen -> redirect to home
      router.replace("/");
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FF6B00',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Today's Workout",
          headerRight: () => (
            <Pressable onPress={() => router.push("/routines")}>
              <Text style={{ color: '#fff', marginRight: 16, fontSize: 16 }}>Routines</Text>
            </Pressable>
          ),
        }} 
      />
      <Stack.Screen 
        name="routines" 
        options={{ 
          title: "My Routines",
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Text style={{ color: '#fff', marginLeft: 16, fontSize: 16 }}>Back</Text>
            </Pressable>
          ),
        }} 
      />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="test" options={{ title: "Supabase Test" }} />
    </Stack>
  );
}