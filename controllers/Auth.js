//signup && LOGIN && CHANGE PASSWORD && SEND OTP
const User = require("../models/User")
const Profile = require("../models/Profile");
const OTP = require("../models/Otp")
const otpGenerator = require("otp-generator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()




exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body

        const checkUserPresent = await User.findOne({ email })

        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User is already present"
            })
        }
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })

        let result = await OTP.findOne({ otp: otp })

        while (result) {
            otp = otpGenerator(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            })
            result = await OTP.findOne({ otp: otp })
        }

        const otpPayload = { email, otp }

        const otpBody = await OTP.create(otpPayload)
        console.log(otpBody)

        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            otp
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            success: false,
            message: "Error in sending OTP"
        })
    }
}


exports.signUp = async (req, res) => {
    try {
        const {
            email,
            firstName,
            lastName,
            password,
            confirmPassword,
            contactNumber,
            otp,
            accountType } = req.body

        if (!firstName || !lastName || !password || confirmPassword || contactNumber || otp || email) {
            return res.status(403).json({
                success: false,
                message: "All fields are compulsory"
            })
        }
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Entered Passwords Do Not Match"
            })
        }


        const existingUser = await User.findOne(email)
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User Already Exists"
            })
        }

        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)

        if (recentOtp.length === 0) {
            return res.status(400).json({
                success: false,
                message: "OTP Not Entered"
            })
        }
        else if (recentOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: "OTP Does Not Match"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: contactNumber,
        })

        const user = await User.create({
            email,
            firstName,
            lastName,
            password: hashedPassword,
            contactNumber,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName} ${lastName}`
        })

        res.status(200).json({
            success: true,
            message: "User Has Been Successfully Created", user
        })
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `error Signing Up the User: ${e}`
        })
    }
}


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(403).json({
            success: false,
            message: "Please fill all the details and try again"
        })

        const user = await User.findOne({ email }).populate({ additionalDetails })

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, Please sign up"
            })
        }

        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                role: user.role
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" })
            user.token = token
            user.password = undefined

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 100)
            }

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Logged In Successfully"
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Password Is Incorrect"
            })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Could Not Login, Please Try Again"
        })
    }
}

exports.changePassword = async (req, res) => {
    try {
        const userDetails = await User.findById(req.user.id);

        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        );
        if (!isPasswordMatch) {
            return res.status(401).json(
                {
                    success: false,
                    message: "The password is incorrect"
                });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "The password and confirm password does not match",
            });
        }
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true }
        );

        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
            console.log("Email sent successfully:", emailResponse.response);
        } catch (error) {
            // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
            console.error("Error occurred while sending email:", error);
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            });
        }

        // Return success response
        return res
            .status(200)
            .json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while updating password:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: error.message,
        });
    }
};
