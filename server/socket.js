import Message from "./models/Message.js";

export default function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    // Load previous messages
    Message.find()
      .sort({ createdAt: 1 })
      .limit(50)
      .then((messages) => {
        socket.emit("chat_history", messages);
      });
    
    socket.on("send_message", async (data) => {
      console.log("Message received:", data);

      try {
        const newMessage = new Message({
          user: data.user,
          message: data.message,
          time: data.time,
        });

        await newMessage.save();

        console.log("Saved to MongoDB");

        io.emit("receive_message", data);
      } catch (error) {
        console.error("Message save error:", error);
      }
      socket.on("typing", (user) => {
        socket.broadcast.emit("typing", user);
      });
    });
    socket.on("get_history", async () => {
      const messages = await Message.find().sort({ createdAt: 1 }).limit(50);

      socket.emit("chat_history", messages);
    });
  });
}
