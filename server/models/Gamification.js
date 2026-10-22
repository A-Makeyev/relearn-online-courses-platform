const mongoose = require("mongoose")

const UserAchievementSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    badgeId: {
        type: String,
        required: true
    },
    earnedAt: {
        type: Date,
        default: Date.now
    },
    xpBounty: {
        type: Number,
        default: 0
    }
})

const UserStatsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    totalCoursesCompleted: {
        type: Number,
        default: 0
    },
    totalLecturesWatched: {
        type: Number,
        default: 0
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastActiveDate: {
        type: Date,
        default: Date.now
    },
    badges: [UserAchievementSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// Method to calculate level from XP
UserStatsSchema.methods.calculateLevel = function() {
    // Level formula: level = floor(sqrt(xp / 100))
    // Level 1: 0 XP, Level 2: 100 XP, Level 3: 400 XP, etc.
    const xp = this.xp
    const level = Math.floor(Math.sqrt(xp / 100)) + 1
    return Math.max(1, level)
}

// Method to add XP
UserStatsSchema.methods.addXp = function(amount) {
    this.xp += amount
    this.level = this.calculateLevel()
}

// Method to update streak
UserStatsSchema.methods.updateStreak = function() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const lastActive = new Date(this.lastActiveDate)
    lastActive.setHours(0, 0, 0, 0)
    
    const oneDay = 24 * 60 * 60 * 1000
    const diffDays = Math.floor((today - lastActive) / oneDay)
    
    if (diffDays === 1) {
        // Consecutive day
        this.currentStreak += 1
        if (this.currentStreak > this.longestStreak) {
            this.longestStreak = this.currentStreak
        }
    } else if (diffDays === 0) {
        // Same day, don't change
    } else {
        // Streak broken
        this.currentStreak = 1
    }
    
    this.lastActiveDate = new Date()
}

module.exports = mongoose.model("UserStats", UserStatsSchema)
