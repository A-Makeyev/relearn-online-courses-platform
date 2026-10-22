import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "@/context/auth"
import { getEnrolledPaths } from "@/services/learning-paths-service"
import { getMyCertificates } from "@/services"
import { UserStatsCard } from "@/components/gamification/user-stats-card"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import React from "react"
import {
    BookOpen,
    PlayCircle,
    CheckCircle2,
    Timer,
    Flame,
    Trophy,
    ArrowRight
} from "lucide-react"
import { formatDate } from "@/utils"


export default function ProgressDashboard() {
    const navigate = useNavigate()
    const { auth } = useContext(AuthContext)

    const [myCourses, setMyCourses] = useState([])
    const [enrolledPaths, setEnrolledPaths] = useState([])
    const [certificates, setCertificates] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!auth?.user?._id) return

        async function loadDashboard() {
            try {
                setLoading(true)

                // Load enrolled courses
                const coursesResponse = await fetch(`/api/student/acquired-courses`)
                if (coursesResponse.ok) {
                    const data = await coursesResponse.json()
                    if (data.success) {
                        setMyCourses(data.data || [])
                    }
                }

                // Load learning paths
                const pathsResponse = await getEnrolledPaths()
                if (pathsResponse.success) {
                    setEnrolledPaths(pathsResponse.data || [])
                }

                // Load certificates
                const certsResponse = await getMyCertificates()
                if (certsResponse.success) {
                    setCertificates(certsResponse.data || [])
                }
            } catch (error) {
                console.error("Error loading dashboard:", error)
                toast.error("Failed to load dashboard")
            } finally {
                setLoading(false)
            }
        }

        loadDashboard()
    }, [auth?.user?._id])

    // Calculate stats
    const totalLecturesWatched = myCourses.reduce((sum, course) => {
        const progress = course.progress || []
        return sum + progress.filter(p => p.viewed).length
    }, 0)

    const completedCoursesCount = myCourses.filter(course => course.completed).length
    const inProgressCourses = myCourses.filter(course => !course.completed && course.progress?.length > 0).length

    const totalTimeSpent = myCourses.reduce((sum, course) => {
        const progress = course.progress || []
        const viewedLectures = progress.filter(p => p.viewed)
        return sum + viewedLectures.reduce((lectureSum, lecture) => {
            const lectureData = course.curriculum?.find(l => l._id === lecture.lectureId)
            const duration = lectureData?.duration || 10
            return lectureSum + duration
        }, 0)
    }, 0)

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white">
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Skeleton className="h-10 w-48 bg-white/10 rounded mb-2" />
                        <Skeleton className="h-5 w-96 bg-white/5 rounded" />
                    </div>
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Skeleton className="h-64 bg-white/5 rounded-xl" />
                        <Skeleton className="h-64 bg-white/5 rounded-xl" />
                        <Skeleton className="h-64 bg-white/5 rounded-xl" />
                    </div>
                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                        <Skeleton className="h-64 bg-white/5 rounded-xl" />
                        <Skeleton className="h-64 bg-white/5 rounded-xl" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Your Learning Dashboard</h1>
                    <p className="mt-2 text-lg text-slate-400">
                        Track your progress, achievements, and learning activity.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <UserStatsCard />

                    {/* Quick Stats */}
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Quick Stats</CardTitle>
                            <CardDescription>Your learning activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <PlayCircle className="h-4 w-4 text-primary" />
                                        <span className="text-sm text-slate-400">Courses in progress</span>
                                    </div>
                                    <span className="text-lg font-semibold">{inProgressCourses}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        <span className="text-sm text-slate-400">Courses completed</span>
                                    </div>
                                    <span className="text-lg font-semibold">{completedCoursesCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-violet-500" />
                                        <span className="text-sm text-slate-400">Lectures watched</span>
                                    </div>
                                    <span className="text-lg font-semibold">{totalLecturesWatched}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Timer className="h-4 w-4 text-amber-500" />
                                        <span className="text-sm text-slate-400">Time spent learning</span>
                                    </div>
                                    <span className="text-lg font-semibold">{formatDuration(totalTimeSpent * 60 * 1000)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Learning Paths */}
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Learning Paths</CardTitle>
                            <CardDescription>Structured learning journeys</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {enrolledPaths.length === 0 ? (
                                <div className="text-center py-6">
                                    <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                                    <p className="text-sm text-slate-400">No learning paths yet.</p>
                                    <Button className="mt-4 mx-auto" variant="outline" onClick={() => navigate('/courses')}>
                                        <BookOpen className="h-4 w-4 mr-2" />
                                        Browse courses
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {enrolledPaths.slice(0, 3).map(path => (
                                        <div key={path._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                            <div>
                                                <h4 className="text-sm font-medium truncate max-w-[150px]">{path.title}</h4>
                                                <p className="text-xs text-slate-400">
                                                    {path.enrollment?.completedCourses?.length || 0} / {path.courses?.length || 0} courses
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                                                        style={{ width: `${path.enrollment?.progress || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-slate-400">
                                                    {path.enrollment?.progress || 0}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Certificates & Recent Activity */}
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    {/* Certificates */}
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Certificates</CardTitle>
                            <CardDescription>Your earned certificates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {certificates.length === 0 ? (
                                <div className="text-center py-6">
                                    <Award className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                                    <p className="text-sm text-slate-400">No certificates yet</p>
                                    <Button className="mt-4 mx-auto" variant="outline" onClick={() => navigate('/courses')}>
                                        <ArrowRight className="h-4 w-4 mr-2" />
                                        Start learning
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {certificates.slice(0, 4).map(cert => (
                                        <div key={cert._id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                                                <Award className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">{cert.courseName || cert.title}</p>
                                                <p className="text-xs text-slate-400">
                                                    {formatDate(cert.createdAt || cert.issuedAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Learning Streak & Achievements */}
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Achievements</CardTitle>
                            <CardDescription>Your badges and milestones</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Streak */}
                                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-500">
                                        <Flame className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold">{enrolledPaths.length > 0 ? 'On Fire!' : 'Start Today'}</p>
                                        <p className="text-sm text-slate-400">
                                            {enrolledPaths.length > 0 ? 'Keep your learning streak alive' : 'Learn something today to start your streak'}
                                        </p>
                                    </div>
                                </div>

                                {/* Top Achievements */}
                                <div className="pt-3 border-t border-border">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Top Achievements</p>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                                            <Zap className="h-5 w-5 text-yellow-500" />
                                            <div>
                                                <p className="text-sm font-medium">Knowledge Seeker</p>
                                                <p className="text-xs text-slate-400">50+ lectures watched</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                                            <Trophy className="h-5 w-5 text-amber-500" />
                                            <div>
                                                <p className="text-sm font-medium">Course Master</p>
                                                <p className="text-xs text-slate-400">10+ courses completed</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Continue Learning */}
                {myCourses.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-xl font-bold mb-4">Continue Learning</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {myCourses
                                .filter(course => !course.completed)
                                .slice(0, 6)
                                .map(course => {
                                    const progress = course.progress || []
                                    const watchedCount = progress.filter(p => p.viewed).length
                                    const totalCount = course.curriculum?.length || 1
                                    const progressPercent = Math.round((watchedCount / totalCount) * 100)

                                    return (
                                        <Card key={course._id} className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate(`/course-progress/${course._id}`)}>
                                            <div className="aspect-video bg-muted rounded-t-xl overflow-hidden">
                                                {course.courseImage && (
                                                    <img src={course.courseImage} alt={course.title} className="h-full w-full object-cover" />
                                                )}
                                            </div>
                                            <CardContent className="p-4">
                                                <h3 className="text-sm font-semibold line-clamp-2">{course.title}</h3>
                                                <p className="text-xs text-slate-400 mt-1">{course.instructorName}</p>
                                                <div className="mt-3">
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className="text-slate-400">{watchedCount} of {totalCount} lectures</span>
                                                        <span className="font-medium text-primary">{progressPercent}%</span>
                                                    </div>
                                                    <Progress value={progressPercent} className="h-1.5 bg-muted" />
                                                </div>
                                                <Button className="mt-4 w-full" variant="outline" size="sm">
                                                    <PlayCircle className="h-4 w-4 mr-2" />
                                                    Continue
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
