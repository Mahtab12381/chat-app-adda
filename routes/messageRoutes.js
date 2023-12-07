const express = require('express')
const routes = express()
const ChatController = require('../controller/chatController')
const MessageController = require('../controller/messageController')
const { isUserLoggedIn } = require('../middleware/auth')

routes.post("/send-message", isUserLoggedIn, MessageController.sendMessage)
routes.get("/get-messages/:chatID", isUserLoggedIn, MessageController.getMessages)
routes.delete("/delete-message/:messageID", isUserLoggedIn, MessageController.deleteMessage)

module.exports = routes 