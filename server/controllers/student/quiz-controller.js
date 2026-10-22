const mongoose = require("mongoose")
const Quiz = require("../../models/Quiz")
const CourseProgress = require("../../models/CourseProgress")

// @desc    Get quizzes for a course
// @route   GET /api/student/quiz/:courseId
// @access  Private
const getCourseQuizzes = async (req, res) => {
    try {
        const { courseId } = req.params
        const userId = req.user._id

        const quizzes = await Quiz.find({ courseId }).sort({ position: 1 })

        res.status(200).json({
            success: true,
            data: quizzes
        })
    } catch (error) {
        console.error("Get quizzes error:", error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch quizzes"
        })
    }
}

// @desc    Submit quiz answer
// @route   POST /api/student/quiz/:quizId/submit
// @access  Private
const submitQuizAnswer = async (req, res) => {
    try {
        const { quizId } = req.params
        const { answer } = req.body
        const userId = req.user._id

        const quiz = await Quiz.findById(quizId)

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            })
        }

        // Check if already answered
        const existingProgress = await CourseProgress.findOne({
            userId,
            courseId: quiz.courseId
        })

        const existingAnswer = existingProgress?.quizAnswers?.find(
            q => q.quizId === quizId
        )

        if (existingAnswer) {
            return res.status(200).json({
                success: true,
                data: {
                    alreadyAnswered: true,
                    correct: existingAnswer.correct,
                    userAnswer: existingAnswer.answer,
                    correctAnswer: quiz.correctAnswer
                }
            })
        }

        const isCorrect = answer === quiz.correctAnswer

        // Update progress with quiz answer
        if (existingProgress) {
            existingProgress.quizAnswers.push({
                quizId,
                answer,
                correct: isCorrect,
                answeredAt: new Date()
            })
            await existingProgress.save()
        } else {
            // Create new progress if doesn't exist
            await CourseProgress.create({
                userId,
                courseId: quiz.courseId,
                quizAnswers: [{
                    quizId,
                    answer,
                    correct: isCorrect,
                    answeredAt: new Date()
                }]
            })
        }

        res.status(200).json({
            success: true,
            data: {
                correct: isCorrect,
                userAnswer: answer,
                correctAnswer: quiz.correctAnswer
            }
        })
    } catch (error) {
        console.error("Submit quiz error:", error)
        res.status(500).json({
            success: false,
            message: "Failed to submit quiz answer"
        })
    }
}

module.exports = {
    getCourseQuizzes,
    submitQuizAnswer
}
