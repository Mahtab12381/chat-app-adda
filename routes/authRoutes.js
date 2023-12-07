const express = require('express')
const routes = express()
const AuthController = require('../controller/authController')

routes.post("/signup", AuthController.signUp)
// routes.post("/resend-verification-email", AuthController.resendVerificationEmail)
// routes.get("/verify-email/:userId/:token", AuthController.verifyEmail)

routes.post("/login", AuthController.login)

// routes.post("/forgot-password", AuthController.sendForgotPasswordEmail)
// routes.post("/reset-password/:userId/:token", AuthController.resetPassword)
// routes.get("/validate-reset-request/:userId/:token", AuthController.validatePasswordResetRequest);

module.exports = routes 