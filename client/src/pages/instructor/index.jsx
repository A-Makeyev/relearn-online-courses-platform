import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/context/auth'
import { InstructorContext } from '@/context/instructor'
import { getInstructorCourses } from '@/services'
import {
    Atom,
    ChartNoAxesCombined,
    GraduationCap,
    Heart,
    Library,
    LogOut,
    Menu,
    Plus,
    Telescope,
    X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigate } from 'react-router-dom'
import { getInitials } from '@/utils'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import InstructorDashboard from '@/components/instructor-view/dashboard'
import InstructorCourses from '@/components/instructor-view/courses'


function InstructorView() {
    const navigate = useNavigate()
    const { auth, logout } = useContext(AuthContext)
    const { instructorCourses, setInstructorCourses } = useContext(InstructorContext)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isLoadingCourses, setIsLoadingCourses] = useState(true)

    const user = auth?.user

    const menuItems = [
        { icon: ChartNoAxesCombined, label: 'Dashboard', value: 'dashboard' },
        { icon: Atom, label: 'Courses', value: 'courses' }
    ]

    function handleMenuItemClick(item) {
        setActiveTab(item.value)
        setMobileMenuOpen(false)
    }

    useEffect(() => {
        let cancelled = false

        async function getCourses() {
            try {
                const response = await getInstructorCourses()
                if (!cancelled && response?.success) {
                    setInstructorCourses(response.data)
                }
            } catch {
                if (!cancelled) toast.error('Could not load your courses')
            } finally {
                if (!cancelled) setIsLoadingCourses(false)
            }
        }

        getCourses()

        return () => {
            cancelled = true
        }
    }, [setInstructorCourses])

    const navButtons = menuItems.map(item => (
        <button
            key={item.value}
            type="button"
            onClick={() => handleMenuItemClick(item)}
            className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                activeTab === item.value
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
            )}
            aria-current={activeTab === item.value ? 'page' : undefined}
        >
            <item.icon className="h-4 w-4" />
            {item.label}
        </button>
    ))

    // The same account is both an instructor and a learner, so the studio
    // offers a direct door into the catalog and the learner dashboard.
    const learnerLinks = [
        { icon: Telescope, label: 'Browse as a learner', to: '/courses' },
        { icon: Library, label: 'My learning', to: '/acquired-courses' },
        { icon: Heart, label: 'Saved courses', to: '/wishlist' }
    ]

    const learnerNav = (
        <div className="mt-6 border-t border-white/10 pt-4">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Learning mode
            </p>
            {learnerLinks.map(link => (
                <button
                    key={link.to}
                    type="button"
                    onClick={() => navigate(link.to)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                </button>
            ))}
        </div>
    )

    const profileCard = (
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
                {getInitials(user?.username)}
            </span>                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{user?.username}</p>
                    <p className="truncate text-[11px] text-slate-400">Instructor &amp; learner</p>
                </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-slate-950 p-4 lg:flex">
                <button
                    type="button"
                    onClick={() => navigate('/instructor')}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-left text-white"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
                        <GraduationCap className="h-5 w-5" />
                    </span>
                    <span className="flex flex-col leading-none">
                        <span className="text-sm font-bold">Easy Programming</span>
                        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                            Instructor
                        </span>
                    </span>
                </button>

                <nav className="mt-8 space-y-1">
                    {navButtons}
                    {learnerNav}
                </nav>

                <div className="mt-auto space-y-3">
                    {profileCard}
                    <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign out
                    </button>
                </div>
            </aside>

            <div className="min-w-0 lg:pl-64">
                {/* Mobile header */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur lg:hidden">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-white">
                            <GraduationCap className="h-5 w-5" />
                        </span>
                        <span className="text-sm font-bold">Instructor studio</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open navigation"
                    >
                        <Menu />
                    </Button>
                </header>

                <main className="p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Instructor studio</p>
                                <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                                    {activeTab === 'dashboard' ? 'Dashboard' : 'Your courses'}
                                </h1>
                                <p className="mt-1.5 text-sm text-muted-foreground">
                                    {activeTab === 'dashboard'
                                        ? `Welcome back${user?.username ? `, ${user.username}` : ''}. Here is how your catalog is performing.`
                                        : 'Manage your catalog, edit lectures and keep your content fresh.'
                                    }
                                </p>
                            </div>
                            <Button onClick={() => navigate('/instructor/create-new-course')}>
                                <Plus className="h-4 w-4" />
                                Create course
                            </Button>
                        </div>

                        <div className="mt-7">
                            {isLoadingCourses ? (
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <Skeleton key={index} className="h-36 w-full rounded-xl" />
                                    ))}
                                </div>
                            ) : activeTab === 'dashboard' ? (
                                <InstructorDashboard
                                    courses={instructorCourses}
                                    onViewCourses={() => setActiveTab('courses')}
                                />
                            ) : (
                                <InstructorCourses courses={instructorCourses} />
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile drawer */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(false)}
                        className="absolute inset-0 bg-slate-950/60"
                        aria-label="Close navigation"
                    />
                    <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-slate-950 p-4">
                        <div className="flex items-center justify-between px-2 py-1">
                            <div className="flex items-center gap-2.5 text-white">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
                                    <GraduationCap className="h-5 w-5" />
                                </span>
                                <span className="text-sm font-bold">Instructor studio</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                                aria-label="Close navigation"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <nav className="mt-6 space-y-1">
                            {navButtons}
                            {learnerNav}
                        </nav>

                        <div className="mt-auto space-y-3">
                            {profileCard}
                            <button
                                type="button"
                                onClick={logout}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign out
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    )
}

export default InstructorView
