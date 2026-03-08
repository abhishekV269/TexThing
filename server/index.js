import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import socketHandler from "./socket.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

connectDB();

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
  
});
app.get("/", (req, res) => {
  res.send("TexThing server is running 🚀");
});

socketHandler(io);

server.listen(PORT, () => {
  console.log(`TexThing server running on port ${PORT}`);
});
