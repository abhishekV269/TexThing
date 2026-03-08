import socket from "../../socket";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function ChatScreen() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUser, setTypingUser] = useState("");

  const flatListRef = useRef<any>(null);

  useEffect(() => {
    const handleHistory = (history: any[]) => {
      console.log("CHAT HISTORY:", history);
      setMessages(history || []);
    };

    const handleReceive = (data: any) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleSystem = (msg: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          user: "system",
          message: msg,
        },
      ]);
    };

    const handleTyping = (user: string) => {
      setTypingUser(user);

      setTimeout(() => {
        setTypingUser("");
      }, 1500);
    };

    const handleOnlineUsers = (users: string[]) => {
      setOnlineUsers(users);
    };

    socket.on("chat_history", handleHistory);
    socket.on("receive_message", handleReceive);
    socket.on("system_message", handleSystem);
    socket.on("typing", handleTyping);
    socket.on("online_users", handleOnlineUsers);

    // CLEANUP (VERY IMPORTANT)
    return () => {
      socket.off("chat_history", handleHistory);
      socket.off("receive_message", handleReceive);
      socket.off("system_message", handleSystem);
      socket.off("typing", handleTyping);
      socket.off("online_users", handleOnlineUsers);
    };
  }, []);

  const joinChat = () => {
    console.log("JOIN BUTTON CLICKED");

    if (username.trim() === "") return;

    socket.emit("user_joined", username);
    socket.emit("get_history");

    setJoined(true);
  };

  const sendMessage = () => {
    if (message.trim() === "") return;

    const msgData = {
      id: Date.now().toString(),
      user: username,
      message: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("send_message", msgData);

    setMessage("");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {!joined ? (
        <View style={styles.joinContainer}>
          <Text style={styles.joinTitle}>Join TexThing</Text>

          <TextInput
            placeholder="Enter username"
            value={username}
            style={styles.joinInput}
            onChangeText={setUsername}
          />

          <TouchableOpacity style={styles.joinButton} onPress={joinChat}>
            <Text style={styles.joinButtonText}>Join Chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.container}>
          <Text style={styles.header}>TexThing</Text>

          <Text style={styles.onlineUsers}>
            Online: {onlineUsers.join(" • ")}
          </Text>

          {typingUser !== "" && (
            <Text style={styles.typing}>{typingUser} is typing...</Text>
          )}

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            renderItem={({ item }) => {
              if (item.user === "system") {
                return <Text style={styles.systemMessage}>{item.message}</Text>;
              }

              return (
                <View
                  style={
                    item.user === username
                      ? styles.myMessage
                      : styles.otherMessage
                  }
                >
                  <Text style={styles.username}>{item.user}</Text>
                  <Text>{item.message}</Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
              );
            }}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type message..."
              value={message}
              onChangeText={(text) => {
                setMessage(text);
                socket.emit("typing", username);
              }}
            />

            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },

  onlineUsers: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },

  typing: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },

  joinContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  joinTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  joinInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },

  joinButton: {
    backgroundColor: "#3b6ef5",
    padding: 12,
    borderRadius: 6,
  },

  joinButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#3b6ef5",
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
    maxWidth: "75%",
  },

  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e5e5",
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
    maxWidth: "75%",
  },

  username: {
    fontWeight: "bold",
    marginBottom: 2,
  },

  systemMessage: {
    textAlign: "center",
    color: "#777",
    marginVertical: 6,
  },

  time: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
    color: "#555",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingTop: 8,
  },

  input: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  sendButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 10,
  },

  sendText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
