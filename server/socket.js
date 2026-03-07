socket.on("send_message", (message) => {
  console.log("Message:", message);

  io.emit("receive_message", message);
});
