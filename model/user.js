const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        maxLength: 50,
        unique: true,
        required: [true, "Username should be provided"]
    },
    email: {
        type: String,
        maxLength: 100,
        unique: true,
        required: [true, "Email should be provided"]
    },
    profilePic: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    }
}, { timestamps: true })

const User = mongoose.model("User", userSchema);
module.exports = User;