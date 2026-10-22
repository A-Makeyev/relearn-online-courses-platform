import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCompactNumber } from '@/utils'


const sizeMap = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
}

function RatingStars({
    rating = 0,
    count,
    showValue = true,
    showCount = true,
    size = 'sm',
    light = false,
    className
}) {
    const value = Math.max(0, Math.min(5, Number(rating) || 0))
    const starSize = sizeMap[size] || sizeMap.sm

    return (
        <div className={cn('flex items-center gap-1.5', className)}>
            <div
                className="flex items-center gap-0.5"
                role="img"
                aria-label={`Rated ${value.toFixed(1)} out of 5`}
            >
                {[1, 2, 3, 4, 5].map(star => {
                    const fill = Math.max(0, Math.min(1, value - (star - 1)))

                    return (                            <span key={star} className="relative inline-flex">
                            <Star className={cn(starSize, light ? 'text-white/25' : 'text-neutral-200')} fill="currentColor" strokeWidth={0} />
                            <span
                                className="absolute inset-0 overflow-hidden"
                                style={{ width: `${fill * 100}%` }}
                            >
                                <Star className={cn(starSize, 'text-amber-400')} fill="currentColor" strokeWidth={0} />
                            </span>
                        </span>
                    )
                })}
            </div>
            {showValue && value > 0 && (
                <span className={cn('text-sm font-semibold', light ? 'text-white' : 'text-foreground')}>
                    {value.toFixed(1)}
                </span>
            )}
            {showCount && count > 0 && (
                <span className={cn('text-xs', light ? 'text-white/70' : 'text-muted-foreground')}>
                    ({formatCompactNumber(count)})
                </span>
            )}
            {showValue && value === 0 && (
                <span className={cn('text-xs font-medium', light ? 'text-white/70' : 'text-muted-foreground')}>
                    New
                </span>
            )}
        </div>
    )
}

export default RatingStars
