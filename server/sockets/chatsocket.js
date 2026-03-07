export default function chatSocket(io) {
  const users = {};

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("user_joined", (username) => {
      users[socket.id] = username;

      io.emit("user_joined", username);

      io.emit("online_users", Object.values(users));
    });

    socket.on("typing", (username) => {
      socket.broadcast.emit("typing", username);
    });

    socket.on("send_message", (data) => {
      io.emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      const username = users[socket.id];

      delete users[socket.id];

      io.emit("online_users", Object.values(users));

      if (username) {
        io.emit("system_message", `${username} left the chat`);
      }
    });
  });
}
