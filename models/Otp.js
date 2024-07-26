const mongoose = require("mongoose")
require("dotenv").config()

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        required:true,
        default:Date.now(),
        expires:5*60
    },
})

module.exports = mongoose.model("OTP", OTPSchema)