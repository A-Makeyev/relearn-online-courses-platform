const mongoose = require("mongoose")

const LearningPathSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    instructorId: {
        type: String,
        required: true
    },
    instructorName: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    duration: {
        type: Number, // Total estimated hours
        default: 0
    },
    courses: [{
        courseId: {
            type: String,
            required: true
        },
        title: String,
        courseImage: String,
        order: Number,
        isRequired: {
            type: Boolean,
            default: true
        }
    }],
    prerequisites: [{
        type: String // Course IDs that must be completed first
    }],
    objectives: [{
        type: String
    }],
    enrolledCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// Update enrolled count when users enroll
LearningPathSchema.statics.enrollUser = async function(pathId, userId) {
    const path = await this.findById(pathId)
    if (!path) return null
    
    // Check if already enrolled
    const Enrollment = require('./LearningPathEnrollment')
    const existing = await Enrollment.findOne({ pathId, userId })
    
    if (!existing) {
        await Enrollment.create({ pathId, userId })
        path.enrolledCount = (path.enrolledCount || 0) + 1
        await path.save()
    }
    
    return path
}

module.exports = mongoose.model("LearningPath", LearningPathSchema)
