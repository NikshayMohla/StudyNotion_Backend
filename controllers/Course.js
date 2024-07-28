const Course = require("../models/Course")
const Tag = require("../models/Tag")
const User = require("../models/User")
const uploadImageToCloudinary = require("../utils/imageUploader")

exports.createCourse = async (req, res) => {
    try {
        const { courseName, courseDescription, whatYouWillLearn, price, tag } = req.body
        const thumbnail = req.files.thumbnailImage

        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const userId = req.user.userId
        const instructorDetails = await User.findById(userId)
        console.log(instructorDetails)

        if (userId !== instructorDetails._id) {
            return res.status(403).json({
                success: false,
                message: "User is not allowed to create course"
            })
        }

        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor Details Not Found"
            })
        }

        const tagDetails = await Tag.findById(tag)

        if (!tagDetails) {
            return res.status(404).json({
                success: false,
                message: "Tag Details Not Found"
            })
        }


        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME)


        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url
        })


        await User.findByIdAndUpdate({ _id: instructorDetails._id }, {
            $push: {
                courses: newCourse._id
            }
        }, { new: true })


        return res.status(200).json({
            success: true,
            message: "course created successfully",
            data: newCourse
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Failed To Create Course"
        })
    }
}

exports.createCourse = async (req, res) => {
    try {
        const allCourses = await Course.find({}, { couseName: true, price: true, thumbnail: true, instructor: true, ratingAndReviews: true, studentsEnrolled: true }).populate("instructor").exec()

        return res.status(200).json({
            success: true,
            message: "All Courses Fetched Successfully"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Failed To fetch all Course"
        })
    }
}