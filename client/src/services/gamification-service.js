import axiosInstance from "@/api/axiosInstance"

export const getUserStats = async () => {
    const { data } = await axiosInstance.get('/student/gamification')
    return data
}

export const addXp = async (amount, eventType) => {
    const { data } = await axiosInstance.post('/student/gamification/add-xp', { amount, eventType })
    return data
}

export const awardBadge = async (badgeId) => {
    const { data } = await axiosInstance.post('/student/gamification/award-badge', { badgeId })
    return data
}

export const checkAchievements = async (achievements) => {
    const { data } = await axiosInstance.post('/student/gamification/check-achievements', achievements)
    return data
}

// Get level progress for display
export const getLevelProgress = (xp) => {
    const level = Math.floor(Math.sqrt(xp / 100)) + 1
    const xpForCurrentLevel = (level - 1) * 100
    const xpForNextLevel = level * 100
    const xpInCurrentLevel = xp - xpForCurrentLevel
    const progress = xpInCurrentLevel / (xpForNextLevel - xpForCurrentLevel) * 100
    
    return {
        level,
        xp,
        xpInCurrentLevel,
        xpForNextLevel,
        progress: Math.min(100, progress)
    }
}
