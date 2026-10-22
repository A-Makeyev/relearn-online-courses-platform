import { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AuthContext } from '@/context/auth'
import {
    createPayment,
    getCoursePurchaseInfo,
    getCourseReviews,
    getStudentCourseDetails,
    getStudentCourses,
    submitCourseReview
} from '@/services'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import VideoPlayer from '@/components/video-player'
import CourseCard from '@/components/course-card'
import RatingStars from '@/components/rating-stars'
import SaveCourseButton from '@/components/save-course-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { getCategoryMeta, getLevelClass, getLectureLabel } from '@/lib/course-meta'
import { adjustPrice, formatCompactNumber, formatDate, getInitials, parseList, timeSince } from '@/utils'
import { cn } from '@/lib/utils'
import {
    ArrowLeft,
    BarChart3,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    Globe,
    GraduationCap,
    Languages,
    Lock,
    PlayCircle,
    Share2,
    ShoppingBag,
    Star,
    Users
} from 'lucide-react'
import { toast } from 'sonner'


function DetailSkeleton() {
    return (
        <div>
            <div className="h-72 bg-slate-900/90">
                <div className="container-page py-12">
                    <Skeleton className="h-4 w-40 bg-white/20" />
                    <Skeleton className="mt-6 h-10 w-2/3 bg-white/20" />
                    <Skeleton className="mt-3 h-5 w-1/2 bg-white/20" />
                    <Skeleton className="mt-6 h-4 w-1/3 bg-white/20" />
                </div>
            </div>
            <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-72 w-full rounded-xl" />
                </div>
                <Skeleton className="h-[420px] w-full rounded-xl" />
            </div>
        </div>
    )
}

function StudentCoursesDetailsPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { auth } = useContext(AuthContext)

    const [course, setCourse] = useState(null)
    const [reviewData, setReviewData] = useState(null)
    const [relatedCourses, setRelatedCourses] = useState([])
    const [instructorStats, setInstructorStats] = useState({ courses: 0, students: 0 })
    const [isAcquired, setIsAcquired] = useState(false)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [buying, setBuying] = useState(false)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [activePreview, setActivePreview] = useState(null)
    const [showAllCurriculum, setShowAllCurriculum] = useState(false)
    const [showAllReviews, setShowAllReviews] = useState(false)
    const [reviewRating, setReviewRating] = useState(0)
    const [previewMuted, setPreviewMuted] = useState(false)
    const [hoverRating, setHoverRating] = useState(0)
    const [reviewComment, setReviewComment] = useState('')
    const [submittingReview, setSubmittingReview] = useState(false)

    useEffect(() => {
        let cancelled = false

        async function loadCourse() {
            setLoading(true)
            setNotFound(false)

            try {
                const detailsResponse = await getStudentCourseDetails(id)

                if (!detailsResponse?.success || !detailsResponse?.data) {
                    if (!cancelled) setNotFound(true)
                    return
                }

                if (cancelled) return
                setCourse(detailsResponse.data)

                const [purchaseResponse, reviewsResponse, allCoursesResponse] = await Promise.all([
                    getCoursePurchaseInfo(id, auth?.user?._id).catch(() => null),
                    getCourseReviews(id).catch(() => null),
                    getStudentCourses().catch(() => null)
                ])

                if (cancelled) return

                setIsAcquired(Boolean(purchaseResponse?.courseAcquired))

                if (reviewsResponse?.success) {
                    setReviewData(reviewsResponse.data)
                    setCourse(previousCourse => previousCourse ? {
                        ...previousCourse,
                        averageRating: reviewsResponse.data.averageRating || 0,
                        reviewCount: reviewsResponse.data.reviewCount || 0
                    } : previousCourse)

                    const myReview = reviewsResponse.data?.reviews?.find(
                        review => review.userId === auth?.user?._id
                    )
                    if (myReview) {
                        setReviewRating(myReview.rating)
                        setReviewComment(myReview.comment || '')
                    }
                }

                if (allCoursesResponse?.success) {
                    const allCourses = allCoursesResponse.data || []
                    const sameInstructor = allCourses.filter(
                        item => item.instructorName === detailsResponse.data.instructorName
                    )
                    const otherCourses = allCourses.filter(
                        item => item.category === detailsResponse.data.category
                            && item._id !== detailsResponse.data._id
                    )

                    setInstructorStats({
                        courses: sameInstructor.length,
                        students: sameInstructor.reduce((sum, item) => sum + (item.students?.length || 0), 0)
                    })
                    setRelatedCourses(otherCourses.slice(0, 3))
                }
            } catch {
                if (!cancelled) {
                    setNotFound(true)
                    toast.error('Could not load this course')
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        if (id) loadCourse()

        return () => {
            cancelled = true
        }
    }, [id, auth?.user?._id])

    const previewLectures = useMemo(
        () => (course?.curriculum || []).filter(lecture => lecture.preview),
        [course]
    )
    const objectives = useMemo(() => parseList(course?.objectives), [course])
    const curriculum = course?.curriculum || []
    const visibleCurriculum = showAllCurriculum ? curriculum : curriculum.slice(0, 7)
    const reviews = reviewData?.reviews || []
    const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 4)
    const meta = getCategoryMeta(course?.category)
    const CategoryIcon = meta.icon
    const myReview = reviews.find(review => review.userId === auth?.user?._id)

    function openPreview(lecture) {
        setActivePreview(lecture)
        setPreviewOpen(true)
    }

    async function handleBuyCourse() {
        if (isAcquired) {
            navigate(`/course-progress/${id}`)
            return
        }

        try {
            setBuying(true)
            const response = await createPayment(id)

            if (response?.success && response.data?.free) {
                setIsAcquired(true)
                toast.success('You are enrolled. Happy learning!')
                navigate(`/course-progress/${id}`)
            } else if (response?.success) {
                sessionStorage.setItem('orderId', JSON.stringify(response.data.orderId))
                window.location.href = response.data.approvalUrl
            } else {
                toast.error(response?.message || 'Could not start checkout')
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not start checkout. Please try again.')
        } finally {
            setBuying(false)
        }
    }

    async function handleReviewSubmit(event) {
        event.preventDefault()

        if (!reviewRating) {
            toast.error('Choose a star rating first')
            return
        }

        try {
            setSubmittingReview(true)
            const response = await submitCourseReview(id, {
                rating: reviewRating,
                comment: reviewComment
            })

            if (response?.success) {
                toast.success(response.message || 'Review saved')
                const refreshed = await getCourseReviews(id)
                if (refreshed?.success) {
                    setReviewData(refreshed.data)
                    setCourse(prev => prev ? {
                        ...prev,
                        averageRating: refreshed.data.averageRating,
                        reviewCount: refreshed.data.reviewCount
                    } : prev)
                }
            } else {
                toast.error(response?.message || 'Could not save your review')
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not save your review')
        } finally {
            setSubmittingReview(false)
        }
    }

    function handleShare() {
        navigator.clipboard?.writeText(window.location.href)
            .then(() => toast.success('Course link copied'))
            .catch(() => toast.error('Could not copy the link'))
    }

    if (loading) return <DetailSkeleton />

    if (notFound || !course) {
        return (
            <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                </span>
                <h1 className="mt-5 text-2xl font-bold">Course not found</h1>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    This course may have been removed or is no longer published.
                </p>
                <Button className="mt-6" onClick={() => navigate('/courses')}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to the catalog
                </Button>
            </div>
        )
    }

    return (
        <div className="bg-background">
            {/* Hero */}
            <section className="relative overflow-hidden bg-brand-gradient text-white">
                <div className="absolute inset-0 bg-dot-grid opacity-20" />
                <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                <div className="container-page relative py-8 sm:py-12">
                    <nav className="flex flex-wrap items-center gap-2 text-xs text-white/65" aria-label="Breadcrumb">
                        <Link to="/home" className="transition hover:text-white">Home</Link>
                        <span>/</span>
                        <Link to={`/courses?category=${course.category}`} className="transition hover:text-white">
                            {meta.label}
                        </Link>
                        <span>/</span>
                        <span className="line-clamp-1 text-white/85">{course.title}</span>
                    </nav>

                    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
                        <div className="max-w-3xl">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                                    <CategoryIcon className="h-3.5 w-3.5" />
                                    {meta.label}
                                </span>
                                <span className={cn('rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset', getLevelClass(course.level))}>
                                    {course.level}
                                </span>
                                {isAcquired && (
                                    <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-inset ring-emerald-300/30">
                                        Enrolled
                                    </span>
                                )}
                            </div>

                            <h1 className="mt-4 text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
                                {course.title}
                            </h1>

                            {course.subtitle && (
                                <p className="mt-3 text-base leading-7 text-white/80 sm:text-lg">
                                    {course.subtitle}
                                </p>
                            )}

                            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
                                <RatingStars
                                    rating={course.averageRating}
                                    count={course.reviewCount}
                                    size="md"
                                    light
                                />
                                <span className="flex items-center gap-1.5">
                                    <Users className="h-4 w-4" />
                                    {formatCompactNumber(course.students?.length || 0)} students
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    Updated {formatDate(course.date) || 'recently'}
                                </span>
                                <span className="flex items-center gap-1.5 capitalize">
                                    <Globe className="h-4 w-4" />
                                    {course.language}
                                </span>
                            </div>

                            <div className="mt-5 flex items-center gap-3 text-sm">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xs font-bold">
                                    {getInitials(course.instructorName)}
                                </span>
                                <span>
                                    Created by <span className="font-semibold text-white">{course.instructorName}</span>
                                </span>
                            </div>
                        </div>

                        <div className="hidden lg:block" />
                    </div>
                </div>
            </section>

            <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_360px] lg:py-10">
                <main className="order-last min-w-0 space-y-8 lg:order-first">
                    {/* Objectives */}
                    {objectives.length > 0 && (
                        <section className="rounded-xl border bg-card p-6 shadow-sm">
                            <h2 className="text-xl font-bold">What you’ll learn</h2>
                            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                                {objectives.map((objective, index) => (
                                    <li key={index} className="flex items-start gap-2.5 text-sm leading-6 text-foreground/85">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                        <span>{objective}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Description */}
                    {course.description && (
                        <section className="rounded-xl border bg-card p-6 shadow-sm">
                            <h2 className="text-xl font-bold">About this course</h2>
                            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-foreground/80">
                                {course.description}
                            </p>
                        </section>
                    )}

                    {/* Curriculum */}
                    <section className="rounded-xl border bg-card shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-6">
                            <div>
                                <h2 className="text-xl font-bold">Course content</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {getLectureLabel(curriculum.length)}
                                    {previewLectures.length > 0 && ` · ${previewLectures.length} free previews`}
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleShare}>
                                <Share2 className="h-4 w-4" />
                                Share
                            </Button>
                        </div>

                        <div className="divide-y">
                            {visibleCurriculum.map((lecture, index) => (
                                <div
                                    key={lecture._id || index}
                                    className="flex items-center gap-3 px-6 py-3.5 transition hover:bg-muted/40"
                                >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                        {index + 1}
                                    </span>
                                    {lecture.preview ? (
                                        <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
                                    ) : (
                                        <Lock className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                                    )}
                                    <p className="min-w-0 flex-1 truncate text-sm font-medium">{lecture.title}</p>
                                    {lecture.preview && (
                                        <button
                                            type="button"
                                            onClick={() => openPreview(lecture)}
                                            className="shrink-0 text-xs font-semibold text-primary hover:underline"
                                        >
                                            Preview
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {curriculum.length > 7 && (
                            <div className="border-t p-4">
                                <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => setShowAllCurriculum(value => !value)}
                                >
                                    {showAllCurriculum ? (
                                        <>Show less <ChevronUp className="h-4 w-4" /></>
                                    ) : (
                                        <>Show all {curriculum.length} lectures <ChevronDown className="h-4 w-4" /></>
                                    )}
                                </Button>
                            </div>
                        )}
                    </section>

                    {/* Instructor */}
                    <section className="rounded-xl border bg-card p-6 shadow-sm">
                        <h2 className="text-xl font-bold">Your instructor</h2>
                        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start">
                            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-lg font-bold text-white">
                                {getInitials(course.instructorName)}
                            </span>
                            <div className="min-w-0">
                                <h3 className="text-lg font-semibold">{course.instructorName}</h3>
                                <p className="text-sm text-muted-foreground">Instructor on Easy Programming</p>
                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                        {instructorStats.courses} {instructorStats.courses === 1 ? 'course' : 'courses'}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Users className="h-4 w-4 text-primary" />
                                        {formatCompactNumber(instructorStats.students)} students
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <BarChart3 className="h-4 w-4 text-primary" />
                                        {course.level} level
                                    </span>
                                </div>
                                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                    {course.welcomeMessage || 'Practical, hands-on teaching designed to help you build real projects with confidence.'}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Reviews */}
                    <section className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-xl font-bold">Student reviews</h2>
                            <div className="flex items-center gap-2">
                                <RatingStars
                                    rating={reviewData?.averageRating || 0}
                                    count={reviewData?.reviewCount || 0}
                                    size="md"
                                />
                            </div>
                        </div>

                        {reviewData?.reviewCount > 0 ? (
                            <div className="mt-6 grid gap-8 sm:grid-cols-[200px_1fr]">
                                <div className="flex flex-col items-center justify-center rounded-xl bg-muted/50 p-5 text-center">
                                    <p className="text-5xl font-extrabold tracking-tight">
                                        {reviewData.averageRating.toFixed(1)}
                                    </p>
                                    <RatingStars rating={reviewData.averageRating} showValue={false} showCount={false} size="md" className="mt-2" />
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {formatCompactNumber(reviewData.reviewCount)} reviews
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    {[5, 4, 3, 2, 1].map(stars => {
                                        const total = reviewData.reviewCount || 1
                                        const value = reviewData.distribution?.[stars] || 0
                                        const percentage = Math.round((value / total) * 100)

                                        return (
                                            <div key={stars} className="flex items-center gap-3">
                                                <span className="flex w-10 items-center gap-1 text-xs font-medium text-muted-foreground">
                                                    {stars} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                </span>
                                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${percentage}%` }} />
                                                </div>
                                                <span className="w-8 text-right text-xs text-muted-foreground">{percentage}%</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-5 rounded-lg border border-dashed bg-muted/30 px-5 py-8 text-center">
                                <Star className="mx-auto h-8 w-8 text-muted-foreground/60" />
                                <p className="mt-3 text-sm font-medium">No reviews yet</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Be the first student to share feedback after enrolling.
                                </p>
                            </div>
                        )}

                        {isAcquired ? (
                            <form onSubmit={handleReviewSubmit} className="mt-6 rounded-xl border bg-muted/30 p-5">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            {myReview ? 'Update your review' : 'Rate this course'}
                                        </h3>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Your feedback helps other learners choose well.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                aria-label={`Rate ${star} out of 5`}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setReviewRating(star)}
                                                className="rounded p-0.5 transition hover:scale-110"
                                            >
                                                <Star
                                                    className={cn(
                                                        'h-6 w-6',
                                                        star <= (hoverRating || reviewRating)
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'fill-transparent text-neutral-300'
                                                    )}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <textarea
                                    value={reviewComment}
                                    onChange={(event) => setReviewComment(event.target.value)}
                                    placeholder="What did you like? What could be better? (optional)"
                                    rows={3}
                                    className="mt-4 w-full resize-none rounded-lg border bg-background px-3.5 py-3 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                                />

                                <div className="mt-3 flex justify-end">
                                    <Button type="submit" disabled={submittingReview || !reviewRating}>
                                        {submittingReview && <LoadingSpinner className="h-4 w-4" />}
                                        {myReview ? 'Update review' : 'Submit review'}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <p className="mt-6 rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                                Only enrolled students can leave a review.
                            </p>
                        )}

                        {reviews.length > 0 && (
                            <div className="mt-6 space-y-5">
                                {visibleReviews.map(review => (
                                    <article key={review._id} className="flex gap-3 border-t pt-5 first:border-t-0 first:pt-0">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                                            {getInitials(review.userName)}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-sm font-semibold">{review.userName}</h4>
                                                <span className="text-xs text-muted-foreground">· {timeSince(review.createdAt)}</span>
                                            </div>
                                            <RatingStars rating={review.rating} showValue={false} showCount={false} className="mt-1" />
                                            {review.comment && (
                                                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground/80">
                                                    {review.comment}
                                                </p>
                                            )}
                                        </div>
                                    </article>
                                ))}

                                {reviews.length > 4 && (
                                    <Button
                                        variant="ghost"
                                        className="w-full"
                                        onClick={() => setShowAllReviews(value => !value)}
                                    >
                                        {showAllReviews ? (
                                            <>Show fewer reviews <ChevronUp className="h-4 w-4" /></>
                                        ) : (
                                            <>Show all {reviews.length} reviews <ChevronDown className="h-4 w-4" /></>
                                        )}
                                    </Button>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Related */}
                    {relatedCourses.length > 0 && (
                        <section>
                            <div className="flex items-end justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold">Students also viewed</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">More courses in {meta.label}.</p>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link to={`/courses?category=${course.category}`}>View all</Link>
                                </Button>
                            </div>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {relatedCourses.map(item => (
                                    <CourseCard key={item._id} course={item} showCategory={false} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                {/* Purchase card */}
                <aside className="order-first lg:order-last">
                    <div className="overflow-hidden rounded-xl border bg-card shadow-xl lg:sticky lg:top-24">
                        <div className="relative aspect-video bg-muted">
                            {course.image_url ? (
                                <img src={course.image_url} alt={course.title} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-brand-gradient text-white">
                                    <CategoryIcon className="h-10 w-10" />
                                </div>
                            )}

                            {previewLectures.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => openPreview(previewLectures[0])}
                                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/40 text-white transition hover:bg-slate-950/50"
                                >
                                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg">
                                        <PlayCircle className="h-7 w-7" />
                                    </span>
                                    <span className="text-xs font-semibold">Preview this course</span>
                                </button>
                            )}

                            <SaveCourseButton
                                courseId={course._id}
                                className="absolute right-3 top-3 z-10"
                            />
                        </div>

                        <div className="p-5">
                            <div className="flex items-end justify-between gap-3">
                                <p className="text-3xl font-extrabold tracking-tight">
                                    {Number(course.price) === 0 ? 'Free' : adjustPrice(course.price)}
                                </p>
                                {isAcquired && (
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                        You’re enrolled
                                    </span>
                                )}
                            </div>

                            <Button
                                className="mt-4 w-full"
                                size="lg"
                                onClick={handleBuyCourse}
                                disabled={buying}
                            >
                                {buying ? (
                                    <LoadingSpinner className="h-4 w-4" />
                                ) : isAcquired ? (
                                    <PlayCircle className="h-4 w-4" />
                                ) : (
                                    <ShoppingBag className="h-4 w-4" />
                                )}
                                {isAcquired
                                    ? 'Go to course'
                                    : Number(course.price) === 0
                                        ? 'Enroll for free'
                                        : 'Enroll now'
                                }
                            </Button>

                            <p className="mt-3 text-center text-xs text-muted-foreground">
                                Lifetime access · Learn at your own pace
                            </p>

                            <div className="mt-5 border-t pt-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    This course includes
                                </p>
                                <ul className="mt-3 space-y-2.5 text-sm">
                                    <li className="flex items-center gap-2.5 text-foreground/80">
                                        <PlayCircle className="h-4 w-4 text-primary" />
                                        {getLectureLabel(curriculum.length)}
                                    </li>
                                    <li className="flex items-center gap-2.5 text-foreground/80">
                                        <Clock className="h-4 w-4 text-primary" />
                                        Learn at your own pace
                                    </li>
                                    <li className="flex items-center gap-2.5 text-foreground/80">
                                        <Languages className="h-4 w-4 text-primary" />
                                        Taught in <span className="capitalize">{course.language}</span>
                                    </li>
                                    <li className="flex items-center gap-2.5 text-foreground/80">
                                        <GraduationCap className="h-4 w-4 text-primary" />
                                        {course.level} level
                                    </li>
                                    {previewLectures.length > 0 && (
                                        <li className="flex items-center gap-2.5 text-foreground/80">
                                            <PlayCircle className="h-4 w-4 text-primary" />
                                            {previewLectures.length} free {previewLectures.length === 1 ? 'preview' : 'previews'}
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div className="mt-5 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleShare}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                >
                                    <Share2 className="h-3.5 w-3.5" />
                                    Share this course
                                </button>
                                <SaveCourseButton courseId={course._id} className="rounded-lg ring-0 shadow-none ring-offset-0" />
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Preview dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="border-none bg-slate-950 text-white sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-white">{activePreview?.title || 'Course preview'}</DialogTitle>
                        <DialogDescription className="text-white/60">
                            {course.title}
                        </DialogDescription>
                    </DialogHeader>

                    {activePreview && (
                        <div className="mt-2 aspect-video w-full overflow-hidden rounded-lg bg-black">
                            <VideoPlayer
                                url={activePreview.video_url}
                                videoId={activePreview.public_id}
                                width="100%"
                                height="100%"
                                defaultMuted={previewMuted}
                            />
                        </div>
                    )}

                    {previewLectures.length > 1 && (
                        <div className="mt-3 space-y-1">
                            {previewLectures.map(lecture => (
                                <button
                                    key={lecture._id}
                                    type="button"
                                    onClick={() => setActivePreview(lecture)}
                                    className={cn(
                                        'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition',
                                        lecture._id === activePreview?._id
                                            ? 'bg-white/10 font-semibold text-white'
                                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                                    )}
                                >
                                    <PlayCircle className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{lecture.title}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                        <p className="text-xs text-white/60">
                            {previewMuted ? 'Sound off' : 'Sound on'}
                        </p>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setPreviewMuted(!previewMuted)}
                            className="text-white/70 hover:text-white"
                        >
                            {previewMuted ? 'Unmute' : 'Mute'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default StudentCoursesDetailsPage
