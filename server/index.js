import express from "express";
import http from "http";
import { Server } from "socket.io";
import chatSocket from "./sockets/chatsocket.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

chatSocket(io);

server.listen(5000, () => {
  console.log("TexThing server running on port 5000");
});
