const mongoose = require("mongoose")

const databaseConnection = async (callback) => {
    try {
        // console.log("Database connection started", process.env.DATABASE_URL)
        if (process.env.DATABASE_URL) {
            const client = await mongoose.connect(process.env.DATABASE_URL)
            if (client) {
                console.log("Database connection successfully made")
                callback()
            }
            else {
                console.log("Database could not be connected")
            }
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = databaseConnection