import { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '@/context/auth'
import { WishlistContext } from '@/context/wishlist'
import {
    Award,
    GraduationCap,
    Heart,
    LayoutDashboard,
    Library,
    LogOut,
    Menu,
    Search,
    Telescope,
    User,
    X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { getInitials } from '@/utils'
import { cn } from '@/lib/utils'


function StudentHeader() {
    const navigate = useNavigate()
    const location = useLocation()
    const { auth, logout } = useContext(AuthContext)
    const { count: savedCount } = useContext(WishlistContext)
    const [search, setSearch] = useState('')
    const [mobileOpen, setMobileOpen] = useState(false)

    const user = auth?.user

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        setSearch(params.get('search') || '')
        setMobileOpen(false)
    }, [location.search, location.pathname])

    function handleSearch(event) {
        event.preventDefault()
        const term = search.trim()

        navigate(term ? `/courses?search=${encodeURIComponent(term)}` : '/courses')
        setMobileOpen(false)
    }

    function handleLogout() {
        logout()
    }

    const navLinkClass = (isActive) => cn(
        'rounded-md px-3 py-2 text-sm font-semibold transition-colors',
        isActive
            ? 'bg-secondary text-secondary-foreground'
            : 'text-foreground/80 hover:bg-muted hover:text-foreground'
    )

    return (
        <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
            <div className="container-page flex h-16 items-center gap-3 lg:gap-5">
                <Link to="/home" className="flex shrink-0 items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-sm transition-transform hover:scale-105">
                        <GraduationCap className="h-5 w-5" />
                    </span>
                    <span className="hidden flex-col leading-none sm:flex">
                        <span className="text-[15px] font-bold tracking-tight">Easy Programming</span>
                        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            Learn · Build · Grow
                        </span>
                    </span>
                </Link>

                <nav className="hidden items-center gap-1 lg:flex">
                    <Link to="/courses" className={navLinkClass(location.pathname === '/courses')}>
                        Explore
                    </Link>
                    <Link to="/acquired-courses" className={navLinkClass(location.pathname === '/acquired-courses')}>
                        My learning
                    </Link>
                </nav>

                <form onSubmit={handleSearch} className="relative hidden flex-1 md:block" role="search">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search courses, topics, or instructors"
                        aria-label="Search courses"
                        className="h-10 w-full rounded-full border bg-muted/50 pl-10 pr-24 text-sm outline-none transition focus:border-primary/40 focus:bg-background focus:ring-4 focus:ring-primary/10"
                    />
                    <Button
                        type="submit"
                        size="sm"
                        className="absolute right-1.5 top-1/2 h-7 -translate-y-1/2 rounded-full px-3"
                    >
                        Search
                    </Button>
                </form>

                <div className="ml-auto flex items-center gap-1.5">
                    {user?.role === 'instructor' && (
                        <Button variant="ghost" size="sm" className="hidden lg:flex" onClick={() => navigate('/instructor')}>
                            <LayoutDashboard className="h-4 w-4" />
                            Instructor studio
                        </Button>
                    )}

                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="relative hidden sm:inline-flex"
                    >
                        <Link to="/wishlist" aria-label={`Saved courses${savedCount ? ` (${savedCount})` : ''}`}>
                            <Heart className={cn('h-5 w-5', savedCount > 0 && 'fill-rose-500 text-rose-500')} />
                            {savedCount > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                                    {savedCount > 9 ? '9+' : savedCount}
                                </span>
                            )}
                        </Link>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="flex items-center gap-2 rounded-full border p-1 pr-2 transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                aria-label="Open account menu"
                            >
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
                                    {getInitials(user?.username)}
                                </span>
                                <span className="hidden max-w-28 truncate text-sm font-semibold sm:block">
                                    {user?.username}
                                </span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                            <DropdownMenuLabel className="font-normal">
                                <p className="truncate text-sm font-semibold">{user?.username}</p>
                                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate('/acquired-courses')} className="cursor-pointer">
                                <Library className="mr-2 h-4 w-4" />
                                My learning
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/wishlist')} className="cursor-pointer">
                                <Heart className="mr-2 h-4 w-4" />
                                Saved courses
                                {savedCount > 0 && (
                                    <span className="ml-auto text-xs font-semibold text-muted-foreground">{savedCount}</span>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/certificates')} className="cursor-pointer">
                                <Award className="mr-2 h-4 w-4" />
                                Certificates
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/courses')} className="cursor-pointer">
                                <Telescope className="mr-2 h-4 w-4" />
                                Browse courses
                            </DropdownMenuItem>
                            {user?.role === 'instructor' && (
                                <DropdownMenuItem onClick={() => navigate('/instructor')} className="cursor-pointer">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Instructor dashboard
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileOpen(open => !open)}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X /> : <Menu />}
                    </Button>
                </div>
            </div>

            {mobileOpen && (
                <div className="border-t bg-background px-4 pb-4 pt-3 md:hidden">
                    <form onSubmit={handleSearch} className="relative mb-3" role="search">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search courses"
                            aria-label="Search courses"
                            className="h-10 w-full rounded-full border bg-muted/50 pl-10 pr-4 text-sm outline-none focus:border-primary/40 focus:bg-background"
                        />
                    </form>
                    <div className="grid gap-1">
                        <Link to="/courses" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-muted">
                            <Telescope className="h-4 w-4 text-primary" />
                            Explore courses
                        </Link>
                        <Link to="/acquired-courses" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-muted">
                            <Library className="h-4 w-4 text-primary" />
                            My learning
                        </Link>
                        <Link to="/wishlist" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-muted">
                            <Heart className="h-4 w-4 text-rose-500" />
                            Saved courses
                            {savedCount > 0 && (
                                <span className="ml-auto rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600">
                                    {savedCount}
                                </span>
                            )}
                        </Link>
                        <Link to="/certificates" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-muted">
                            <Award className="h-4 w-4 text-amber-500" />
                            Certificates
                        </Link>
                        <Link to="/home" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-muted">
                            <User className="h-4 w-4 text-primary" />
                            Home
                        </Link>
                    </div>
                </div>
            )}
        </header>
    )
}

export default StudentHeader
