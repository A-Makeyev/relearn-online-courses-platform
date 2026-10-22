import { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '@/context/auth'
import { StudentContext } from '@/context/student'
import { courseCategories } from '@/config'
import { getStudentCourses } from '@/services'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import CourseCard from '@/components/course-card'
import RatingStars from '@/components/rating-stars'
import { getCategoryMeta } from '@/lib/course-meta'
import { formatCompactNumber } from '@/utils'
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Compass,
    GraduationCap,
    Layers,
    PlayCircle,
    Rocket,
    Search,
    Sparkles,
    Star,
    Users
} from 'lucide-react'
import banner from '/src/assets/banner.jpg'


function StudentHomePage() {
    const navigate = useNavigate()
    const { auth } = useContext(AuthContext)
    const { studentCourses, setStudentCourses, loading, setLoading } = useContext(StudentContext)
    const [search, setSearch] = useState('')

    useEffect(() => {
        let cancelled = false

        async function getCourses() {
            setLoading(true)

            try {
                const response = await getStudentCourses()

                if (!cancelled && response?.success) {
                    setStudentCourses(response.data || [])
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        getCourses()

        return () => {
            cancelled = true
        }
    }, [setLoading, setStudentCourses])

    const courses = Array.isArray(studentCourses) ? studentCourses : []
    const totalLectures = courses.reduce((sum, course) => sum + (course.curriculum?.length || 0), 0)
    const totalStudents = courses.reduce((sum, course) => sum + (course.students?.length || 0), 0)
    const totalInstructors = new Set(courses.map(course => course.instructorName).filter(Boolean)).size

    const categoryCounts = courseCategories.map(category => ({
        ...category,
        count: courses.filter(course => course.category === category.id).length
    })).filter(category => category.count > 0)

    const featuredCourses = [...courses]
        .sort((a, b) => {
            const ratingDiff = (b.averageRating || 0) - (a.averageRating || 0)
            if (ratingDiff !== 0) return ratingDiff
            return new Date(b.date || 0) - new Date(a.date || 0)
        })
        .slice(0, 8)

    const heroCourse = featuredCourses[0]
    const heroCourseMeta = getCategoryMeta(heroCourse?.category)

    function handleSearch(event) {
        event.preventDefault()
        const term = search.trim()
        navigate(term ? `/courses?search=${encodeURIComponent(term)}` : '/courses')
    }

    const stats = [
        { label: 'Courses', value: courses.length, icon: BookOpen },
        { label: 'Lectures', value: totalLectures, icon: PlayCircle },
        { label: 'Instructors', value: totalInstructors, icon: GraduationCap },
        { label: 'Categories', value: categoryCounts.length, icon: Layers }
    ]

    return (
        <div className="bg-background">
            {/* Hero */}
            <section className="relative overflow-hidden border-b">
                <div className="absolute inset-0 bg-dot-grid opacity-60" />
                <div className="absolute -left-40 top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-fuchsia-400/15 blur-3xl" />

                <div className="container-page relative grid gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
                    <div className="animate-fade-up">
                        <span className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur">
                            <Sparkles className="h-3.5 w-3.5" />
                            Learn the skills that ship real products
                        </span>

                        <h1 className="mt-5 max-w-2xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                            Build a career in tech,{' '}
                            <span className="text-gradient-brand">one project at a time.</span>
                        </h1>

                        <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                            Practical courses in web development, data, AI and design — taught by people who build
                            software for a living. Learn at your own pace and create work you are proud of.
                        </p>

                        <form onSubmit={handleSearch} className="mt-8 max-w-xl" role="search">
                            <div className="flex items-center gap-2 rounded-2xl border bg-background p-2 shadow-soft focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                                <Search className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="What do you want to learn today?"
                                    aria-label="Search courses"
                                    className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground sm:text-base"
                                />
                                <Button type="submit" size="lg" className="shrink-0 rounded-xl">
                                    Find courses
                                </Button>
                            </div>
                        </form>

                        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Popular:</span>
                            {['web-development', 'artificial-intelligence', 'data-science', 'design'].map(id => {
                                const category = courseCategories.find(item => item.id === id)
                                return (
                                    <Link
                                        key={id}
                                        to={`/courses?category=${id}`}
                                        className="rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-foreground/80 transition hover:border-primary/40 hover:text-primary"
                                    >
                                        {category?.label || id}
                                    </Link>
                                )
                            })}
                        </div>

                        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            {['Lifetime access', 'Learn at your own pace', 'Project-based lessons'].map(item => (
                                <span key={item} className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Hero visual built from real course data */}
                    <div className="relative mx-auto w-full max-w-md animate-fade-up lg:max-w-none" style={{ animationDelay: '120ms' }}>
                        <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-primary/20 via-fuchsia-400/10 to-transparent blur-2xl" />

                        <div className="relative overflow-hidden rounded-3xl border bg-card shadow-2xl">
                            <div className="relative aspect-[4/3] bg-muted">
                                <img
                                    src={heroCourse?.image_url || banner}
                                    alt={heroCourse?.title || 'Students learning to code'}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                                <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900 backdrop-blur">
                                    <heroCourseMeta.icon className="h-3.5 w-3.5 text-primary" />
                                    {heroCourseMeta.label}
                                </div>

                                <div className="absolute inset-x-5 bottom-5 text-white">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                                        Featured course
                                    </p>
                                    <h2 className="mt-1 line-clamp-2 text-xl font-bold leading-snug sm:text-2xl">
                                        {heroCourse?.title || 'Start with the fundamentals'}
                                    </h2>
                                    <p className="mt-1 text-sm text-white/75">
                                        {heroCourse?.instructorName || 'Expert instructors'}
                                    </p>
                                    <div className="mt-3 flex items-center gap-3">
                                        <RatingStars
                                            rating={heroCourse?.averageRating}
                                            count={heroCourse?.reviewCount}
                                            size="md"
                                        />
                                        <span className="text-xs text-white/70">
                                            {heroCourse?.curriculum?.length || 0} lectures
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 p-5">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Your next step
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">
                                        {auth?.user?.username ? `Welcome back, ${auth.user.username}` : 'Start learning today'}
                                    </p>
                                </div>
                                <div className="flex -space-x-2">
                                    {courses.slice(0, 3).map((course, index) => (
                                        <span
                                            key={course._id}
                                            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-secondary text-[10px] font-bold text-secondary-foreground"
                                            title={course.title}
                                        >
                                            {course.title?.slice(0, 2).toUpperCase() || index + 1}
                                        </span>
                                    ))}
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-bold text-primary-foreground">
                                        {courses.length > 3 ? `+${courses.length - 3}` : '+'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border bg-card p-4 shadow-xl sm:block">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                    <Star className="h-5 w-5" fill="currentColor" />
                                </span>
                                <div>
                                    <p className="text-lg font-bold leading-none">
                                        {courses.filter(course => course.averageRating > 0).length > 0
                                            ? (
                                                courses.reduce((sum, course) => sum + (course.averageRating || 0), 0)
                                                / Math.max(1, courses.filter(course => course.averageRating > 0).length)
                                            ).toFixed(1)
                                            : '—'
                                        }
                                    </p>
                                    <p className="mt-1 text-[11px] font-medium text-muted-foreground">Learner rating</p>
                                </div>
                            </div>
                        </div>

                        {totalStudents > 0 && (
                            <div className="absolute -right-3 top-10 hidden rounded-2xl border bg-card px-4 py-3 shadow-xl lg:block">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Learners</p>
                                <p className="mt-0.5 flex items-center gap-1.5 text-lg font-bold">
                                    <Users className="h-4 w-4 text-primary" />
                                    {formatCompactNumber(totalStudents)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative border-t bg-muted/40">
                    <div className="container-page grid grid-cols-2 divide-x divide-border sm:grid-cols-4">
                        {stats.map(stat => (
                            <div key={stat.label} className="flex items-center justify-center gap-3 px-4 py-5">
                                <stat.icon className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-lg font-bold leading-none">{formatCompactNumber(stat.value)}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="container-page py-14 sm:py-16">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Browse by topic</p>
                        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Find your next skill</h2>
                        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                            Start with a category, then follow the path that fits your goals.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/courses')}>
                        View all courses
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categoryCounts.map(category => {
                        const meta = getCategoryMeta(category.id)
                        const Icon = meta.icon

                        return (
                            <Link
                                key={category.id}
                                to={`/courses?category=${category.id}`}
                                className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                            >
                                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
                                    <Icon className="h-5 w-5" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold">{meta.label}</span>
                                    <span className="mt-0.5 block text-xs text-muted-foreground">
                                        {category.count} {category.count === 1 ? 'course' : 'courses'}
                                    </span>
                                </span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                            </Link>
                        )
                    })}
                </div>
            </section>

            {/* Featured courses */}
            <section className="border-y bg-muted/30 py-14 sm:py-16">
                <div className="container-page">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Handpicked for you</p>
                            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Courses worth starting today</h2>
                            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                                Top-rated and newest courses from our instructor community.
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => navigate('/courses')}>
                            Explore the catalog
                            <Compass className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {loading
                            ? Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="overflow-hidden rounded-xl border bg-card">
                                    <Skeleton className="aspect-video w-full rounded-none" />
                                    <div className="space-y-3 p-4">
                                        <Skeleton className="h-3 w-1/3" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                        <Skeleton className="h-3 w-1/2" />
                                        <Skeleton className="h-5 w-1/3" />
                                    </div>
                                </div>
                            ))
                            : featuredCourses.map(course => (
                                <CourseCard key={course._id} course={course} />
                            ))
                        }
                    </div>

                    {!loading && featuredCourses.length === 0 && (
                        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed bg-background px-6 py-14 text-center">
                            <BookOpen className="h-10 w-10 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No courses published yet</h3>
                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                New courses are on the way. Sign in as an instructor to publish the first one.
                            </p>
                            <Button className="mt-5" onClick={() => navigate('/instructor')}>
                                Go to instructor dashboard
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Value props */}
            <section className="container-page py-14 sm:py-16">
                <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Why Easy Programming</p>
                        <h2 className="mt-2 text-balance text-2xl font-bold tracking-tight sm:text-3xl">
                            Learning that respects your time and your ambition.
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            No fluff, no endless theory. Each course is structured around the skills you need to
                            build something real, with lessons you can finish in a sitting.
                        </p>
                        <Button className="mt-6" onClick={() => navigate('/courses')}>
                            Find a course
                            <Rocket className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {[
                            {
                                icon: Layers,
                                title: 'Structured curriculum',
                                copy: 'Clear lecture-by-lecture paths that build on each other instead of jumping around.'
                            },
                            {
                                icon: PlayCircle,
                                title: 'Learn by doing',
                                copy: 'Follow along with practical examples and finish with something you can show.'
                            },
                            {
                                icon: Compass,
                                title: 'Self-paced by design',
                                copy: 'Pick up where you left off. Your progress and last lecture are saved automatically.'
                            },
                            {
                                icon: GraduationCap,
                                title: 'Practitioner instructors',
                                copy: 'Courses are created by people who work with these tools every day.'
                            }
                        ].map(item => (
                            <div key={item.title} className="rounded-xl border bg-card p-5 shadow-sm">
                                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                                    <item.icon className="h-5 w-5" />
                                </span>
                                <h3 className="mt-4 text-sm font-semibold">{item.title}</h3>
                                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="container-page pb-16">
                <div className="relative overflow-hidden rounded-2xl bg-brand-gradient px-6 py-12 text-white sm:px-12">
                    <div className="absolute inset-0 bg-dot-grid opacity-20" />
                    <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                        <div className="max-w-2xl">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Keep going</p>
                            <h2 className="mt-2 text-balance text-2xl font-bold sm:text-3xl">
                                Your next skill is one lecture away.
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-white/75">
                                Browse the full catalog or jump back into a course you already own.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="secondary"
                                size="lg"
                                className="bg-white text-slate-900 hover:bg-white/90"
                                onClick={() => navigate('/courses')}
                            >
                                Explore courses
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                onClick={() => navigate('/acquired-courses')}
                            >
                                My learning
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default StudentHomePage
