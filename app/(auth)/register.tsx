import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get("window");

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) {
      console.error("Registration error:", error.message);
      Alert.alert("Pendaftaran Gagal", error.message);
      return;
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    const userId = session?.user?.id || user?.id;

    if (!userId) {
      console.error("User ID not available after registration.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      username,
    });

    if (profileError) {
      console.error("Insert to profiles failed:", profileError.message);
      Alert.alert("Gagal Menyimpan Profil", profileError.message);
      return;
    }

    // ✅ Tampilkan alert setelah berhasil daftar
    Alert.alert(
      "Verifikasi Email",
      "Silakan cek email Anda untuk mengonfirmasi pendaftaran sebelum login.",
      [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/login"),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.glassCard}>
          <Text style={styles.title}>Register</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#ccc"
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#ccc"
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#ccc"
            onChangeText={setPassword}
            secureTextEntry={true}
          />
          <View style={styles.button}>
            <Button title="Register" onPress={handleRegister} />
          </View>
          <View style={styles.button}>
            <Button
              title="Go to Login"
              onPress={() => router.push("/(auth)/login")}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  glassCard: {
    width: width * 0.9,
    maxWidth: 400,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    color: "#fff",
  },
  button: {
    marginTop: 12,
  },
});
