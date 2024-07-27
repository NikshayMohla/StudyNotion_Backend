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
            const decode = jwt.verify(token, process.env.JWT_TOKEN)
            console.log(decode)
            req.user = decode
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Token Is Invalid"
            })
        }
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Something Went Wrong While Validating Token"
        })
    }
}


exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Student") {
            res.status(401).json({
                success: false,
                message: "This role is for Students only"
            })
        } next()
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "User Role Cannot Be Verified"
        })
    }
}
exports.isInstructor = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Instructor") {
            res.status(401).json({
                success: false,
                message: "This role is for Instructor only"
            })
        }
        next()
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "User Role Cannot Be Verified"
        })
    }
}
exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            res.status(401).json({
                success: false,
                message: "This role is for Admin only"
            })
        } next()
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "User Role Cannot Be Verified"
        })
    }
}