const express = require("express")
const router = express.Router()
const {
    getCourseQuizzes,
    submitQuizAnswer
} = require("../../controllers/student/quiz-controller")
const { protect } = require("../../../middleware/auth-middleware")

router.use(protect)

router.get("/:courseId", getCourseQuizzes)
router.post("/:quizId/submit", submitQuizAnswer)

module.exports = router
