import { Link } from 'react-router-dom'
import { ArrowLeft, Compass, ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'


function PaymentCancelPage() {
    return (
        <div className="container-page flex min-h-[65vh] items-center justify-center py-12">
            <div className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-soft">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <ShieldX className="h-8 w-8" />
                </span>
                <h1 className="mt-5 text-2xl font-bold tracking-tight">Checkout cancelled</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    No payment was taken and you have not been enrolled. Your course is still waiting for you
                    whenever you are ready.
                </p>

                <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
                    <Button asChild>
                        <Link to="/courses">
                            <Compass className="h-4 w-4" />
                            Back to courses
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to="/acquired-courses">
                            <ArrowLeft className="h-4 w-4" />
                            My learning
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default PaymentCancelPage
