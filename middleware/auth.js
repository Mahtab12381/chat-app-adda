const jwt = require("jsonwebtoken")
const response = require("../utils/successError")
const http = require("../constants/statusCodes")
const authModel = require('../model/auth')

const isUserLoggedIn = async (req, res, next) => {
    try {
        const { authorization } = req.headers
        if (!authorization) {
            return response(res, http.BAD_REQUEST, "Authorization failed!")
        }
        const token = req.headers.authorization.split(" ")[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded) {
            return response(res, http.BAD_REQUEST, "Authorization failed!")
        }
        const user = await authModel.findOne({ _id: decoded._id })
        if (!user) {
            return response(res, http.BAD_REQUEST, "User not found")
        }

        req.user = user
        next()

    } catch (error) {
        console.log("error found", error)
        if (error instanceof jwt.JsonWebTokenError) {
            return response(res, http.INTERNAL_SERVER_ERROR, "Invalid token", error)
        }
        if (error instanceof jwt.TokenExpiredError) {
            return response(res, http.INTERNAL_SERVER_ERROR, "Token is expired", error)
        }
        return response(res, http.INTERNAL_SERVER_ERROR, "Internal server error", error)
    }
};

module.exports = {
    isUserLoggedIn,
}