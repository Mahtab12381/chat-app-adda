const mongoose = require("mongoose")

const authSchema = new mongoose.Schema({
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
    password: {
        type: String,
        required: [true, "Password should be provided"],
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String || null,
        default: null
    },
    emailVerificationTokenExpired: {
        type: Date || null,
        default: null
    },
    loginAttempt: {
        type: Number,
        default: 0
    },
    resetPassword: {
        type: Boolean || null,
        default: false
    },
    resetPasswordToken: {
        type: String || null,
        default: null
    },
    resetPasswordExpired: {
        type: Date || null,
        default: null
    },
    userID: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },

}, { timestamps: true })

const Auth = mongoose.model("Auth", authSchema);
module.exports = Auth;