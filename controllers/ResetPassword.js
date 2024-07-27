const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const bcrypt = require("bcrypt")


exports.resetPasswordToken = async (req, res) => {
    try {
        const email = req.body.email

        const user = await User.findOne({ email: email })

        if (!user) {
            return res.json({
                success: false,
                message: "User Not Found"
            })
        }
        const token = crypto.randomUUID()

        const updatedDetails = await User.findOneAndUpdate({ email: email }, {
            token: token,
            resetPasswordExpires: Date.now() + 5 * 60 * 1000
        }, { new: true })
        const url = `https://localhost:3000/update-password/${token}`

        await mailSender(email, "Password Reset Link", `Password Reset Link: ${url}`)

        return res.json({
            success: true,
            message: "Email Sent Succcessfully, Please Check and Reset Password"
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error Sending Reset Password Link"
        })
    }
}


exports.resetPasswordToken = async (req, res) => {
    try {
        const { token, password, confirmPassword } = req.body

        if (password !== confirmPassword) return res.json({
            success: false,
            message: "Passwords Do Not Match"
        })

        const userDetails = await User.findOne({ token: token })

        if (!userDetails) {
            return res.json({
                success: false,
                message: "token is invalid"
            })
        }

        if (userDetails.resetPasswordExpires > Date.now()) {
            return res.json({
                success: false,
                message: "Link Expired, Please Try Again"
            })
        }


        const hashedPassword = await bcrypt.hash(password, 10)

        await User.findOneAndUpdate(
            { token: token },
            { password: hashedPassword },
            { new: true }
        )

        return res.json({
            success: true,
            message: "Password Reset Successful"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error Reseting Password"
        })
    }


}