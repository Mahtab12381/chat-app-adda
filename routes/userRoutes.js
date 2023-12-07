const express = require('express')
const routes = express()
const AuthController = require('../controller/authController')
const UserController = require('../controller/userController')
const { isUserLoggedIn } = require('../middleware/auth')

routes.get("/get-user-info/:userID", isUserLoggedIn, UserController.getUserInfo)
routes.get("/all-user-info", isUserLoggedIn, UserController.allUserInfo)

module.exports = routes 