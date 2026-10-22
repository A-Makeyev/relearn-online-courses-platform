const mongoose = require("mongoose")

const NotesSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    courseId: {
        type: String,
        required: true,
        index: true
    },
    lectureId: String,
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

// Update updatedAt on save
NotesSchema.pre("save", function(next) {
    this.updatedAt = new Date()
    next()
})

module.exports = mongoose.model("Notes", NotesSchema)
