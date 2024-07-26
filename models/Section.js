const mongoose = require("mongoose")
require("dotenv").config()

const sectionSchema = new mongoose.Schema({
    sectionName: {
        type: String,
    },
    SubSection: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "SubSection"
    }]
})

module.exports = mongoose.model("Section", sectionSchema)