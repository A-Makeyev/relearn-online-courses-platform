import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/theme'

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="hidden sm:inline-flex"
        >
            {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-yellow-500" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </Button>
    )
}

export default ThemeToggle
