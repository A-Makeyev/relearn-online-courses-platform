import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { capturePaymentAndFinalizeOrder } from '@/services'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import ConfettiExplosion from 'react-confetti-explosion'
import { AlertCircle, CheckCircle2, Compass, PartyPopper, PlayCircle } from 'lucide-react'


function PaymentReturnPage() {
    const location = useLocation()
    const capturedRef = useRef(false)
    const [status, setStatus] = useState('processing')
    const [courseId, setCourseId] = useState(null)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        if (capturedRef.current) return
        capturedRef.current = true

        const params = new URLSearchParams(location.search)
        const paymentId = params.get('paymentId')
        const payerId = params.get('PayerID')
        const storedOrderId = sessionStorage.getItem('orderId')
        const orderId = storedOrderId ? JSON.parse(storedOrderId) : null

        if (!paymentId || !payerId || !orderId) {
            setStatus('error')
            setErrorMessage('We could not find the payment details for this order.')
            return
        }

        async function capturePayment() {
            try {
                const response = await capturePaymentAndFinalizeOrder(paymentId, payerId, orderId)

                if (response?.success) {
                    sessionStorage.removeItem('orderId')
                    setCourseId(response.data?.courseId || null)
                    setStatus('success')
                } else {
                    setStatus('error')
                    setErrorMessage(response?.message || 'We could not confirm your payment.')
                }
            } catch (err) {
                setStatus('error')
                setErrorMessage(
                    err?.response?.data?.message
                    || 'We could not confirm your payment. If you were charged, please contact support.'
                )
            }
        }

        capturePayment()
    }, [location.search])

    return (
        <div className="container-page flex min-h-[65vh] items-center justify-center py-12">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border bg-card p-8 text-center shadow-soft">
                {status === 'processing' && (
                    <>
                        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <LoadingSpinner className="h-7 w-7 text-primary" />
                        </span>
                        <h1 className="mt-5 text-2xl font-bold tracking-tight">Confirming your payment</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Please wait a moment while we finalize your enrollment. Do not close this page.
                        </p>
                        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
                        </div>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="flex justify-center">
                            <ConfettiExplosion force={0.8} width={800} duration={3000} particleCount={220} />
                        </div>
                        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="h-8 w-8" />
                        </span>
                        <h1 className="mt-5 flex items-center justify-center gap-2 text-2xl font-bold tracking-tight">
                            You’re enrolled!
                            <PartyPopper className="h-5 w-5 text-amber-500" />
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Payment confirmed. Your course is now in <span className="font-semibold text-foreground">My learning</span>,
                            ready whenever you are.
                        </p>
                        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
                            {courseId && (
                                <Button asChild>
                                    <Link to={`/course-progress/${courseId}`}>
                                        <PlayCircle className="h-4 w-4" />
                                        Start learning
                                    </Link>
                                </Button>
                            )}
                            <Button variant="outline" asChild>
                                <Link to="/acquired-courses">Go to my learning</Link>
                            </Button>
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-700">
                            <AlertCircle className="h-8 w-8" />
                        </span>
                        <h1 className="mt-5 text-2xl font-bold tracking-tight">Payment not confirmed</h1>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {errorMessage || 'Something went wrong while confirming your payment.'}
                        </p>
                        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
                            <Button asChild>
                                <Link to="/courses">
                                    <Compass className="h-4 w-4" />
                                    Back to courses
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link to="/acquired-courses">My learning</Link>
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default PaymentReturnPage
