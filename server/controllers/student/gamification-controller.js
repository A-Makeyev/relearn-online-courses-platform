const UserStats = require("../../models/Gamification")
const Badge = require("../../models/Badge")

// @desc    Get user's gamification stats
// @route   GET /api/student/gamification
// @access  Private
const getUserStats = async (req, res) => {
    try {
        const userId = req.userId
        let stats = await UserStats.findOne({ userId })

        if (!stats) {
            stats = await UserStats.create({ userId })
        }

        // Get badges with details
        const badgeIds = stats.badges.map(b => b.badgeId)
        const badges = await Badge.find({ badgeId: { $in: badgeIds } })

        res.status(200).json({
            success: true,
            data: {
                xp: stats.xp,
                level: stats.level,
                totalCoursesCompleted: stats.totalCoursesCompleted,
                totalLecturesWatched: stats.totalLecturesWatched,
                currentStreak: stats.currentStreak,
                longestStreak: stats.longestStreak,
                lastActiveDate: stats.lastActiveDate,
                badges: stats.badges.map(b => {
                    const badgeDef = badges.find(bb => bb.badgeId === b.badgeId)
                    return {
                        ...b.toObject(),
                        name: badgeDef?.name || b.badgeId,
                        description: badgeDef?.description || '',
                        icon: badgeDef?.icon || '🏆',
                        color: badgeDef?.color || '#8b5cf6'
                    }
                }),
                nextLevelXp: stats.level * 100,
                currentLevelXp: (stats.level - 1) * 100,
                xpProgress: stats.xp - (stats.level - 1) * 100,
                xpNeededForNextLevel: stats.level * 100 - stats.xp
            }
        })
    } catch (error) {
        console.error("Get user stats error:", error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch user stats"
        })
    }
}

// @desc    Add XP to user
// @route   POST /api/student/gamification/add-xp
// @access  Private
const addXp = async (req, res) => {
    try {
        const userId = req.userId
        const { amount, eventType } = req.body

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid XP amount"
            })
        }

        let stats = await UserStats.findOne({ userId })

        if (!stats) {
            stats = await UserStats.create({ userId })
        }

        const oldLevel = stats.level
        stats.addXp(amount)
        stats.updateStreak()
        await stats.save()

        // Check for level-up badge
        let newBadge = null
        if (stats.level > oldLevel) {
            // Check if user should earn a level badge
            const levelBadges = await Badge.find({
                category: 'achievement',
                requirement: 'level',
                requirementValue: { $lte: stats.level }
            }).sort({ requirementValue: -1 })

            if (levelBadges.length > 0) {
                const highestEarned = levelBadges[0]
                const alreadyHas = stats.badges.some(b => b.badgeId === highestEarned.badgeId)
                
                if (!alreadyHas && stats.level >= highestEarned.requirementValue) {
                    stats.badges.push({
                        badgeId: highestEarned.badgeId,
                        xpBounty: highestEarned.xpReward
                    })
                    await stats.save()
                    newBadge = {
                        badgeId: highestEarned.badgeId,
                        name: highestEarned.name,
                        icon: highestEarned.icon,
                        description: highestEarned.description
                    }
                }
            }
        }

        const xpToNextLevel = stats.level * 100 - stats.xp

        res.status(200).json({
            success: true,
            data: {
                xp: stats.xp,
                level: stats.level,
                xpToNextLevel,
                newBadge
            }
        })
    } catch (error) {
        console.error("Add XP error:", error)
        res.status(500).json({
            success: false,
            message: "Failed to add XP"
        })
    }
}

// @desc    Award badge to user
// @route   POST /api/student/gamification/award-badge
// @access  Private
const awardBadge = async (req, res) => {
    try {
        const userId = req.userId
        const { badgeId } = req.body

        const badge = await Badge.findOne({ badgeId })
        if (!badge) {
            return res.status(404).json({
                success: false,
                message: "Badge not found"
            })
        }

        let stats = await UserStats.findOne({ userId })
        if (!stats) {
            stats = await UserStats.create({ userId })
        }

        // Check if already has badge
        if (stats.badges.some(b => b.badgeId === badgeId)) {
            return res.status(200).json({
                success: true,
                data: { alreadyHas: true }
            })
        }

        // Add badge
        stats.badges.push({
            badgeId,
            xpBounty: badge.xpReward
        })
        
        // Also add XP reward
        stats.addXp(badge.xpReward)
        stats.updateStreak()
        await stats.save()

        res.status(200).json({
            success: true,
            data: {
                badge: {
                    badgeId: badge.badgeId,
                    name: badge.name,
                    icon: badge.icon,
                    description: badge.description,
                    color: badge.color
                },
                xpEarned: badge.xpReward
            }
        })
    } catch (error) {
        console.error("Award badge error:", error)
        res.status(500).json({
            success: false,
            message: "Failed to award badge"
        })
    }
}

// @desc    Check and award badges based on achievements
// @route   POST /api/student/gamification/check-achievements
// @access  Private
const checkAchievements = async (req, res) => {
    try {
        const userId = req.userId
        const { totalCoursesCompleted, totalLecturesWatched } = req.body

        let stats = await UserStats.findOne({ userId })
        if (!stats) {
            stats = await UserStats.create({ userId })
        }

        const badges = await Badge.find()
        const earnedBadgeIds = stats.badges.map(b => b.badgeId)
        const newBadges = []

        // Check each badge
        for (const badge of badges) {
            if (earnedBadgeIds.includes(badge.badgeId)) continue

            let shouldAward = false

            switch (badge.requirement) {
                case 'totalCoursesCompleted':
                    if ((totalCoursesCompleted || 0) >= badge.requirementValue) shouldAward = true
                    break
                case 'totalLecturesWatched':
                    if ((totalLecturesWatched || 0) >= badge.requirementValue) shouldAward = true
                    break
                case 'currentStreak':
                    if (stats.currentStreak >= badge.requirementValue) shouldAward = true
                    break
                case 'level':
                    if (stats.level >= badge.requirementValue) shouldAward = true
                    break
            }

            if (shouldAward) {
                stats.badges.push({
                    badgeId: badge.badgeId,
                    xpBounty: badge.xpReward
                })
                stats.addXp(badge.xpReward)
                newBadges.push({
                    badgeId: badge.badgeId,
                    name: badge.name,
                    icon: badge.icon,
                    description: badge.description,
                    color: badge.color,
                    xpEarned: badge.xpReward
                })
            }
        }

        stats.updateStreak()
        await stats.save()

        res.status(200).json({
            success: true,
            data: {
                newBadges,
                totalBadges: earnedBadgeIds.length + newBadges.length
            }
        })
    } catch (error) {
        console.error("Check achievements error:", error)
        res.status(500).json({
            success: false,
            message: "Failed to check achievements"
        })
    }
}

module.exports = {
    getUserStats,
    addXp,
    awardBadge,
    checkAchievements
}
