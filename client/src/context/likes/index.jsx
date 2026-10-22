import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export const LikesContext = createContext({
    likedIds: [],
    count: 0,
    isLiked: () => false,
    toggleLike: async () => false
})

export default function LikesProvider({ children }) {
    const [likedIds, setLikedIds] = useState([])
    const [pendingIds, setPendingIds] = useState([])

    useEffect(() => {
        // Load likes from localStorage
        try {
            const stored = localStorage.getItem('courseLikes')
            if (stored) {
                setLikedIds(JSON.parse(stored))
            }
        } catch {
            setLikedIds([])
        }
    }, [])

    // Persist likes to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('courseLikes', JSON.stringify(likedIds))
        } catch { /* ignore */ }
    }, [likedIds])

    const isLiked = useCallback((courseId) => {
        return likedIds.includes(String(courseId))
    }, [likedIds])

    const toggleLike = useCallback(async (courseId) => {
        const id = String(courseId)
        if (!id || pendingIds.includes(id)) return isLiked(id)

        const wasLiked = likedIds.includes(id)
        setPendingIds(current => [...current, id])

        // Optimistic update
        setLikedIds(current => wasLiked
            ? current.filter(item => item !== id)
            : [...current, id]
        )

        try {
            return !wasLiked
        } catch {
            // Rollback on error
            setLikedIds(current => wasLiked
                ? [...current, id]
                : current.filter(item => item !== id)
            )
            return wasLiked
        } finally {
            setPendingIds(current => current.filter(item => item !== id))
        }
    }, [likedIds, pendingIds, isLiked])

    const value = useMemo(() => ({
        likedIds,
        count: likedIds.length,
        isLiked,
        toggleLike
    }), [likedIds, count, isLiked, toggleLike])

    return (
        <LikesContext.Provider value={value}>
            {children}
        </LikesContext.Provider>
    )
}

export function useLikes() {
    const context = useContext(LikesContext)
    if (!context) {
        throw new Error('useLikes must be used within a LikesProvider')
    }
    return context
}
