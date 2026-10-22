import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStudentCourses } from '@/services'
import CourseCard from '@/components/course-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCart } from '@/context/cart'
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

function CartSkeleton() {
    return (
        <div className="container-page py-8">
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
        </div>
    )
}

function CartPage() {
    const navigate = useNavigate()
    const { items, removeFromCart, count } = useCart()
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)

    // Fetch all courses in cart
    useState(() => {
        if (items.length > 0) {
            const fetchCourses = async () => {
                setLoading(true)
                try {
                    const response = await getStudentCourses()
                    if (response?.success) {
                        const allCourses = response.data || []
                        const cartCourses = allCourses.filter(course =>
                            items.includes(String(course._id))
                        )
                        setCourses(cartCourses)
                    }
                } catch {
                    toast.error('Could not load cart items')
                } finally {
                    setLoading(false)
                }
            }
            fetchCourses()
        } else {
            setLoading(false)
        }
    })


    const cartCourses = useMemo(() => {
        if (!courses || courses.length === 0) {
            return items.map(id => ({
                _id: id,
                title: 'Course not found',
                price: 0,
                image_url: null,
                instructorName: 'Unknown',
                category: '',
                level: 'beginner'
            }))
        }
        return courses
    }, [courses, items])

    const total = useMemo(() => {
        return cartCourses.reduce((sum, course) => sum + (Number(course.price) || 0), 0)
    }, [cartCourses])

    function handleRemove(courseId) {
        removeFromCart(courseId)
        toast.success('Removed from cart')
        // Refresh courses list
        setCourses(prev => prev.filter(c => String(c._id) !== String(courseId)))
    }

    function handleCheckout() {
        if (cartCourses.length === 0) {
            toast.error('Your cart is empty')
            return
        }
        // Navigate to first course checkout
        const firstCourse = cartCourses[0]
        if (firstCourse._id) {
            navigate(`/course/details/${firstCourse._id}`)
        }
    }

    if (count === 0) {
        return (
            <div className="bg-background">
                <div className="container-page py-16">
                    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <ShoppingBag className="h-8 w-8" />
                        </span>
                        <h1 className="mt-5 text-2xl font-bold">Your cart is empty</h1>
                        <p className="mt-2 max-w-md text-sm text-muted-foreground">
                            Add courses to your cart and checkout when you are ready.
                        </p>
                        <Button className="mt-6" onClick={() => navigate('/courses')}>
                            <ArrowRight className="h-4 w-4" />
                            Browse courses
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-background">
            <div className="border-b bg-muted/30">
                <div className="container-page py-8 sm:py-10">
                    <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {count} {count === 1 ? 'course' : 'courses'} in your cart
                    </p>
                </div>
            </div>

            <div className="container-page py-8">
                {loading ? (
                    <CartSkeleton />
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-4">
                            {cartCourses.map(course => (
                                <div
                                    key={course._id}
                                    className="flex gap-4 overflow-hidden rounded-xl border bg-card p-4"
                                >
                                    <div className="relative aspect-video w-48 shrink-0 overflow-hidden rounded-lg bg-muted">
                                        {course.image_url ? (
                                            <img
                                                src={course.image_url}
                                                alt={course.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500">
                                                <ShoppingBag className="h-8 w-8 text-white/50" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col justify-between p-3">
                                        <div>
                                            <h3 className="line-clamp-2 text-base font-semibold">
                                                {course.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                by {course.instructorName}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-3">
                                            <span className="text-xl font-bold">
                                                {Number(course.price) === 0 ? 'Free' : `₪${Number(course.price).toFixed(2)}`}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemove(course._id)}
                                                    aria-label="Remove from cart"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() => navigate(`/course/details/${course._id}`)}
                                                >
                                                    View course
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order summary */}
                        <div className="rounded-xl border bg-card p-5 lg:sticky lg:top-24">
                            <h2 className="text-lg font-bold">Order Summary</h2>

                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">
                                        {Number(total) === 0 ? 'Free' : `₪${total.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax (included)</span>
                                    <span className="font-medium">Included</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Discount</span>
                                    <span className="font-medium text-emerald-600">—</span>
                                </div>
                            </div>

                            <div className="my-4 border-t pt-4">
                                <div className="flex justify-between">
                                    <span className="text-lg font-bold">Total</span>
                                    <span className="text-lg font-bold">
                                        {Number(total) === 0 ? 'Free' : `₪${total.toFixed(2)}`}
                                    </span>
                                </div>
                            </div>

                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleCheckout}
                            >
                                Proceed to Checkout
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>

                            <p className="mt-4 text-center text-xs text-muted-foreground">
                                Secure checkout powered by PayPal
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CartPage
