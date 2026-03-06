// app/_layout.tsx
import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { db, isOnline } from "./backend/db";

export default function RootLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    db.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = db.onAuthStateChange(
      (_event: string, session: any) => {
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