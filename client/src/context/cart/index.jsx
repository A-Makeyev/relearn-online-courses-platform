import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export const CartContext = createContext({
    items: [],
    count: 0,
    isInCart: () => false,
    addToCart: async () => false,
    removeFromCart: async () => false,
    clearCart: async () => false
})

export default function CartProvider({ children }) {
    const [items, setItems] = useState([])
    const [pendingActions, setPendingActions] = useState([])

    useEffect(() => {
        // Load cart from localStorage
        try {
            const stored = localStorage.getItem('cart')
            if (stored) {
                setItems(JSON.parse(stored))
            }
        } catch {
            setItems([])
        }
    }, [])

    // Persist cart changes to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(items))
        } catch { /* ignore */ }
    }, [items])

    const isInCart = useCallback((courseId) => {
        return items.includes(String(courseId))
    }, [items])

    const addToCart = useCallback(async (courseId) => {
        const id = String(courseId)
        if (!id || pendingActions.includes(id)) return isInCart(id)

        const wasInCart = items.includes(id)
        setPendingActions(current => [...current, id])

        if (!wasInCart) {
            setItems(current => [...current, id])
        }

        try {
            // Optimistic - cart is client-side only
            return !wasInCart
        } catch {
            // Rollback on error
            setItems(current => current.filter(item => item !== id))
            return wasInCart
        } finally {
            setPendingActions(current => current.filter(item => item !== id))
        }
    }, [items, pendingActions, isInCart])

    const removeFromCart = useCallback(async (courseId) => {
        const id = String(courseId)
        if (!id || pendingActions.includes(id)) return true

        setPendingActions(current => [...current, id])

        try {
            setItems(current => current.filter(item => item !== id))
            return true
        } catch {
            return false
        } finally {
            setPendingActions(current => current.filter(item => item !== id))
        }
    }, [pendingActions])

    const clearCart = useCallback(async () => {
        try {
            setItems([])
            return true
        } catch {
            return false
        }
    }, [])

    const value = useMemo(() => ({
        items,
        count: items.length,
        isInCart,
        addToCart,
        removeFromCart,
        clearCart
    }), [items, count, isInCart, addToCart, removeFromCart, clearCart])

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
