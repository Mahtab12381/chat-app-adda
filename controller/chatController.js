const userModel = require("../model/user");
const chatModel = require("../model/chat");
const messageModel = require("../model/message");
const response = require("../utils/successError");
const http = require("../constants/statusCodes");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

class ChatController {
  async createChat(req, res) {
    try {
      // const { lastMessage, participants } = req.body;
      const participants = [
        new mongoose.Types.ObjectId(req.user.userID),
        new mongoose.Types.ObjectId(req.body.userID),
      ];

      const existingChat = await chatModel.findOne({
        participants: {
          $all: participants,
        },
      });

      if (existingChat) {
        return response(res, http.OK, "chat retrieved", existingChat);
      }

      const chat = await chatModel.create({
        participants,
      });

      return response(res, http.OK, "Chat created", chat);
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

  async createGroupChat(req, res) {
    try {
      const { chatName, participants } = req.body;

      let allParticipants = [];

      participants.forEach((element) => {
        allParticipants.push(new mongoose.Types.ObjectId(element));
      });

      allParticipants.push(new mongoose.Types.ObjectId(req.user.userID));

      if (!chatName) {
        chatName = "Group Chat";
      }

      const chat = await chatModel.create({
        chatName,
        isGroupChat: true,
        admin: req.user.userID,
        participants: allParticipants,
      });

      if (!chat) {
        return response(res, http.INTERNAL_SERVER_ERROR, "Chat not created");
      }

      return response(res, http.OK, "Chat created", chat);
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

  async addParticipant(req, res) {
    try {
      const { chatID, userID } = req.body;

      const chat = await chatModel.findById(chatID);

      if (!chat) {
        return response(res, http.NOT_FOUND, "Chat not found");
      }

      if (chat.isGroupChat) {
        if (chat.admin.toString() !== req.user.userID.toString()) {
          return response(res, http.UNAUTHORIZED, "Unauthorized");
        }
      }

      if (!chat.isGroupChat) {
        return response(res, http.BAD_REQUEST, "This is not a group chat");
      }

      if (chat.participants.includes(userID)) {
        return response(res, http.OK, "User already added");
      }

      const user = await userModel.findById(userID);

      if (!user) {
        return response(res, http.NOT_FOUND, "User not found");
      }

      chat.participants.push(new mongoose.Types.ObjectId(userID));

      await chat.save();

      return response(res, http.OK, "User added to chat");
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

  async removeParticipant(req, res) {
    try {
      const { chatID, userID } = req.body;

      const chat = await chatModel.findById(chatID);

      if (!chat) {
        return response(res, http.NOT_FOUND, "Chat not found");
      }

      const user = await userModel.findById(userID);

      if (!user) {
        return response(res, http.NOT_FOUND, "User not found");
      }

      if (chat.isGroupChat && userID !== req.user.userID.toString()) {
        if (chat.admin.toString() !== req.user.userID.toString()) {
          return response(res, http.UNAUTHORIZED, "Unauthorized");
        }
      }

      if (!chat.isGroupChat) {
        return response(res, http.BAD_REQUEST, "This is not a group chat");
      }

      if (!chat.participants.includes(userID)) {
        return response(res, http.OK, "User does not exist in this chat");
      }

      if (chat.isGroupChat && userID === req.user.userID.toString()) {
        const index = chat.participants.indexOf(userID);

        chat.participants.splice(index, 1);

        await chat.save();

        if (chat.admin.toString() === userID && chat.participants.length > 0) {
          await chatModel.findByIdAndUpdate(chat._id, {
            admin: chat.participants[0],
          });
        }

        if (chat.participants.length === 0) {
          const deletedChat = await chatModel.findByIdAndDelete(chat._id);

          await messageModel.deleteMany({ chat: deletedChat._id });
        }

        return response(res, http.OK, `${req.user.username} left this group`);
      }

      const index = chat.participants.indexOf(userID);

      chat.participants.splice(index, 1);

      await chat.save();

      return response(res, http.OK, "User removed from chat");
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

  async renameGroupChat(req, res) {
    try {

      const { chatID, chatName } = req.body;

      if (!chatName) {
        return response(res, http.BAD_REQUEST, "Chat name is required");
      }

      const extChat = await chatModel.findOne({
        _id: chatID,
        participants: {
          $elemMatch: { $eq: new mongoose.Types.ObjectId(req.user.userID) },
        },
      });

      if (!extChat) {
        return response(res, http.NOT_FOUND, "Chat not found");
      }

      if (!extChat.isGroupChat) {
        return response(res, http.BAD_REQUEST, "This is not a group chat");
      }

      if (extChat.admin.toString() !== req.user.userID.toString()) {
        return response(res, http.UNAUTHORIZED, "Unauthorized");
      }

      const updateChat = await chatModel.findByIdAndUpdate(
        chatID,
        {
          chatName,
        },
        { new: true }
      );
      return response(res, http.OK, "Chat name updated", updateChat);
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

  async deleteChat(req, res) {
    try {
      const { chatID } = req.params;

      const chat = await chatModel.findOne({
        _id: chatID,
        participants: {
          $elemMatch: { $eq: new mongoose.Types.ObjectId(req.user.userID) },
        },
      });

      if (!chat) {
        return response(
          res,
          http.NOT_FOUND,
          "You are not a participant in this chat"
        );
      }

      if (!chat.isGroupChat) {
        let extParticipants = chat.participants.filter(
          (participant) => participant.toString() !== req.user.userID.toString()
        );
        const deleteChat = await chatModel.findByIdAndUpdate(
          chatID,
          {
            participants: extParticipants,
          },
          { new: true }
        );
        if (deleteChat.participants.length === 0) {
          const deletedChat = await chatModel.findByIdAndDelete(chatID);
          await messageModel.deleteMany({ chat: deletedChat._id });
        }
      }

      return response(res, http.OK, "Chat deleted");
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

  async getAllChat(req, res) {
    try {
      const chats = await chatModel.find({
        participants: {
          $elemMatch: { $eq: new mongoose.Types.ObjectId(req.user.userID) },
        },
      }).populate("participants", "username email profilePic")
      .populate("lastMessage", "content createdAt");

      if (chats.length === 0) {
        return response(res, http.NOT_FOUND, "Chats not found");
      }

      return response(res, http.OK, "Chats retrieved", chats);
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

  async changeAdmin(req, res) {
    try {

      const { chatID, userID } = req.body;

      const extChat = await chatModel.findOne({
        _id: chatID,
        participants: {
          $elemMatch: { $eq: new mongoose.Types.ObjectId(req.user.userID) },
        },
      });

      if (!extChat) {
        return response(res, http.NOT_FOUND, "Chat not found");
      }

      if (!extChat.isGroupChat) {
        return response(res, http.BAD_REQUEST, "This is not a group chat");
      }

      if (extChat.admin.toString() !== req.user.userID.toString()) {
        return response(res, http.UNAUTHORIZED, "Unauthorized");
      }

      if (!extChat.participants.includes(userID)) {
        return response(res, http.NOT_FOUND, "User is not in this chat");
      }

      const updateChat = await chatModel.findByIdAndUpdate(
        chatID,
        {
          admin: userID,
        },
        { new: true }
      );
      return response(res, http.OK, "Admin changed", updateChat);
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

module.exports = new ChatController();
