const express = require("express")
const router = express.Router()
const {
    getUserStats,
    addXp,
    awardBadge,
    checkAchievements
} = require("../../controllers/student/gamification-controller")
const { protect } = require("../../../middleware/auth-middleware")

router.use(protect)

router.get("/", getUserStats)
router.post("/add-xp", addXp)
router.post("/award-badge", awardBadge)
router.post("/check-achievements", checkAchievements)

module.exports = router
