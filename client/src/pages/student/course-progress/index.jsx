import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCourseProgress, issueCertificate, lastViewedLecture, resetCourseProgress, viewLecture } from '@/services'
import { AuthContext } from '@/context/auth'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import VideoPlayer from '@/components/video-player'
import { getCategoryMeta } from '@/lib/course-meta'
import { getInitials, parseList } from '@/utils'
import { cn } from '@/lib/utils'
import ConfettiExplosion from 'react-confetti-explosion'
import {
    ArrowLeft,
    Award,
    BookOpen,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    Layers,
    Lock,
    PanelRightClose,
    PanelRightOpen,
    PartyPopper,
    PlayCircle,
    RotateCcw,
    Star,
    TvMinimalPlay
} from 'lucide-react'
import { toast } from 'sonner'


function CourseProgressPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { auth } = useContext(AuthContext)

    const [course, setCourse] = useState(null)
    const [progress, setProgress] = useState([])
    const [currentLecture, setCurrentLecture] = useState(null)
    const [loading, setLoading] = useState(true)
    const [locked, setLocked] = useState(false)
    const [showCompleted, setShowCompleted] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024)
    const [refreshKey, setRefreshKey] = useState(0)
    const [activeTab, setActiveTab] = useState('content')
    const [marking, setMarking] = useState(false)
    const [certificateCode, setCertificateCode] = useState(null)
    const [issuingCertificate, setIssuingCertificate] = useState(false)
    const watchedRef = useRef(new Set())

    useEffect(() => {
        watchedRef.current = new Set(
            progress.filter(item => item.viewed).map(item => item.lectureId)
        )
    }, [progress])

    useEffect(() => {
        let cancelled = false

        async function load() {
            setLoading(true)

            try {
                const response = await getCourseProgress(auth?.user?._id, id)

                if (cancelled) return

                if (!response?.success || !response?.data?.courseAcquired) {
                    setLocked(true)
                    return
                }

                const data = response.data
                const courseDetails = data.courseDetails
                const lectureProgress = data.progress || []

                setCourse(courseDetails)
                setProgress(lectureProgress)

                const watched = new Set(
                    lectureProgress.filter(item => item.viewed).map(item => item.lectureId)
                )
                const lastViewed = courseDetails.curriculum?.find(
                    lecture => lecture._id === data.lastViewedLecture
                )
                const nextUnwatched = courseDetails.curriculum?.find(
                    lecture => !watched.has(lecture._id)
                )

                setCurrentLecture(lastViewed || nextUnwatched || courseDetails.curriculum?.[0] || null)
                setShowCompleted(Boolean(data.completed))
                setCertificateCode(data.certificateCode || null)
            } catch {
                toast.error('Could not load this course')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        if (id && auth?.user?._id) load()

        return () => {
            cancelled = true
        }
    }, [id, auth?.user?._id])

    const curriculum = course?.curriculum || []
    const watchedCount = progress.filter(item => item.viewed).length
    const totalLectures = curriculum.length
    const progressPercentage = totalLectures ? Math.round((watchedCount / totalLectures) * 100) : 0
    const currentIndex = curriculum.findIndex(lecture => lecture._id === currentLecture?._id)
    const previousLecture = currentIndex > 0 ? curriculum[currentIndex - 1] : null
    const nextLecture = currentIndex >= 0 && currentIndex < curriculum.length - 1
        ? curriculum[currentIndex + 1]
        : null
    const isCurrentWatched = Boolean(
        currentLecture && progress.some(item => item.lectureId === currentLecture._id && item.viewed)
    )
    const objectives = useMemo(() => parseList(course?.objectives), [course])
    const meta = getCategoryMeta(course?.category)
    const CategoryIcon = meta.icon

    function selectLecture(lecture) {
        if (!lecture) return

        setCurrentLecture(lecture)
        setRefreshKey(key => key + 1)
        if (window.innerWidth < 1024) setSidebarOpen(false)
        lastViewedLecture(auth?.user?._id, id, lecture._id).catch(() => null)
    }

    async function markLectureComplete(lecture) {
        if (!lecture || marking || watchedRef.current.has(lecture._id)) return

        try {
            setMarking(true)
            const response = await viewLecture(auth?.user?._id, id, lecture._id)

            if (response?.success) {
                const updatedProgress = response.data?.lectureProgress || []
                setProgress(updatedProgress)

                if (response.data?.completed) {
                    setShowCompleted(true)
                    setCertificateCode(response.data.certificateCode || null)
                }
            }
        } catch {
            toast.error('Could not save your progress')
        } finally {
            setMarking(false)
        }
    }

    async function handleViewCertificate() {
        if (certificateCode) {
            navigate(`/certificate/${certificateCode}`)
            return
        }

        try {
            setIssuingCertificate(true)
            const response = await issueCertificate(id)

            if (response?.success && response.data?.code) {
                setCertificateCode(response.data.code)
                navigate(`/certificate/${response.data.code}`)
            } else {
                toast.error(response?.message || 'Could not issue your certificate')
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not issue your certificate')
        } finally {
            setIssuingCertificate(false)
        }
    }

    async function handleResetProgress() {
        try {
            const response = await resetCourseProgress(auth?.user?._id, id)

            if (response?.success) {
                setProgress([])
                setShowCompleted(false)
                setCurrentLecture(curriculum[0] || null)
                setRefreshKey(key => key + 1)
                toast.success('Progress reset. Ready when you are!')
            }
        } catch {
            toast.error('Could not reset your progress')
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <LoadingSpinner className="h-10 w-10 text-white" />
            </div>
        )
    }

    if (locked || !course) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
                <div className="max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-white">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                        <Lock className="h-7 w-7" />
                    </span>
                    <h1 className="mt-5 text-xl font-bold">This course is locked</h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Enroll in this course to unlock every lecture and track your progress.
                    </p>
                    <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                        <Button onClick={() => navigate(`/course/details/${id}`)}>
                            View course
                        </Button>
                        <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => navigate('/acquired-courses')}>
                            My learning
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
            {/* Top bar */}
            <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-slate-300 hover:bg-white/10 hover:text-white"
                        onClick={() => navigate('/acquired-courses')}
                        aria-label="Back to my learning"
                    >
                        <ArrowLeft />
                    </Button>

                    <div className="hidden min-w-0 items-center gap-2 sm:flex">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient">
                            <GraduationCap className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{course.title}</p>
                            <p className="truncate text-[11px] text-slate-400">{course.instructorName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:hidden">
                        <p className="truncate text-sm font-semibold">{course.title}</p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <div className="hidden items-center gap-2 sm:flex">
                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/15">
                            <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${progressPercentage}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-300">{progressPercentage}%</span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-300 hover:bg-white/10 hover:text-white"
                        onClick={() => setSidebarOpen(open => !open)}
                        aria-label={sidebarOpen ? 'Hide course content' : 'Show course content'}
                    >
                        {sidebarOpen ? <PanelRightClose /> : <PanelRightOpen />}
                    </Button>
                </div>
            </header>

            <div className="relative flex flex-1 overflow-hidden">
                {sidebarOpen && (
                    <button
                        type="button"
                        aria-label="Close course content"
                        onClick={() => setSidebarOpen(false)}
                        className="absolute inset-0 z-30 bg-slate-950/60 lg:hidden"
                    />
                )}

                {/* Main */}
                <div className="flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-5xl p-3 sm:p-5 lg:p-8">
                        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
                            <div className="aspect-video max-h-[62vh] w-full">
                                {currentLecture ? (
                                    <VideoPlayer
                                        key={refreshKey}
                                        url={currentLecture.video_url}
                                        videoId={currentLecture.public_id}
                                        onProgressUpdate={(lecture) => {
                                            if (lecture?.progressValue === 1) markLectureComplete(currentLecture)
                                        }}
                                        progressData={currentLecture}
                                        width="100%"
                                        height="100%"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-slate-500">
                                        <p>This course has no lectures yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    <CategoryIcon className="h-3.5 w-3.5" />
                                    <span>{meta.label}</span>
                                    <span>·</span>
                                    <span>Lecture {currentIndex + 1} of {totalLectures}</span>
                                    {isCurrentWatched && (
                                        <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-emerald-300">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <h1 className="mt-2 text-xl font-bold sm:text-2xl">
                                    {currentLecture?.title || 'Course content'}
                                </h1>
                            </div>

                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-white/15 bg-transparent text-slate-200 hover:bg-white/10 hover:text-white"
                                    onClick={() => selectLecture(previousLecture)}
                                    disabled={!previousLecture}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>

                                <Button
                                    size="sm"
                                    variant={isCurrentWatched ? 'secondary' : 'default'}
                                    className={cn(
                                        isCurrentWatched
                                            ? 'bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/20'
                                            : 'bg-emerald-500 text-white hover:bg-emerald-400'
                                    )}
                                    onClick={() => markLectureComplete(currentLecture)}
                                    disabled={marking || isCurrentWatched}
                                >
                                    {marking ? <LoadingSpinner className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                    {isCurrentWatched ? 'Completed' : 'Mark complete'}
                                </Button>

                                <Button
                                    size="sm"
                                    onClick={() => selectLecture(nextLecture)}
                                    disabled={!nextLecture}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-400">
                            <span>{watchedCount} of {totalLectures} lectures completed</span>
                            <button
                                type="button"
                                onClick={() => navigate(`/course/details/${id}`)}
                                className="inline-flex items-center gap-1 font-semibold text-violet-300 transition hover:text-violet-200"
                            >
                                <Star className="h-3.5 w-3.5" />
                                Rate this course
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside
                    className={cn(
                        'absolute right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col border-l border-white/10 bg-slate-950 transition-transform duration-300 lg:static lg:z-auto lg:w-[380px] lg:max-w-none lg:translate-x-0',
                        sidebarOpen ? 'translate-x-0' : 'translate-x-full',
                        !sidebarOpen && 'lg:hidden'
                    )}
                >
                    <div className="border-b border-white/10 p-4">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-semibold uppercase tracking-wider">Your progress</span>
                            <span>{progressPercentage}%</span>
                        </div>
                        <div className="mt-2">
                            <Progress value={progressPercentage} className="h-2 bg-white/10" />
                        </div>
                        <p className="mt-2 text-xs text-slate-400">
                            {watchedCount} of {totalLectures} lectures complete
                        </p>
                        {certificateCode && (
                            <button
                                type="button"
                                onClick={() => navigate(`/certificate/${certificateCode}`)}
                                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-400/15 px-3 py-2 text-xs font-semibold text-amber-200 ring-1 ring-inset ring-amber-300/30 transition hover:bg-amber-400/20"
                            >
                                <Award className="h-3.5 w-3.5" />
                                View your certificate
                            </button>
                        )}
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
                        <TabsList className="grid w-full shrink-0 grid-cols-2 rounded-none border-b border-white/10 bg-transparent p-0">
                            <TabsTrigger
                                value="content"
                                className="h-11 rounded-none border-b-2 border-transparent text-slate-400 data-[state=active]:border-violet-400 data-[state=active]:bg-transparent data-[state=active]:text-white"
                            >
                                Content
                            </TabsTrigger>
                            <TabsTrigger
                                value="overview"
                                className="h-11 rounded-none border-b-2 border-transparent text-slate-400 data-[state=active]:border-violet-400 data-[state=active]:bg-transparent data-[state=active]:text-white"
                            >
                                Overview
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="content" className="mt-0 min-h-0 flex-1">
                            <ScrollArea className="h-full">
                                <div className="space-y-1 p-2">
                                    {curriculum.map((lecture, index) => {
                                        const watched = progress.some(
                                            item => item.lectureId === lecture._id && item.viewed
                                        )
                                        const isActive = lecture._id === currentLecture?._id

                                        return (
                                            <button
                                                key={lecture._id || index}
                                                type="button"
                                                onClick={() => selectLecture(lecture)}
                                                className={cn(
                                                    'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition',
                                                    isActive
                                                        ? 'bg-violet-500/15 text-white ring-1 ring-inset ring-violet-400/30'
                                                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                                )}
                                            >
                                                <span className="mt-0.5 shrink-0">
                                                    {watched ? (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                    ) : (
                                                        <PlayCircle className="h-4 w-4" />
                                                    )}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block text-[13px] font-medium leading-5">
                                                        {index + 1}. {lecture.title}
                                                    </span>
                                                    {lecture.preview && (
                                                        <span className="mt-0.5 inline-block text-[10px] font-semibold uppercase tracking-wide text-violet-300">
                                                            Free preview
                                                        </span>
                                                    )}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="overview" className="mt-0 min-h-0 flex-1">
                            <ScrollArea className="h-full">
                                <div className="space-y-6 p-5">
                                    <div>
                                        <h2 className="text-sm font-semibold text-white">About this course</h2>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            {course.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    {objectives.length > 0 && (
                                        <div>
                                            <h2 className="text-sm font-semibold text-white">What you’ll learn</h2>
                                            <ul className="mt-2 space-y-2">
                                                {objectives.map((objective, index) => (
                                                    <li key={index} className="flex items-start gap-2 text-sm text-slate-400">
                                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                                        <span>{objective}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div>
                                        <h2 className="text-sm font-semibold text-white">Instructor</h2>
                                        <div className="mt-2 flex items-center gap-3">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
                                                {getInitials(course.instructorName)}
                                            </span>
                                            <div>
                                                <p className="text-sm font-medium text-white">{course.instructorName}</p>
                                                <p className="text-xs text-slate-400">Course instructor</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-400">
                                        <p className="flex items-center gap-2">
                                            <Layers className="h-3.5 w-3.5 text-violet-300" />
                                            {totalLectures} lectures · {course.level} level
                                        </p>
                                        <p className="mt-2 flex items-center gap-2">
                                            <BookOpen className="h-3.5 w-3.5 text-violet-300" />
                                            {meta.label}
                                        </p>
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full border-white/15 bg-transparent text-slate-200 hover:bg-white/10 hover:text-white"
                                        onClick={() => navigate(`/course/details/${id}`)}
                                    >
                                        <Star className="h-4 w-4" />
                                        Reviews & course page
                                    </Button>
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </aside>
            </div>

            {/* Completion dialog */}
            <Dialog open={showCompleted} onOpenChange={setShowCompleted}>
                <DialogContent className="sm:max-w-md">
                    <div className="relative flex justify-center">
                        {showCompleted && (
                            <ConfettiExplosion
                                force={0.8}
                                duration={2500}
                                particleCount={180}
                                width={600}
                            />
                        )}
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <PartyPopper className="h-7 w-7" />
                        </span>
                    </div>
                    <DialogHeader className="items-center text-center">
                        <DialogTitle className="text-xl">Congratulations!</DialogTitle>
                        <DialogDescription className="text-center">
                            You completed <span className="font-semibold text-foreground">{course.title}</span>.
                            Every lecture is finished — that is a real achievement.
                        </DialogDescription>
                    </DialogHeader>
                    <Button className="mt-1 w-full" size="lg" onClick={handleViewCertificate} disabled={issuingCertificate}>
                        {issuingCertificate ? <LoadingSpinner className="h-4 w-4" /> : <Award className="h-4 w-4" />}
                        View your certificate
                    </Button>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button className="flex-1" variant="outline" onClick={() => navigate(`/course/details/${id}`)}>
                            <Star className="h-4 w-4" />
                            Leave a review
                        </Button>
                        <Button className="flex-1" variant="outline" onClick={handleResetProgress}>
                            <RotateCcw className="h-4 w-4" />
                            Start over
                        </Button>
                    </div>
                    <Button variant="ghost" className="w-full" onClick={() => navigate('/acquired-courses')}>
                        <TvMinimalPlay className="h-4 w-4" />
                        Back to my learning
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CourseProgressPage
