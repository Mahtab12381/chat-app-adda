const authModel = require("../model/auth");
const userModel = require("../model/user");
const chatModel = require("../model/chat");
const messageModel = require("../model/message");
const response = require("../utils/successError");
const http = require("../constants/statusCodes");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

class MessageController {

  async sendMessage(req, res) {
    try {
      const { content, chat } = req.body;
      if (!content || !chat) {
        return response(res, http.BAD_REQUEST, "Please fill all the fields");
      }

      const extChat = await chatModel.findById(chat);
      if (!extChat) {
        return response(res, http.NOT_FOUND, "Chat not found");
      }

      const userChats = await chatModel
        .find({
          participants: {
            $elemMatch: { $eq: new mongoose.Types.ObjectId(req.user.userID) },
          },
        })
        .select("_id");

      if (userChats.length === 0) {
        return response(res, http.NOT_FOUND, "Chats not found");
      }

      let matched = false;

      userChats.forEach((element) => {
        if (element._id.toString() === chat) {
          matched = true;
        }
      });

      if (!matched) {
        return response(res, http.NOT_FOUND, "Unauthorized access");
      }

      let newMessage = {
        sender: req.user.userID,
        content: content,
        chat: chat,
      };

      let message = await messageModel.create(newMessage);

      await chatModel.findByIdAndUpdate(
        chat,
        {
          lastMessage: message._id,
        },
        { new: true }
      );

      const populatedMessage = await messageModel.findById(message._id).populate("sender", "username email profilePic").populate("chat", "participants");

      return response(res, http.OK, "Message sent", populatedMessage);
    } catch (error) {
      console.log(error);
      return response(
        res,
        http.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        error.message
      );
    }
  }

  async getMessages(req, res) {
    try {
      const { chatID } = req.params;

      const extChat = await chatModel.findById(chatID);

      if (!extChat) {
        return response(res, http.NOT_FOUND, "Chat not found");
      }

      const myChats = await chatModel
        .find({
          participants: {
            $elemMatch: { $eq: new mongoose.Types.ObjectId(req.user.userID) },
          },
        })
        .select("_id");

      let mychatIds = [];
      myChats.forEach((element) => {
        mychatIds.push(element._id.toString());
      });

      if (!mychatIds.includes(chatID)) {
        return response(res, http.NOT_FOUND, "Unauthorized access");
      }

      const messages = await messageModel.find({
        chat: chatID,
      }).populate("sender", "username email profilePic")

      if (!messages) {
        return response(res, http.NOT_FOUND, "Messages not found");
      }
      return response(res, http.OK, "Messages found", messages);
    } catch (error) {
      console.log(error);
      return response(
        res,
        http.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        error.message
      );
    }
  }

  async deleteMessage(req, res) {
    try {

      const { messageID } = req.params;
      const extMessage = await messageModel.findById(messageID);
      if (!extMessage) {
        return response(res, http.NOT_FOUND, "Message not found");
      }
      if (extMessage.sender.toString() !== req.user.userID.toString()) {
        return response(res, http.UNAUTHORIZED, "Unauthorized");
      }

      const message = await messageModel.findByIdAndDelete(messageID);
      if (!message) {
        return response(res, http.NOT_FOUND, "Message can not be deleted");
      }
      return response(res, http.OK, "Message deleted", message);

    }
    catch (error) {
      console.log(error);
      return response(
        res,
        http.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        error.message
      );
    }
  }
}

module.exports = new MessageController();
