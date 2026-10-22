const mongoose = require("mongoose")

const QuizSchema = new mongoose.Schema({
    courseId: {
        type: String,
        required: true,
        index: true
    },
    lectureId: {
        type: String,
        required: true
    },
    position: {
        type: Number,
        default: 0
    },
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Quiz", QuizSchema)
