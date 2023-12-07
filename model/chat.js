const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema({
    chatName: {
        type: String,
    },
    isGroupChat: {
        type: Boolean,
        default: false,
    },
    lastMessage: {
        type: mongoose.Types.ObjectId,
        default: null,
        ref: "Message",
    },
    participants: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
    ],
    admin: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
},
    { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema)
module.exports = Chat