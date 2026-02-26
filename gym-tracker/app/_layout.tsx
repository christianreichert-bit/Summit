// app/_layout.tsx
import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { Pressable, Text } from "react-native";

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

    const inAuthScreen = segments[0] === "auth";

    if (!session && !inAuthScreen) {
      router.replace("/auth");
    }
  }, [session, loading, segments]);

  if (loading) return null;

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