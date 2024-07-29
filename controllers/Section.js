const Section = require("../models/Section")
const Course = require("../models/Course")

exports.createSection = async (req, res) => {
    try {
        const { sectionName, courseId } = req.body

        if (!sectionName || courseId) {
            return res.status(400).json({
                success: false,
                message: "All fields are Required"
            })

        }

        const newSection = await Section.create({ sectionName })

        const updatedCourse = await Course.findByIdAndUpdate(courseId, {
            $push: {
                courseContent: newSection._id
            }
        }, { new: true }).populate('courseContent')

        return res.status(200).json({
            success: true,
            message: "Section created and added to course successfully",
            course: updatedCourse,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: true,
            message: "Error Creating Course"
        })
    }
}

exports.updateSection = async (req, res) => {
    try {
        const { sectionName, sectionId } = req.body
        if (!sectionName || sectionId) {
            return res.status(400).json({
                success: false,
                message: "All fields are Required"
            })
        }

        const section = await Section.findByIdAndUpdate({ sectionId }, { sectionName }, { new: true })
        return res.status(200).json({
            success: true,
            message: "Section Updated Successfully"
        }
        )

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: true,
            message: "Error Updating Course"
        })
    }
}


exports.deleteSection = async (req, res) => {
    try {
        const { sectionId } = req.params

        if (!sectionId) return res.status(400).json({
            success: false,
            message: "Enter Valid Section Id"
        })
        await Section.findByIdAndDelete({ sectionId })

        return res.status(200).json({
            success: true,
            message: "Section Deleted Successfully"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: true,
            message: "Error Updating Course"
        })
    }
}