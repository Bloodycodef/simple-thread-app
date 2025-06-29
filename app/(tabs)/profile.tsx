import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { supabase } from "../../lib/supabase";
import { Profile } from "../../types";

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [originalUsername, setOriginalUsername] = useState("");
  const router = useRouter();

  const fetchProfile = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    const user = session?.user;
    if (!user || sessionError) return;

    setEmail(user.email || "");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile", error);
    } else {
      const profile = data as Profile;
      setUsername(profile.username || "");
      setOriginalUsername(profile.username || "");
    }
  };

  const updateUsername = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", user.id);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Berhasil", "Username berhasil diperbarui!");
      setOriginalUsername(username);
      setIsEditing(false);
    }
  };

  const cancelEditing = () => {
    setUsername(originalUsername);
    setIsEditing(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  };

  const deleteAccount = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError.message);
      return;
    }

    const user = session?.user;
    if (!user) {
      Alert.alert("Tidak ada user aktif.");
      return;
    }

    const { error } = await supabase.rpc("delete_user", {
      uid: user.id,
    });

    if (error) {
      console.error("RPC Error:", error.message);
      Alert.alert("Gagal menghapus akun:", error.message);
    } else {
      Alert.alert("Akun berhasil dihapus");
      router.replace("/(auth)/login");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Profil Pengguna</Text>

      <Text style={{ marginTop: 20, fontWeight: "bold" }}>Email:</Text>
      <Text>{email || "Tidak tersedia"}</Text>

      <Text style={{ marginTop: 20, fontWeight: "bold" }}>Username:</Text>
      {isEditing ? (
        <TextInput
          value={username}
          onChangeText={setUsername}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            marginVertical: 10,
            backgroundColor: "#fff",
          }}
          placeholder="Masukkan username baru"
        />
      ) : (
        <Text
          style={{
            padding: 10,
            marginVertical: 10,
            backgroundColor: "#eee",
            borderWidth: 1,
            borderColor: "#ccc",
          }}
        >
          {username || "Belum diatur"}
        </Text>
      )}

      {isEditing ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <Button title="Simpan" onPress={updateUsername} />
          <Button title="Batal" onPress={cancelEditing} color="gray" />
        </View>
      ) : (
        <Button title="Edit Username" onPress={() => setIsEditing(true)} />
      )}

      <View style={{ marginVertical: 10 }}>
        <Button title="Logout" color="orange" onPress={logout} />
      </View>

      <Button title="Delete Account" color="red" onPress={deleteAccount} />
    </View>
  );
}
