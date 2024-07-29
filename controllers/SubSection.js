const SubSection = require("../models/SubSection")
const Section = require("../models/Section")
const { uploadImageToCloudinary } = require("../utils/imageUploader")

exports.createSubSection = async (req, res) => {
    try {
        const { title, description, sectionId, timeDuration } = req.body

        const video = req.files.videoFile

        if (!title || !description || !sectionId || !timeDuration) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME)

        const SubSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            videoUrl: uploadDetails.secure_url,
            description: description
        })

        const updatedSection = await Section.findByIdAndUpdate({ _id: sectionId }, {
            $push: {
                subSection: SubSectionDetails._id
            }
        }, { new: true }).populate("subSection")

        return res.status(200).json({
            success: true,
            message: "SubSection created and added to course successfully",
            course: updatedSection,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: true,
            message: "Error Creating Subsection"
        })
    }
}

exports.updateSubSection = async (req, res) => {
    try {
        const { subSectionId, title, description, timeDuration } = req.body;

        if (!subSectionId || !title || !description || !timeDuration) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const updatedSubSection = await SubSection.findByIdAndUpdate(
            subSectionId,
            {
                title: title,
                description: description,
                timeDuration: timeDuration,
            },
            { new: true }
        );

        if (!updatedSubSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            subSection: updatedSubSection,
        });
    } catch (error) {
        console.error("Error updating subsection:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating subsection",
        });
    }
};

exports.deleteSection = async (req, res) => {
    try {
        const { subSectionId } = req.params

        if (!subSectionId) return res.status(400).json({
            success: false,
            message: "Enter Valid SubSection Id"
        })
        await Section.findByIdAndDelete({ subSectionId })

        return res.status(200).json({
            success: true,
            message: "subSectionId Deleted Successfully"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: true,
            message: "Error Updating subSection"
        })
    }
}