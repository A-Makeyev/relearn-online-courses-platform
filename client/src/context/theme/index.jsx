import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(undefined)

export default function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('theme')
            if (stored === 'light' || stored === 'dark') {
                return stored
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        return 'light'
    })

    useEffect(() => {
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    const setTheme = (newTheme) => {
        setThemeState(newTheme)
    }

    const toggleTheme = () => {
        setThemeState(prev => prev === 'light' ? 'dark' : 'light')
    }

    const value = useMemo(() => ({
        theme,
        setTheme,
        toggleTheme
    }), [theme])

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
