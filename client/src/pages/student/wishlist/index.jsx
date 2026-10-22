import { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WishlistContext } from '@/context/wishlist'
import { getWishlist } from '@/services'
import CourseCard from '@/components/course-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BookmarkPlus, Compass, Heart } from 'lucide-react'
import { toast } from 'sonner'


function WishlistSkeleton() {
    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-xl border bg-card">
                    <Skeleton className="aspect-video w-full" />
                    <div className="space-y-3 p-4">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                </div>
            ))}
        </div>
    )
}

function WishlistPage() {
    const navigate = useNavigate()
    const { ids } = useContext(WishlistContext)
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        async function load() {
            setLoading(true)

            try {
                const response = await getWishlist()
                if (!cancelled && response?.success) {
                    setCourses(response.data || [])
                }
            } catch {
                if (!cancelled) toast.error('Could not load your saved courses')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()

        return () => {
            cancelled = true
        }
    }, [])

    // The heart is optimistic, so filter by the live context rather than the
    // snapshot fetched above. That way un-saving removes a card immediately.
    const savedCourses = useMemo(
        () => courses.filter(course => ids.includes(String(course._id))),
        [courses, ids]
    )

    return (
        <div className="bg-background">
            <section className="border-b bg-muted/30">
                <div className="container-page flex flex-col justify-between gap-5 py-9 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Your collection</p>
                        <h1 className="mt-2 flex items-center gap-2.5 text-3xl font-bold tracking-tight sm:text-4xl">
                            <Heart className="h-7 w-7 fill-rose-500 text-rose-500" />
                            Saved courses
                        </h1>
                        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                            Keep the courses you are curious about in one place. They stay here until you are ready to start.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/courses')}>
                        <Compass className="h-4 w-4" />
                        Browse courses
                    </Button>
                </div>
            </section>

            <div className="container-page py-8 lg:py-10">
                {loading ? (
                    <WishlistSkeleton />
                ) : savedCourses.length > 0 ? (
                    <>
                        <p className="mb-5 text-sm text-muted-foreground">
                            {savedCourses.length} {savedCourses.length === 1 ? 'course' : 'courses'} saved
                        </p>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {savedCourses.map(course => (
                                <CourseCard key={course._id} course={course} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                            <BookmarkPlus className="h-8 w-8" />
                        </span>
                        <h2 className="mt-5 text-xl font-bold">Nothing saved yet</h2>
                        <p className="mt-2 max-w-md text-sm text-muted-foreground">
                            Tap the heart on any course to keep it here for later. Great for building your own learning plan.
                        </p>
                        <Button className="mt-6" onClick={() => navigate('/courses')}>
                            <Compass className="h-4 w-4" />
                            Find a course to save
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default WishlistPage
