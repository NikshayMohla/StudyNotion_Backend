const jwt = require("jsonwebtoken")
require("dotenv").config()
const User = require("../models/User")


exports.auth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.body.token || req.header("Authorisation").replace("Bearer", "")

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token Is Missing"
            })
        }
        try {
            const decode = await jwt.verify(token, process.env.JWT_TOKEN)
            console.log(decode)
        } catch (error) {

        }
    } catch (error) {

    }
}