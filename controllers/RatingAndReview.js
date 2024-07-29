const RatingAndReview = require("../models/RatingAndReview")
const Course = require("../models/Course")
const { default: mongoose } = require("mongoose")

exports.createRating = async (req, res) => {
    try {
        const { courseId, rating, review } = req.body
        const userId = req.user.id

        const courseDetails = await Course.findOne({ _id: courseId, studentsEnrolled: { $elemMatch: { $eq: userId } } })

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Student not enrolled in course"
            })
        }

        const alreadyReviewed = await RatingAndReview.findOne({ user: userId, courseId: courseId })

        if (alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: "Course is already reviewed by the user"
            })
        }


        const ratingReview = await RatingAndReview.create({
            rating, review, course: courseId, user: userId
        })

        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId, {
            $push: {
                ratingAndReview: ratingReview._id
            }
        }, { new: true })

        console.log(updatedCourseDetails)
        return res.status(200).json({
            success: true,
            message: "Review created Successfully",
            ratingReview
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Unable to add Review"
        })
    }
}

exports.getAverageRating = async (req, res) => {
    try {
        const courseId = req.body.courseId
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: mongoose.Types.ObjectId(courseId)
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" }
                }
            }
        ])
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating
            })
        }

        return res.status(200).json({
            success: true,
            message: "Average Rating is 0 no rating till now",
            averageRating: 0
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Unable to Calculate Avg Rating"
        })
    }
}

exports.getAllRating = async (req, res) => {
    try {
        const allReviews = await RatingAndReview.find({}).sort({ rating: "desc" })
            .populate({
                path: "user",
                select: "firstName lastName email image"
            })
            .populate({
                path: "course",
                select: "courseName"
            }).exec()

        return res.status(200).json({
            success: true,
            message: "All reviews fetched Successfully",
            data: allReviews
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "No Reviews ABle to Fetch"
        })
    }
}