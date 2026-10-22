import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InstructorContext } from '@/context/instructor'
import { deleteCourse, deleteMedia } from '@/services'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { courseCurriculumInitialFormData, courseLandingInitialFormData } from '@/config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import RatingStars from '@/components/rating-stars'
import { getCategoryMeta } from '@/lib/course-meta'
import { adjustPrice, formatCompactNumber } from '@/utils'
import { BookOpen, Edit, Eye, Plus, Trash } from 'lucide-react'
import { toast } from 'sonner'


function InstructorCourses({ courses = [] }) {
    const navigate = useNavigate()
    const {
      setCourseLandingFormData,
      setCourseCurriculumFormData,
      setInstructorCourses,
      setCurrentEditedCourse,
    } = useContext(InstructorContext)
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [loadingCourseId, setLoadingCourseId] = useState(null)
    const [confirmDeleteCourseValue, setConfirmDeleteCourseValue] = useState('')
    const [open, setOpen] = useState(false)

    async function handleDeleteCourse() {
      if (!selectedCourse || loadingCourseId) return

      try {
        setOpen(false)
        setLoadingCourseId(selectedCourse._id)

        const course = courses.find((item) => item._id === selectedCourse._id)
        if (!course) return

        const courseImage = course.public_id
        const curriculumVideos = (course.curriculum || [])
          .map((video) => video.public_id)
          .filter(Boolean)

        let undo = false
        let timeout = 5000
        let secondsLeft = 5

        const toastId = toast(
            <div className="flex items-center gap-2">
                <LoadingSpinner className="w-4 h-4" />
                <span>Course will be permanently deleted in {secondsLeft}</span>
            </div>,
            {
                duration: timeout,
                position: 'top-right',
                action: {
                    label: 'Undo',
                    onClick: () => {
                        undo = true
                        toast.dismiss(toastId)
                        setLoadingCourseId(null)
                    }
                }
            }
        )

        const countdownInterval = setInterval(() => {
            if (undo || secondsLeft <= 1) {
                clearInterval(countdownInterval)
                return
            }

            secondsLeft -= 1
            toast(
                <div className="flex items-center gap-2">
                    <LoadingSpinner className="w-4 h-4" />
                    <span>Course will be permanently deleted in {secondsLeft}</span>
                </div>,
                {
                    id: toastId,
                    position: 'top-right',
                    duration: timeout
                }
            )
        }, 1000)

        await new Promise((resolve) => setTimeout(resolve, timeout))

        if (undo) {
            toast.dismiss(toastId)
            return
        }

        // Media cleanup is best-effort: a missing Cloudinary asset should never
        // block deleting the course itself.
        if (courseImage) {
          await deleteMedia(courseImage, 'image').catch(() => null)
        }
        if (curriculumVideos.length > 0) {
          await deleteMedia(curriculumVideos, 'video').catch(() => null)
        }

        const deleteCourseResponse = await deleteCourse(selectedCourse._id)

        if (deleteCourseResponse?.success) {
            setInstructorCourses((prevCourses) =>
              prevCourses.filter((item) => item._id !== selectedCourse._id)
            )

            setConfirmDeleteCourseValue('')
            toast.success(`${course.title} was deleted`, {
                id: toastId,
                position: 'top-right',
                action: null
            })
        } else {
            toast.error(deleteCourseResponse?.message || 'Could not delete the course', { id: toastId })
        }
      } catch {
        toast.error('Could not delete the course')
      } finally {
        setLoadingCourseId(null)
        setConfirmDeleteCourseValue('')
      }
    }

    useEffect(() => {
        if (!open) {
            setConfirmDeleteCourseValue('')
        }
    }, [open])

    return (
      <Card className="shadow-sm">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="text-xl">Your courses</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {courses.length} {courses.length === 1 ? 'course' : 'courses'} in your catalog
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setCurrentEditedCourse(null)
                        setCourseCurriculumFormData(courseCurriculumInitialFormData)
                        setCourseLandingFormData(courseLandingInitialFormData)
                        navigate('/instructor/create-new-course')
                    }}
                >
                    <Plus className="h-4 w-4" />
                    Create new course
                </Button>
            </CardHeader>

            <CardContent className="pb-5">
                {courses.length === 0 ? (
                    <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <BookOpen className="h-7 w-7" />
                        </span>
                        <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            Create your first course, add lectures, and publish it to the catalog.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[260px]">Course</TableHead>
                                    <TableHead>Students</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    <TableHead className="hidden lg:table-cell">Rating</TableHead>
                                    <TableHead className="hidden md:table-cell">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {courses.map((course) => {
                                    const meta = getCategoryMeta(course.category)
                                    const CategoryIcon = meta.icon
                                    const revenue = (Number(course.price) || 0) * (course.students?.length || 0)

                                    if (loadingCourseId === course._id) {
                                        return (
                                            <TableRow key={course._id}>
                                                <TableCell colSpan={7}>
                                                    <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                                                        <LoadingSpinner className="h-4 w-4" />
                                                        Deleting {course.title}…
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }

                                    return (
                                        <TableRow key={course._id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                                                        {course.image_url ? (
                                                            <img
                                                                src={course.image_url}
                                                                alt={course.title}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center bg-brand-gradient text-white">
                                                                <CategoryIcon className="h-4 w-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="line-clamp-1 text-sm font-semibold">{course.title}</p>
                                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                                            {meta.label} · {course.level}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {course.students?.length > 0 ? formatCompactNumber(course.students.length) : '—'}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {Number(course.price) === 0 ? 'Free' : adjustPrice(course.price)}
                                            </TableCell>
                                            <TableCell className="text-sm font-semibold">
                                                {adjustPrice(revenue)}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <div className="flex flex-col gap-1">
                                                    <RatingStars
                                                        rating={course.averageRating}
                                                        count={course.reviewCount}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${course.isPublished === false ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                                    {course.isPublished === false ? 'Draft' : 'Published'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => navigate(`/course/details/${course._id}`)}
                                                        aria-label={`Preview ${course.title} as a learner`}
                                                        title="Preview as a learner"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => navigate(`/instructor/course-preview/${course._id}`)}
                                                        aria-label={`Preview ${course.title} in instructor mode`}
                                                        title="Preview course (instructor)"
                                                    >
                                                        <Eye className="h-4 w-4 text-sky-400" />
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={Boolean(loadingCourseId)}
                                                        onClick={() => navigate(`/instructor/edit-course/${course._id}`)}
                                                        aria-label={`Edit ${course.title}`}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>

                                                    <Dialog open={open} onOpenChange={setOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                disabled={Boolean(loadingCourseId)}
                                                                onClick={() => {
                                                                    setSelectedCourse(course)
                                                                    setOpen(true)
                                                                }}
                                                                aria-label={`Delete ${course.title}`}
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent
                                                            aria-describedby={confirmDeleteCourseValue === selectedCourse?.title ? 'delete-description' : undefined}
                                                            className="sm:w-[425px]"
                                                        >
                                                            <DialogTitle className="text-lg font-semibold">
                                                                Delete “{selectedCourse?.title}”?
                                                            </DialogTitle>
                                                            <div className="mt-3 text-sm text-muted-foreground">
                                                                <p>
                                                                    This permanently removes the course, its lectures and progress data.
                                                                </p>
                                                                <Input
                                                                    value={confirmDeleteCourseValue}
                                                                    onChange={(event) => setConfirmDeleteCourseValue(event.target.value)}
                                                                    placeholder="Type the course name to confirm"
                                                                    className="my-3"
                                                                />

                                                                {confirmDeleteCourseValue === selectedCourse?.title && (
                                                                    <DialogDescription id="delete-description" className="text-sm font-medium text-red-700">
                                                                        {selectedCourse?.students?.length > 0 ? (
                                                                            `${selectedCourse.students.length} ${selectedCourse.students.length > 1 ? 'students' : 'student'} will lose access to this course. This cannot be undone.`
                                                                        ) : (
                                                                            'This cannot be undone.'
                                                                        )}
                                                                    </DialogDescription>
                                                                )}
                                                            </div>
                                                            <div className="mt-5 flex justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => setOpen(false)}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    onClick={handleDeleteCourse}
                                                                    disabled={confirmDeleteCourseValue !== selectedCourse?.title}
                                                                >
                                                                    Delete course
                                                                </Button>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
      </Card>
    )
  }

  export default InstructorCourses
