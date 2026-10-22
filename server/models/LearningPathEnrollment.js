const mongoose = require("mongoose")

const LearningPathEnrollmentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    pathId: {
        type: String,
        required: true,
        index: true
    },
    progress: {
        type: Number,
        default: 0 // 0-100
    },
    completedCourses: [{
        type: String // Course IDs
    }],
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    },
    activeCourseId: {
        type: String,
        default: null
    }
})

module.exports = mongoose.model("LearningPathEnrollment", LearningPathEnrollmentSchema)
