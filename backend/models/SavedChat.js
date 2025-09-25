const mongoose = require("mongoose");

const savedChatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    botPath: { type: String, required: true, index: true },
    botName: { type: String, required: true },
    messages: [
      {
        sender: { type: String, enum: ["user", "bot"], required: true },
        text: { type: String, required: true },
        at: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

savedChatSchema.index({ user: 1, botPath: 1 }, { unique: true });

module.exports = mongoose.model("SavedChat", savedChatSchema);
