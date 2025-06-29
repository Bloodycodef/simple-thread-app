import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";
import { Thread } from "../../types";

// Aktifkan plugin dayjs
dayjs.extend(relativeTime);

export default function HomeScreen() {
  const [threads, setThreads] = useState<Thread[]>([]);

  const fetchThreads = async () => {
    const { data, error } = await supabase
      .from("threads")
      .select(
        `
        id,
        user_id,
        content,
        created_at,
        updated_at,
        profiles (
          username
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching threads:", error.message);
    } else {
      setThreads(data as Thread[]);
    }
  };

  useEffect(() => {
    fetchThreads();

    const channel = supabase
      .channel("threads-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "threads",
        },
        async (payload) => {
          const { eventType, new: newItem, old: oldItem } = payload;

          if (eventType === "INSERT") {
            const { data, error } = await supabase
              .from("threads")
              .select(
                `
                id,
                user_id,
                content,
                created_at,
                updated_at,
                profiles (
                  username
                )
              `
              )
              .eq("id", newItem.id)
              .single();

            if (!error && data) {
              setThreads((prev) => [data as Thread, ...prev]);
            }
          }

          if (eventType === "UPDATE") {
            const { data, error } = await supabase
              .from("threads")
              .select(
                `
                id,
                user_id,
                content,
                created_at,
                updated_at,
                profiles (
                  username
                )
              `
              )
              .eq("id", newItem.id)
              .single();

            if (!error && data) {
              setThreads((prev) =>
                prev.map((t) => (t.id === data.id ? (data as Thread) : t))
              );
            }
          }

          if (eventType === "DELETE") {
            setThreads((prev) => prev.filter((t) => t.id !== oldItem.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const renderItem = ({ item }: { item: Thread }) => {
    const createdTime = dayjs(item.created_at).fromNow();

    return (
      <View
        style={{
          marginVertical: 10,
          padding: 10,
          backgroundColor: "#f5f5f5",
          borderRadius: 10,
        }}
      >
        <Text style={{ fontWeight: "bold", color: "#333" }}>
          {item.profiles?.username || "Unknown User"}
        </Text>
        <Text style={{ color: "#999", fontSize: 12 }}>{createdTime}</Text>
        <Text style={{ color: "#444", marginTop: 4 }}>{item.content}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ marginTop: 20 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40, color: "#aaa" }}>
            Belum ada thread yang dibuat.
          </Text>
        }
      />
    </View>
  );
}
