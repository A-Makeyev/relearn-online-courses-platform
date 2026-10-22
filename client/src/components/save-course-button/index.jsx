import { useContext } from 'react'
import { Heart } from 'lucide-react'
import { WishlistContext } from '@/context/wishlist'
import { cn } from '@/lib/utils'


function SaveCourseButton({ courseId, className, light = false }) {
    const { isSaved, toggleSaved } = useContext(WishlistContext)
    const saved = isSaved(courseId)

    function handleClick(event) {
        event.preventDefault()
        event.stopPropagation()
        toggleSaved(courseId)
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-pressed={saved}
            aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm ring-1 ring-inset transition duration-200',
                saved
                    ? 'bg-rose-50 text-rose-600 ring-rose-200 hover:bg-rose-100'
                    : light
                        ? 'bg-white/15 text-white ring-white/25 backdrop-blur hover:bg-white/25'
                        : 'bg-white/95 text-slate-600 ring-slate-200 hover:text-rose-600',
                className
            )}
        >
            <Heart className={cn('h-4 w-4 transition-transform', saved && 'scale-110 fill-current')} />
        </button>
    )
}

export default SaveCourseButton
