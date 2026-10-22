const mongoose = require('mongoose')


const ReviewSchema = new mongoose.Schema({
    courseId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    userName: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default: '',
        maxlength: 2000,
        trim: true
    }
}, { timestamps: true })

ReviewSchema.index({ courseId: 1, userId: 1 }, { unique: true })

module.exports = mongoose.model('Review', ReviewSchema)
