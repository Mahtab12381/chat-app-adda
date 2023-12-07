const authModel = require("../model/auth")
const userModel = require("../model/user")
const response = require("../utils/successError")
const http = require("../constants/statusCodes")
const mongoose = require("mongoose")
const { validationResult } = require("express-validator")

class UserController {
    async getUserInfo(req, res) {
        try {
            const { userID } = req.params
            const user = await userModel.findOne({ _id: new mongoose.Types.ObjectId(userID) })
            if (!user) {
                return response(res, http.BAD_REQUEST, "User not found")
            }
            return response(res, http.OK, "User found", user)
        } catch (error) {
            console.log(error);
            return response(res, http.INTERNAL_SERVER_ERROR, "Internal Server Error", error.message)
        }
    }

    async allUserInfo(req, res) {
        try {
            const user = await userModel.find(
                { _id: { $ne: new mongoose.Types.ObjectId(req.user.userID) } }
            )
            if (!user) {
                return response(res, http.BAD_REQUEST, "User not found")
            }
            return response(res, http.OK, "User found", user)
        } catch (error) {
            console.log(error);
            return response(res, http.INTERNAL_SERVER_ERROR, "Internal Server Error", error.message)
        }
    }

    
}

module.exports = new UserController()