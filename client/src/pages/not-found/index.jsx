import { Link } from 'react-router-dom'
import { ArrowLeft, Compass, GraduationCap, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'


function NotFound() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
            <div className="absolute inset-0 bg-dot-grid opacity-50" />
            <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-fuchsia-400/10 blur-3xl" />

            <div className="relative">
                <Link to="/home" className="mb-10 inline-flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gradient text-white">
                        <GraduationCap className="h-5 w-5" />
                    </span>
                    <span className="text-lg font-bold">Easy Programming</span>
                </Link>

                <p className="text-7xl font-extrabold tracking-tighter text-primary/20 sm:text-8xl">404</p>

                <span className="mx-auto -mt-6 flex h-14 w-14 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm">
                    <SearchX className="h-6 w-6" />
                </span>

                <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">This page took a different path</h1>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                    The page you are looking for does not exist or has moved. Let’s get you back to learning.
                </p>

                <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
                    <Button asChild>
                        <Link to="/courses">
                            <Compass className="h-4 w-4" />
                            Explore courses
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to="/home">
                            <ArrowLeft className="h-4 w-4" />
                            Back home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default NotFound
