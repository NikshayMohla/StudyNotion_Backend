const mongoose = require("mongoose")
require("dotenv").config()

exports.connect() = () => {
    mongoose.connect(process.env.MONGO_URL), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
        .then(() => {
            console.log("DB CONNECTED SUCCESFULLY")
        })
        .catch((e) => {
            console.log("DB CONNECTION FAILED")
            console.error()
            process.exit(1)
        })
}