const mongoose = require("mongoose")

const BadgeSchema = new mongoose.Schema({
    badgeId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: "#8b5cf6"
    },
    xpReward: {
        type: Number,
        default: 50
    },
    category: {
        type: String,
        enum: ['learning', 'consistency', 'achievement', 'social'],
        required: true
    },
    requirement: {
        type: String,
        required: true
    },
    requirementValue: {
        type: Number,
        default: 1
    }
})

// Default badges to seed
BadgeSchema.statics.getDefaults = function() {
    return [
        {
            badgeId: 'first-course',
            name: 'First Steps',
            description: 'Complete your first course',
            icon: '🏆',
            color: '#f59e0b',
            xpReward: 100,
            category: 'achievement',
            requirement: 'totalCoursesCompleted',
            requirementValue: 1
        },
        {
            badgeId: 'five-courses',
            name: 'Dedicated Learner',
            description: 'Complete 5 courses',
            icon: '🥇',
            color: '#8b5cf6',
            xpReward: 250,
            category: 'achievement',
            requirement: 'totalCoursesCompleted',
            requirementValue: 5
        },
        {
            badgeId: 'ten-courses',
            name: 'Course Master',
            description: 'Complete 10 courses',
            icon: '🎓',
            color: '#10b981',
            xpReward: 500,
            category: 'achievement',
            requirement: 'totalCoursesCompleted',
            requirementValue: 10
        },
        {
            badgeId: 'first-lecture',
            name: 'Curious Mind',
            description: 'Watch your first lecture',
            icon: '👀',
            color: '#3b82f6',
            xpReward: 10,
            category: 'learning',
            requirement: 'totalLecturesWatched',
            requirementValue: 1
        },
        {
            badgeId: 'fifty-lectures',
            name: 'Knowledge Seeker',
            description: 'Watch 50 lectures',
            icon: '📚',
            color: '#6366f1',
            xpReward: 150,
            category: 'learning',
            requirement: 'totalLecturesWatched',
            requirementValue: 50
        },
        {
            badgeId: 'hundred-lectures',
            name: 'Learning Machine',
            description: 'Watch 100 lectures',
            icon: '🧠',
            color: '#7c3aed',
            xpReward: 300,
            category: 'learning',
            requirement: 'totalLecturesWatched',
            requirementValue: 100
        },
        {
            badgeId: 'three-day-streak',
            name: 'Getting Started',
            description: 'Maintain a 3-day learning streak',
            icon: '🔥',
            color: '#f97316',
            xpReward: 75,
            category: 'consistency',
            requirement: 'currentStreak',
            requirementValue: 3
        },
        {
            badgeId: 'seven-day-streak',
            name: 'On Fire',
            description: 'Maintain a 7-day learning streak',
            icon: '🌟',
            color: '#ef4444',
            xpReward: 150,
            category: 'consistency',
            requirement: 'currentStreak',
            requirementValue: 7
        },
        {
            badgeId: 'thirty-day-streak',
            name: 'Unstoppable',
            description: 'Maintain a 30-day learning streak',
            icon: '⚡',
            color: '#dc2626',
            xpReward: 500,
            category: 'consistency',
            requirement: 'currentStreak',
            requirementValue: 30
        },
        {
            badgeId: 'level-5',
            name: 'Rising Star',
            description: 'Reach level 5',
            icon: '⭐',
            color: '#fbbf24',
            xpReward: 100,
            category: 'achievement',
            requirement: 'level',
            requirementValue: 5
        },
        {
            badgeId: 'level-10',
            name: 'Expert Learner',
            description: 'Reach level 10',
            icon: '👑',
            color: '#f59e0b',
            xpReward: 250,
            category: 'achievement',
            requirement: 'level',
            requirementValue: 10
        }
    ]
}

module.exports = mongoose.model("Badge", BadgeSchema)
