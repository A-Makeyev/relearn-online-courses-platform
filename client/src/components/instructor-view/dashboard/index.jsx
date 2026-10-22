import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adjustPrice, formatCompactNumber, getInitials } from '@/utils'
import { cn } from '@/lib/utils'
import { InstructorContext } from '@/context/instructor'
import {
    ArrowUpRight,
    BookOpen,
    Landmark,
    Plus,
    Star,
    TrendingUp,
    Users,
    Receipt,
    Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import RatingStars from '@/components/rating-stars'
import { getInstructorOrders } from '@/services'
import { toast } from 'sonner'


function InstructorDashboard({ courses = [], onViewCourses }) {
    const navigate = useNavigate()
    const { instructorOrders, setInstructorOrders } = useContext(InstructorContext)
    const [ordersLoading, setOrdersLoading] = useState(false)


    useEffect(() => {
        let cancelled = false

        async function loadOrders() {
            if (!instructorOrders) {
                setOrdersLoading(true)
                try {
                    const response = await getInstructorOrders()
                    if (!cancelled && response?.success) {
                        setInstructorOrders(response.data)
                    }
                } catch {
                    if (!cancelled) toast.error('Could not load orders')
                } finally {
                    if (!cancelled) setOrdersLoading(false)
                }
            }
        }

        loadOrders()

        return () => {
            cancelled = true
        }
    }, [instructorOrders, setInstructorOrders])

    const totals = courses.reduce((acc, course) => {
        const studentCount = course.students?.length || 0
        acc.revenue += (Number(course.price) || 0) * studentCount
        acc.students += studentCount
        acc.lectures += course.curriculum?.length || 0

        if (course.reviewCount > 0) {
            acc.ratingWeighted += (course.averageRating || 0) * course.reviewCount
            acc.reviewCount += course.reviewCount
        }

        (course.students || []).forEach(student => {
            acc.enrollments.push({
                courseTitle: course.title,
                studentName: student.studentName,
                studentEmail: student.studentEmail,
                courseId: course._id
            })
        })

        return acc
    }, {
        revenue: 0,
        students: 0,
        lectures: 0,
        ratingWeighted: 0,
        reviewCount: 0,
        enrollments: []
    })

    const averageRating = totals.reviewCount > 0
        ? totals.ratingWeighted / totals.reviewCount
        : 0

    const displayedRevenue = instructorOrders?.totalRevenue ?? totals.revenue

    const statCards = [
        {
            label: 'Total students',
            value: formatCompactNumber(totals.students),
            hint: `${courses.length} ${courses.length === 1 ? 'course' : 'courses'} in catalog`,
            icon: Users,
            tone: 'bg-violet-100 text-violet-700'
        },
        {
            label: 'Total revenue',
            value: adjustPrice(displayedRevenue),
            hint: `${instructorOrders?.orderCount || 0} orders received`,
            icon: Receipt,
            tone: 'bg-emerald-100 text-emerald-700'
        },
        {
            label: 'Lectures published',
            value: formatCompactNumber(totals.lectures),
            hint: 'Total learning content',
            icon: BookOpen,
            tone: 'bg-sky-100 text-sky-700'
        },
        {
            label: 'Average rating',
            value: averageRating > 0 ? averageRating.toFixed(1) : '—',
            hint: totals.reviewCount > 0 ? `${totals.reviewCount} student reviews` : 'No reviews yet',
            icon: Star,
            tone: 'bg-amber-100 text-amber-700'
        }
    ]

    // Show recent orders instead of course performance chart
    const recentOrders = (instructorOrders?.orders || [])
        .slice(0, 5)

    const recentEnrollments = totals.enrollments.slice(-8).reverse()

    if (courses.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center px-6 py-16 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <BookOpen className="h-8 w-8" />
                    </span>
                    <h2 className="mt-5 text-xl font-bold">Publish your first course</h2>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                        Build a curriculum, upload your lectures and start reaching students. Your dashboard will
                        fill up with performance data as soon as you publish.
                    </p>
                    <Button className="mt-6" onClick={() => navigate('/instructor/create-new-course')}>
                        <Plus className="h-4 w-4" />
                        Create a course
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map(card => (
                    <Card key={card.label} className="shadow-sm transition hover:shadow-md">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg', card.tone)}>
                                    <card.icon className="h-5 w-5" />
                                </span>
                                <TrendingUp className="h-4 w-4 text-muted-foreground/40" />
                            </div>
                            <p className="mt-4 text-2xl font-bold tracking-tight">{card.value}</p>
                            <p className="mt-1 text-xs font-medium text-muted-foreground">{card.label}</p>
                            <p className="mt-3 border-t pt-2 text-[11px] text-muted-foreground">{card.hint}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Recent orders</CardTitle>
                            <p className="mt-1 text-xs text-muted-foreground">{instructorOrders?.orderCount || 0} total orders</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onViewCourses || (() => navigate('/instructor'))}>
                            View courses
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {ordersLoading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <Skeleton key={index} className="h-14 w-full" />
                                ))}
                            </div>
                        ) : recentOrders.length > 0 ? (
                            <div className="space-y-3">
                                {recentOrders.map((order, index) => (
                                    <div key={order._id || index} className="flex items-start gap-3">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                                            <Receipt className="h-4 w-4" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{order.courseTitle}</p>
                                            <p className="truncate text-[11px] text-muted-foreground">
                                                {order.studentName} · {new Date(order.orderDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="shrink-0 font-semibold">{adjustPrice(Number(order.coursePrice))}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                                No orders yet. Your revenue will appear here after students purchase your courses.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Recent enrollments</CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {totals.students > 0
                                ? `${totals.students} total ${totals.students === 1 ? 'student' : 'students'}`
                                : 'No enrollments yet'}
                        </p>
                    </CardHeader>
                    <CardContent>
                        {recentEnrollments.length > 0 ? (
                            <div className="space-y-3">
                                {recentEnrollments.map((enrollment, index) => (
                                    <div key={`${enrollment.courseId}-${enrollment.studentEmail}-${index}`} className="flex items-center gap-3">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-secondary-foreground">
                                            {getInitials(enrollment.studentName)}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{enrollment.studentName || 'Student'}</p>
                                            <p className="truncate text-[11px] text-muted-foreground">{enrollment.courseTitle}</p>
                                        </div>
                                        <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">
                                            {enrollment.studentEmail}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                                Students will appear here after enrolling in one of your courses.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {totals.students > 0 && (
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">All students</CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Everyone enrolled across your catalog
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {totals.enrollments.map((enrollment, index) => (
                                        <TableRow key={`${enrollment.courseId}-${enrollment.studentEmail}-${index}`}>
                                            <TableCell className="font-medium">{enrollment.courseTitle}</TableCell>
                                            <TableCell>{enrollment.studentName}</TableCell>
                                            <TableCell className="hidden text-muted-foreground sm:table-cell">
                                                {enrollment.studentEmail}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default InstructorDashboard
