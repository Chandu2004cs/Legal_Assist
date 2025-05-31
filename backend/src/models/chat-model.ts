import mongoose from "mongoose";
import messageSchema from "./message-model.js";
import { randomUUID } from "crypto";

const chatSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => randomUUID(),
  },
  title: {
    type: String,
    default: "New Chat",
  },
  messages: [messageSchema]
});

export default chatSchema;
