import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  user: String,
  message: String,
  time: String,
});

export default mongoose.model("Message", messageSchema);
