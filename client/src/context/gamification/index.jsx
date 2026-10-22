import { createContext, useContext, useEffect, useState } from "react"
import { getUserStats as fetchUserStats, addXp as addUserXp, checkAchievements as checkUserAchievements } from "@/services/gamification-service"

const GamificationContext = createContext(null)

export default function GamificationProvider({ children }) {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [recentActivity, setRecentActivity] = useState([])

    useEffect(() => {
        loadStats()
    }, [])

    async function loadStats() {
        try {
            const response = await fetchUserStats()
            if (response.success) {
                setStats(response.data)
            }
        } catch (error) {
            console.error("Failed to load gamification stats:", error)
        } finally {
            setLoading(false)
        }
    }

    async function addXp(amount, eventType = "general") {
        try {
            const response = await addUserXp(amount, eventType)
            if (response.success) {
                setStats(prev => {
                    if (!prev) return response.data
                    return {
                        ...response.data,
                        totalCoursesCompleted: prev.totalCoursesCompleted,
                        totalLecturesWatched: prev.totalLecturesWatched,
                        badges: [...prev.badges]
                    }
                })
                return response.data
            }
        } catch (error) {
            console.error("Failed to add XP:", error)
        }
    }

    async function recordLectureWatch() {
        const response = await addXp(5, "lecture_watched")
        
        // Update local state
        setStats(prev => {
            if (!prev) return response?.data
            return {
                ...prev,
                totalLecturesWatched: (prev.totalLecturesWatched || 0) + 1,
                xp: (prev.xp || 0) + (response?.data?.xp || 0)
            }
        })

        // Check for achievements
        if (response?.data) {
            await checkUserAchievements({
                totalCoursesCompleted: stats?.totalCoursesCompleted || 0,
                totalLecturesWatched: stats?.totalLecturesWatched || 0
            }).then(checkResponse => {
                if (checkResponse.success && checkResponse.data.newBadges) {
                    setStats(prev => {
                        if (!prev) return null
                        return {
                            ...prev,
                            badges: [...prev.badges, ...checkResponse.data.newBadges.map(b => ({
                                badgeId: b.badgeId,
                                earnedAt: new Date(),
                                xpBounty: b.xpEarned
                            }))]
                        }
                    })
                }
            })
        }
    }

    async function recordCourseComplete() {
        const response = await addXp(100, "course_completed")
        
        // Update local state
        setStats(prev => {
            if (!prev) return response?.data
            return {
                ...prev,
                totalCoursesCompleted: (prev.totalCoursesCompleted || 0) + 1
            }
        })

        // Check for achievements
        if (response?.data) {
            await checkUserAchievements({
                totalCoursesCompleted: stats?.totalCoursesCompleted || 0,
                totalLecturesWatched: stats?.totalLecturesWatched || 0
            }).then(checkResponse => {
                if (checkResponse.success && checkResponse.data.newBadges) {
                    setStats(prev => {
                        if (!prev) return null
                        return {
                            ...prev,
                            badges: [...prev.badges, ...checkResponse.data.newBadges.map(b => ({
                                badgeId: b.badgeId,
                                earnedAt: new Date(),
                                xpBounty: b.xpEarned
                            }))]
                        }
                    })
                }
            })
        }
    }

    const value = {
        stats,
        loading,
        recentActivity,
        addXp,
        recordLectureWatch,
        recordCourseComplete,
        refreshStats: loadStats
    }

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    )
}

export function useGamification() {
    const context = useContext(GamificationContext)
    if (!context) {
        throw new Error("useGamification must be used within a GamificationProvider")
    }
    return context
}
