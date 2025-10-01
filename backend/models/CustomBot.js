const mongoose = require("mongoose");

const customBotSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    path: { type: String, required: true, index: true },
    name: { type: String, required: true },
    subtitle: { type: String, default: "" },
    img: { type: String, required: true }, // data URL or hosted URL
    desc: { type: String, default: "" },
    initialMessage: { type: String, required: true },
    prompt: { type: String, required: true },
    isCustom: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Ensure per-user uniqueness of path
customBotSchema.index({ user: 1, path: 1 }, { unique: true });

module.exports = mongoose.model("CustomBot", customBotSchema);