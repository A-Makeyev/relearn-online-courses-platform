import { Heart } from 'lucide-react'
import { useLikes } from '@/context/likes'

function LikeButton({ courseId, className = '', showCount = false, totalCount = 0 }) {
    const { isLiked, toggleLike, count } = useLikes()
    const liked = isLiked(courseId)
    const localCount = count

    async function handleClick() {
        await toggleLike(courseId)
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className={className}
            aria-label={liked ? 'Unlike this course' : 'Like this course'}
            title={liked ? 'Unlike' : 'Like'}
        >
            <Heart
                className={`h-5 w-5 transition-transform ${
                    liked
                        ? 'fill-rose-500 text-rose-500'
                        : 'text-muted-foreground hover:text-rose-500'
                }`}
            />
            {showCount && (
                <span className="ml-1 text-sm text-muted-foreground">
                    {totalCount > 0 ? totalCount : localCount}
                </span>
            )}
        </button>
    )
}

export default LikeButton
