const Profile = require("../models/Profile")
const User = require("../models/User")

exports.updateProfile = async (req, res) => {
    try {
        const { dateOfBirth = "", about = "", contactNumber, gender } = req.body

        const id = req.user.id

        if (!contactNumber || !gender) {
            return res.status(400).json({
                success: false,
                message: "Enter All Details"
            })
        }

        const userDetails = await User.findById({ id })
        const profileId = userDetails.additionalDetails

        const profileDetails = await Profile.findById({ profileId })

        profileDetails.dateOfBirth = dateOfBirth
        profileDetails.about = about
        profileDetails.gender = gender
        profileDetails.contactNumber = contactNumber
        await profileDetails.save()

        return res.status(200).json({
            success: true,
            message: "Profile updated Successfully",
            profileDetails
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Error Updating Profile"
        })
    }
}


exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id
        const userDetails = await User.findById(userId )
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: "User Not Found"
            })
        }
        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails })

        await User.findByIdAndDelete({ _id: userId })
        return res.status(200).json({
            success: true,
            message: "Profile Deleted Successfully",
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Error Delete User"
        })
    }
}

exports.getAllUserDetails = async (req, res) => {
    try {
        const id = req.user.id
        const userDetails = await User.findById(id).populate("additionalDetails").exec()
        return res.status(200).json({
            success: true,
            message: "All Profiles Fetched Successfully",
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Error Fetching Profile"
        })
    }
}