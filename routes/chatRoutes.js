const express = require('express')
const routes = express()
const ChatController = require('../controller/chatController')
const { isUserLoggedIn } = require('../middleware/auth')

routes.post("/create-chat", isUserLoggedIn, ChatController.createChat)
routes.delete("/delete-chat/:chatID", isUserLoggedIn, ChatController.deleteChat)
routes.get("/get-all-chats", isUserLoggedIn, ChatController.getAllChat)
routes.post("/create-group-chat", isUserLoggedIn, ChatController.createGroupChat)
routes.post("/add-participants", isUserLoggedIn, ChatController.addParticipant)
routes.patch("/remove-participants", isUserLoggedIn, ChatController.removeParticipant)
routes.patch("/rename-group-chat", isUserLoggedIn, ChatController.renameGroupChat)
routes.patch("/change-admin", isUserLoggedIn, ChatController.changeAdmin)

module.exports = routes 