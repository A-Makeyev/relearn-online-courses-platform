import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '@/context/auth'
import {
    addToWishlist,
    getWishlistIds,
    removeFromWishlist
} from '@/services'
import { toast } from 'sonner'


export const WishlistContext = createContext({
    ids: [],
    count: 0,
    loading: false,
    isSaved: () => false,
    toggleSaved: async () => false
})

export default function WishlistProvider({ children }) {
    const { auth } = useContext(AuthContext)
    const userId = auth?.user?._id
    const [ids, setIds] = useState([])
    const [pendingIds, setPendingIds] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let cancelled = false

        async function load() {
            if (!userId) {
                setIds([])
                return
            }

            setLoading(true)

            try {
                const response = await getWishlistIds()
                if (!cancelled && response?.success) {
                    setIds(response.data || [])
                }
            } catch {
                // A missing wishlist is not fatal; the heart simply starts empty.
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()

        return () => {
            cancelled = true
        }
    }, [userId])

    const isSaved = useCallback((courseId) => ids.includes(String(courseId)), [ids])

    const toggleSaved = useCallback(async (courseId) => {
        const id = String(courseId)
        if (!id || pendingIds.includes(id)) return isSaved(id)

        const wasSaved = ids.includes(id)
        setPendingIds(current => [...current, id])
        setIds(current => wasSaved ? current.filter(item => item !== id) : [...current, id])

        try {
            const response = wasSaved
                ? await removeFromWishlist(id)
                : await addToWishlist(id)

            if (!response?.success) {
                throw new Error(response?.message || 'Could not update your wishlist')
            }

            if (!wasSaved) toast.success('Saved to your wishlist')
            return !wasSaved
        } catch (err) {
            // Roll back the optimistic update.
            setIds(current => wasSaved ? [...current, id] : current.filter(item => item !== id))
            toast.error(err?.response?.data?.message || 'Could not update your wishlist')
            return wasSaved
        } finally {
            setPendingIds(current => current.filter(item => item !== id))
        }
    }, [ids, pendingIds, isSaved])

    const value = useMemo(() => ({
        ids,
        count: ids.length,
        loading,
        isSaved,
        toggleSaved
    }), [ids, loading, isSaved, toggleSaved])

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    )
}
