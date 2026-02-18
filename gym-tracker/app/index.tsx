import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "./supabaseClient";

export default function Index() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Load all users from Supabase
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("users").select("*");
    console.log("users", { data, error });
    if (error) setError(error.message);
    else setUsers(data ?? []);
    setLoading(false);
  };

  // Insert a new user into Supabase
  const insertUser = async () => {
    if (!username || !email || !password) {
      setError("All fields are required");
      return;
    }
    setError(null);
    const { error } = await supabase.from("users").insert({
      username,
      email,
      password_hash: password,
    });
    if (error) {
      setError(error.message);
    } else {
      setUsername("");
      setEmail("");
      setPassword("");
      loadUsers(); // refresh list
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={styles.title}>Supabase Test</Text>
        <Pressable style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Load & List */}
      <Pressable style={styles.button} onPress={loadUsers} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Load Users"}</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item, index) => String(item.user_id ?? index)}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text>{item.username} — {item.email}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  form: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  button: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },
  insertButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#86efac",
  },
  buttonText: {
    fontWeight: "600",
  },
  listItem: {
    paddingVertical: 6,
  },
  errorText: {
    color: "red",
  },
});
