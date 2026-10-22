const mongoose = require('mongoose')


const CertificateSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        index: true,
        uppercase: true,
        trim: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    studentName: {
        type: String,
        required: true,
        trim: true
    },
    courseId: {
        type: String,
        required: true,
        index: true
    },
    courseTitle: {
        type: String,
        required: true,
        trim: true
    },
    courseCategory: {
        type: String,
        default: ''
    },
    instructorName: {
        type: String,
        default: ''
    },
    lectureCount: {
        type: Number,
        default: 0,
        min: 0
    },
    issuedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

CertificateSchema.index({ userId: 1, courseId: 1 }, { unique: true })

module.exports = mongoose.model('Certificate', CertificateSchema)
