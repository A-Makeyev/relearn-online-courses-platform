import { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '@/context/auth'
import { StudentContext } from '@/context/student'
import { getAcquiredCourses, getCourseProgress, getMyCertificates, issueCertificate } from '@/services'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { getCategoryMeta } from '@/lib/course-meta'
import { formatCompactNumber } from '@/utils'
import { cn } from '@/lib/utils'
import {
    ArrowRight,
    Award,
    BookOpen,
    CheckCircle2,
    Compass,
    PlayCircle,
    Star,
    TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'


const TABS = [
    { id: 'all', label: 'All courses' },
    { id: 'in-progress', label: 'In progress' },
    { id: 'completed', label: 'Completed' }
]

function MyLearningSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row">
                    <Skeleton className="aspect-video w-full rounded-lg sm:w-64" />
                    <div className="flex-1 space-y-3 py-1">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-9 w-36" />
                    </div>
                </div>
            ))}
        </div>
    )
}

function AcquiredCoursesPage() {
    const navigate = useNavigate()
    const { auth } = useContext(AuthContext)
    const { setAcquiredCourses, setAcquiredCoursesProgresses, loading, setLoading } = useContext(StudentContext)
    const [courses, setCourses] = useState([])
    const [progressByCourse, setProgressByCourse] = useState({})
    const [certificatesByCourse, setCertificatesByCourse] = useState({})
    const [issuingId, setIssuingId] = useState(null)
    const [activeTab, setActiveTab] = useState('all')
    const [loadError, setLoadError] = useState(false)

    useEffect(() => {
        let cancelled = false

        async function load() {
            setLoading(true)
            setLoadError(false)

            try {
                const [response, certificateResponse] = await Promise.all([
                    getAcquiredCourses(auth?.user?._id),
                    getMyCertificates().catch(() => null)
                ])
                const acquired = response?.data || []

                if (cancelled) return

                setCourses(acquired)
                setAcquiredCourses(acquired)
                setCertificatesByCourse(Object.fromEntries(
                    (certificateResponse?.data || []).map(certificate => [certificate.courseId, certificate.code])
                ))

                const progressEntries = await Promise.all(acquired.map(async (course) => {
                    const progressResponse = await getCourseProgress(auth?.user?._id, course.courseId).catch(() => null)

                    if (!progressResponse?.success || !progressResponse?.data?.courseAcquired) {
                        return [course.courseId, {
                            percentage: 0,
                            completedLectures: 0,
                            totalLectures: 0,
                            nextLecture: null,
                            completed: false
                        }]
                    }

                    const data = progressResponse.data
                    const lectures = data.courseDetails?.curriculum || []
                    const watchedIds = new Set(
                        (data.progress || []).filter(item => item.viewed).map(item => item.lectureId)
                    )
                    const completedLectures = watchedIds.size
                    const percentage = lectures.length
                        ? Math.round((completedLectures / lectures.length) * 100)
                        : 0
                    const nextLecture = lectures.find(lecture => !watchedIds.has(lecture._id))?.title || null

                    return [course.courseId, {
                        percentage,
                        completedLectures,
                        totalLectures: lectures.length,
                        nextLecture,
                        completed: Boolean(data.completed) || percentage === 100
                    }]
                }))

                if (cancelled) return

                const map = Object.fromEntries(progressEntries)
                setProgressByCourse(map)
                setAcquiredCoursesProgresses(progressEntries.map(([, value]) => value))
            } catch {
                if (!cancelled) {
                    setLoadError(true)
                    toast.error('Could not load your courses')
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        if (auth?.user?._id) load()

        return () => {
            cancelled = true
        }
    }, [auth?.user?._id, setAcquiredCourses, setAcquiredCoursesProgresses, setLoading])

    const stats = useMemo(() => {
        const completed = courses.filter(course => progressByCourse[course.courseId]?.completed).length
        const inProgress = courses.filter(course => {
            const progress = progressByCourse[course.courseId]
            return progress && !progress.completed && progress.completedLectures > 0
        }).length
        const lecturesCompleted = Object.values(progressByCourse)
            .reduce((sum, progress) => sum + (progress.completedLectures || 0), 0)

        return {
            total: courses.length,
            inProgress,
            completed,
            lecturesCompleted
        }
    }, [courses, progressByCourse])

    const filteredCourses = useMemo(() => {
        if (activeTab === 'completed') {
            return courses.filter(course => progressByCourse[course.courseId]?.completed)
        }
        if (activeTab === 'in-progress') {
            return courses.filter(course => {
                const progress = progressByCourse[course.courseId]
                return progress && !progress.completed && progress.completedLectures > 0
            })
        }
        return courses
    }, [courses, progressByCourse, activeTab])

    async function handleCertificate(courseId, code) {
        if (code) {
            navigate(`/certificate/${code}`)
            return
        }

        try {
            setIssuingId(courseId)
            const response = await issueCertificate(courseId)

            if (response?.success && response.data?.code) {
                setCertificatesByCourse(current => ({ ...current, [courseId]: response.data.code }))
                navigate(`/certificate/${response.data.code}`)
            } else {
                toast.error(response?.message || 'Could not issue your certificate')
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not issue your certificate')
        } finally {
            setIssuingId(null)
        }
    }

    const statCards = [
        { label: 'Enrolled courses', value: stats.total, icon: BookOpen, tone: 'bg-primary/10 text-primary' },
        { label: 'In progress', value: stats.inProgress, icon: TrendingUp, tone: 'bg-amber-100 text-amber-700' },
        { label: 'Completed', value: stats.completed, icon: Award, tone: 'bg-emerald-100 text-emerald-700' },
        { label: 'Lectures finished', value: stats.lecturesCompleted, icon: CheckCircle2, tone: 'bg-sky-100 text-sky-700' }
    ]

    return (
        <div className="bg-background">
            <section className="border-b bg-muted/30">
                <div className="container-page flex flex-col justify-between gap-5 py-9 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Your dashboard</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">My learning</h1>
                        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                            Pick up where you left off. Your progress is saved automatically across every course.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {stats.completed > 0 && (
                            <Button variant="outline" onClick={() => navigate('/certificates')}>
                                <Award className="h-4 w-4" />
                                My certificates
                            </Button>
                        )}
                        <Button onClick={() => navigate('/courses')}>
                            <Compass className="h-4 w-4" />
                            Browse courses
                        </Button>
                    </div>
                </div>
            </section>

            <div className="container-page py-8 lg:py-10">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {statCards.map(card => (
                        <div key={card.label} className="rounded-xl border bg-card p-4 shadow-sm">
                            <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', card.tone)}>
                                <card.icon className="h-4 w-4" />
                            </span>
                            <p className="mt-3 text-2xl font-bold leading-none">{formatCompactNumber(card.value)}</p>
                            <p className="mt-1.5 text-xs text-muted-foreground">{card.label}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex rounded-lg border bg-card p-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                    activeTab === tab.id
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {tab.label}
                                {tab.id !== 'all' && (
                                    <span className="ml-1.5 text-xs opacity-70">
                                        {tab.id === 'completed' ? stats.completed : stats.inProgress}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {courses.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                            {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
                        </p>
                    )}
                </div>

                <div className="mt-5">
                    {loading ? (
                        <MyLearningSkeleton />
                    ) : loadError ? (
                        <div className="rounded-xl border border-dashed bg-card px-6 py-14 text-center">
                            <p className="font-semibold">Something went wrong</p>
                            <p className="mt-1 text-sm text-muted-foreground">Refresh the page to try again.</p>
                        </div>
                    ) : filteredCourses.length > 0 ? (
                        <div className="space-y-4">
                            {filteredCourses.map(course => {
                                const progress = progressByCourse[course.courseId] || {}
                                const meta = getCategoryMeta(course.courseCategory)
                                const CategoryIcon = meta.icon
                                const isCompleted = Boolean(progress.completed)
                                const hasStarted = (progress.completedLectures || 0) > 0

                                return (
                                    <article
                                        key={course.courseId}
                                        className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition hover:border-primary/30 hover:shadow-md sm:flex-row"
                                    >
                                        <Link
                                            to={`/course-progress/${course.courseId}`}
                                            className="relative block aspect-video w-full shrink-0 overflow-hidden bg-muted sm:aspect-auto sm:w-64"
                                        >
                                            {course.courseImage ? (
                                                <img
                                                    src={course.courseImage}
                                                    alt={course.title}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full min-h-40 w-full items-center justify-center bg-brand-gradient text-white">
                                                    <CategoryIcon className="h-8 w-8" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-slate-950/20 opacity-0 transition group-hover:opacity-100" />
                                            <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-800 backdrop-blur">
                                                {meta.label}
                                            </span>
                                            {isCompleted && (
                                                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Completed
                                                </span>
                                            )}
                                        </Link>

                                        <div className="flex min-w-0 flex-1 flex-col p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <Link
                                                        to={`/course-progress/${course.courseId}`}
                                                        className="line-clamp-1 text-lg font-semibold transition-colors hover:text-primary"
                                                    >
                                                        {course.title}
                                                    </Link>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        By {course.instructorName}
                                                    </p>
                                                </div>
                                                {isCompleted && (
                                                    <span className="hidden shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 sm:flex">
                                                        <Award className="h-3.5 w-3.5" />
                                                        Finished
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-4">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-medium text-foreground/80">
                                                        {isCompleted
                                                            ? 'Course completed'
                                                            : hasStarted
                                                                ? `Next up: ${progress.nextLecture || 'Continue learning'}`
                                                                : 'Ready to start'
                                                        }
                                                    </span>
                                                    <span className="font-semibold">{progress.percentage || 0}%</span>
                                                </div>
                                                <Progress value={progress.percentage || 0} className="mt-2 h-2" />
                                                <p className="mt-1.5 text-xs text-muted-foreground">
                                                    {progress.completedLectures || 0} of {progress.totalLectures || 0} lectures completed
                                                </p>
                                            </div>

                                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                                <Button size="sm" onClick={() => navigate(`/course-progress/${course.courseId}`)}>
                                                    <PlayCircle className="h-4 w-4" />
                                                    {isCompleted ? 'Revisit course' : hasStarted ? 'Continue learning' : 'Start course'}
                                                </Button>

                                                {isCompleted && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleCertificate(course.courseId, certificatesByCourse[course.courseId])}
                                                            disabled={issuingId === course.courseId}
                                                        >
                                                            {issuingId === course.courseId
                                                                ? <LoadingSpinner className="h-4 w-4" />
                                                                : <Award className="h-4 w-4" />
                                                            }
                                                            {certificatesByCourse[course.courseId] ? 'Certificate' : 'Get certificate'}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => navigate(`/course/details/${course.courseId}`)}
                                                        >
                                                            <Star className="h-4 w-4" />
                                                            Leave a review
                                                        </Button>
                                                    </>
                                                )}

                                                <Link
                                                    to={`/courses?category=${course.courseCategory}`}
                                                    className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                                >
                                                    More in {meta.label}
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <BookOpen className="h-8 w-8" />
                            </span>
                            <h2 className="mt-5 text-xl font-bold">Your learning journey starts here</h2>
                            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                You are not enrolled in any courses yet. Browse the catalog and find a course that
                                matches your goals.
                            </p>
                            <Button className="mt-6" onClick={() => navigate('/courses')}>
                                <Compass className="h-4 w-4" />
                                Explore courses
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
                            <CheckCircle2 className="h-9 w-9 text-muted-foreground" />
                            <h2 className="mt-4 text-lg font-semibold">
                                {activeTab === 'completed' ? 'No completed courses yet' : 'No courses in progress'}
                            </h2>
                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                {activeTab === 'completed'
                                    ? 'Finish all the lectures in a course to see it here.'
                                    : 'Start a lecture and your progress will appear here automatically.'
                                }
                            </p>
                            <Button variant="outline" className="mt-5" onClick={() => setActiveTab('all')}>
                                View all courses
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AcquiredCoursesPage
