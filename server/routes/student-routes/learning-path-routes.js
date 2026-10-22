const express = require("express")
const router = express.Router()
const {
    getLearningPaths,
    getLearningPath,
    enrollInPath,
    updatePathProgress,
    getEnrolledPaths
} = require("../../controllers/student/learning-path-controller")
const { protect } = require("../../../middleware/auth-middleware")

router.use(protect)

router.get("/", getLearningPaths)
router.get("/enrolled", getEnrolledPaths)
router.get("/:pathId", getLearningPath)
router.post("/:pathId/enroll", enrollInPath)
router.post("/:pathId/progress", updatePathProgress)

module.exports = router
