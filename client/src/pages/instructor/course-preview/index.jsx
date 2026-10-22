import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getInstructorCourseDetails } from '@/services'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { getCategoryMeta } from '@/lib/course-meta'
import { adjustPrice } from '@/utils'
import {
    ArrowLeft,
    PlayCircle,
    BookOpen,
    Tag,
    ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'


function InstructorPreviewPage({ courseId }) {
    const navigate = useNavigate()
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        let cancelled = false

        async function loadCourse() {
            setLoading(true)
            setNotFound(false)

            try {
                const response = await getInstructorCourseDetails(courseId)

                if (!cancelled && response?.success && response?.data) {
                    setCourse(response.data)
                } else if (!cancelled) {
                    setNotFound(true)
                }
            } catch {
                if (!cancelled) {
                    setNotFound(true)
                    toast.error('Could not load course')
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        if (courseId) loadCourse()

        return () => {
            cancelled = true
        }
    }, [courseId])

    const curriculum = course?.curriculum || []
    const previewLectures = curriculum.filter(lecture => lecture.preview)
    const meta = course ? getCategoryMeta(course.category) : null

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <LoadingSpinner className="h-10 w-10 text-white" />
            </div>
        )
    }

    if (notFound || !course) {
        return (
            <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                </span>
                <h1 className="mt-5 text-2xl font-bold">Course not found</h1>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    This course may have been removed or is no longer available.
                </p>
                <Button className="mt-6" onClick={() => navigate('/instructor')}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to studio
                </Button>
            </div>
        )
    }

    return (
        <div className="bg-slate-950">
            {/* Header */}
            <div className="border-b border-white/10 bg-slate-900/50">
                <div className="container-page flex items-center gap-4 py-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/instructor')}
                        className="text-white/70 hover:text-white"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-semibold text-white">Preview mode</h1>
                        <p className="text-sm text-white/60">Viewing as a student</p>
                    </div>
                </div>
            </div>

            {/* Course preview */}
            <div className="container-page py-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-6">
                        {/* Hero */}
                        <div className="rounded-xl border border-white/10 bg-slate-900/80 p-6">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                                <Tag className="h-3.5 w-3.5" />
                                {meta?.label || 'Course'}
                            </div>
                            <h1 className="mt-3 text-2xl font-bold text-white">
                                {course.title}
                            </h1>
                            {course.subtitle && (
                                <p className="mt-2 text-sm text-white/70">
                                    {course.subtitle}
                                </p>
                            )}
                        </div>

                        {/* Curriculum */}
                        <div className="rounded-xl border border-white/10 bg-slate-900/80">
                            <div className="border-b border-white/10 p-4">
                                <h2 className="text-lg font-semibold text-white">
                                    Course content
                                </h2>
                                <p className="text-sm text-white/60">
                                    {curriculum.length} lectures
                                    {previewLectures.length > 0 && (
                                        <> · {previewLectures.length} free previews</>
                                    )}
                                </p>
                            </div>

                            <div className="divide-y divide-white/5">
                                {curriculum.map((lecture, index) => (
                                    <div
                                        key={lecture._id || index}
                                        className="flex items-center gap-4 p-4"
                                    >
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-sm font-semibold text-white/60">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-medium text-white">
                                                {lecture.title}
                                            </p>
                                        </div>
                                        {lecture.preview ? (
                                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                                                <PlayCircle className="h-3.5 w-3.5" />
                                                Preview
                                            </span>
                                        ) : (
                                            <span className="text-xs text-white/40">Enrolled only</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action */}
                        <div className="flex items-center gap-3">
                            <Button
                                className="flex-1"
                                size="lg"
                                asChild
                            >
                                <a
                                    href={`/course/details/${course._id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <PlayCircle className="h-4 w-4" />
                                    Open in new tab
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => navigate('/instructor')}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to studio
                            </Button>
                        </div>
                    </div>

                    {/* Sidebar preview */}
                    <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5 lg:sticky lg:top-24">
                        <div className="aspect-video rounded-lg bg-slate-800 overflow-hidden">
                            {course.image_url ? (
                                <img
                                    src={course.image_url}
                                    alt={course.title}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600 to-fuchsia-600">
                                    <BookOpen className="h-12 w-12 text-white/50" />
                                </div>
                            )}
                        </div>

                        <div className="mt-4 space-y-3">
                            <p className="text-3xl font-bold text-white">
                                {Number(course.price) === 0 ? 'Free' : adjustPrice(course.price)}
                            </p>

                            <Button
                                className="w-full"
                                size="lg"
                                disabled
                                variant="outline"
                            >
                                Preview mode
                            </Button>

                            <p className="text-center text-xs text-white/50">
                                You are previewing as the instructor
                            </p>

                            <div className="border-t border-white/10 pt-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                                    Course includes
                                </p>
                                <ul className="mt-3 space-y-2 text-sm text-white/70">
                                    <li className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-white/50" />
                                        {curriculum.length} lectures
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <PlayCircle className="h-4 w-4 text-white/50" />
                                        {previewLectures.length} free previews
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-white/50" />
                                        {meta?.label || 'Course'}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InstructorPreviewPage
