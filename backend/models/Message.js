const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true } ,
    {class: {type: String}}
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
