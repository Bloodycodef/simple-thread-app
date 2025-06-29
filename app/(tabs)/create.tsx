import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function CreateThread() {
  const [content, setContent] = useState("");
  const router = useRouter();

  const createThread = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    const user = session?.user;
    if (!user || sessionError) {
      Alert.alert("Gagal mendapatkan sesi pengguna");
      return;
    }

    const { error } = await supabase.from("threads").insert({
      content,
      user_id: user.id,
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Thread berhasil dibuat!");
      setContent("");
      router.replace("/home");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Buat Thread Baru</Text>
      <TextInput
        placeholder="Tulis sesuatu..."
        value={content}
        onChangeText={setContent}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginVertical: 10,
        }}
      />
      <Button title="Kirim" onPress={createThread} />
    </View>
  );
}
