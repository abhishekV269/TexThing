import { Text, View, Button } from "react-native";
import socket from "./socket";

export default function App() {
  const sendMessage = () => {
    socket.emit("send_message", {
      user: "MobileUser",
      message: "Hello from phone",
    });
  };

  return (
    <View style={{ marginTop: 50 }}>
      <Text>TexThing Mobile</Text>

      <Button title="Send Test Message" onPress={sendMessage} />
    </View>
  );
}
