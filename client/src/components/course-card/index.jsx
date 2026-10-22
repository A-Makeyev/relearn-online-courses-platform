import { Link } from 'react-router-dom'
import { Play, Users } from 'lucide-react'
import RatingStars from '@/components/rating-stars'
import SaveCourseButton from '@/components/save-course-button'
import { getCategoryMeta, getLevelClass, getLectureLabel } from '@/lib/course-meta'
import { adjustPrice, formatCompactNumber } from '@/utils'
import { cn } from '@/lib/utils'


function CourseCard({ course, className, showCategory = true }) {
    if (!course) return null

    const {
        _id,
        title,
        instructorName,
        image_url,
        category,
        level,
        price,
        curriculum = [],
        students = [],
        averageRating = 0,
        reviewCount = 0
    } = course

    const meta = getCategoryMeta(category)
    const CategoryIcon = meta.icon
    const isBestseller = students.length >= 5

    return (
        <div
            className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300',
                'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl',
                className
            )}
        >
            <SaveCourseButton
                courseId={_id}
                className="absolute right-3 top-3 z-20"
            />

            <Link to={`/course/details/${_id}`} className="flex min-h-0 flex-1 flex-col">
                <div className="relative aspect-video overflow-hidden bg-muted">
                    {image_url ? (
                        <img
                            src={image_url}
                            alt={title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-brand-gradient text-white">
                            <CategoryIcon className="h-10 w-10 opacity-80" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <span className={cn('absolute left-3 top-3 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset', getLevelClass(level))}>
                        {level || 'All levels'}
                    </span>

                    {isBestseller && (
                        <span className="absolute bottom-3 left-3 rounded-md bg-amber-300 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-950">
                            Bestseller
                        </span>
                    )}

                    <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg">
                            <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
                        </span>
                    </span>
                </div>

                <div className="flex flex-1 flex-col p-4">
                    {showCategory && (
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
                            <CategoryIcon className="h-3.5 w-3.5" />
                            <span>{meta.label}</span>
                        </div>
                    )}

                    <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {title}
                    </h3>

                    <p className="mt-1.5 truncate text-sm text-muted-foreground">
                        By <span className="font-medium text-foreground/80">{instructorName}</span>
                    </p>

                    <div className="mt-2">
                        <RatingStars rating={averageRating} count={reviewCount} />
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{getLectureLabel(curriculum.length)}</span>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                        <span className="capitalize">{level}</span>
                        {students.length > 0 && (
                            <>
                                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                                <span className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    {formatCompactNumber(students.length)}
                                </span>
                            </>
                        )}
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-4">
                        <span className="text-lg font-bold tracking-tight">
                            {Number(price) === 0 ? 'Free' : adjustPrice(price)}
                        </span>
                        <span className="rounded-md bg-secondary px-2 py-1 text-[11px] font-semibold text-secondary-foreground">
                            {meta.label}
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default CourseCard
