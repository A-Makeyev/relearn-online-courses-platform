import { useContext, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { StudentContext } from '@/context/student'
import { filterOptions, sortOptions } from '@/config'
import { getStudentCourses } from '@/services'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import CourseCard from '@/components/course-card'
import {
    ArrowUpDownIcon,
    ListFilter,
    RotateCcw,
    Search,
    SearchX,
    SlidersHorizontal,
    X
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { formatCategory } from '@/lib/course-meta'
import { toast } from 'sonner'


const FILTER_SECTIONS = ['category', 'level', 'language']
const DEFAULT_SORT = 'newest'

const splitParam = (value) => (value ? value.split(',').filter(Boolean) : [])

const getOptionLabel = (section, id) => {
    return filterOptions[section]?.find(option => option.id === id)?.label || formatCategory(id)
}

function FilterSection({ title, children }) {
    return (
        <div className="border-b pb-5 last:border-b-0 last:pb-0">
            <h3 className="text-sm font-semibold">{title}</h3>
            <div className="mt-3 space-y-3">{children}</div>
        </div>
    )
}

function StudentCoursesPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { studentCourses, setStudentCourses, loading, setLoading } = useContext(StudentContext)
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

    const filters = useMemo(() => ({
        category: splitParam(searchParams.get('category')),
        level: splitParam(searchParams.get('level')),
        language: splitParam(searchParams.get('language'))
    }), [searchParams])

    const search = searchParams.get('search') || ''
    const requestedSort = searchParams.get('sortBy')
    const sort = sortOptions.some(option => option.id === requestedSort) ? requestedSort : DEFAULT_SORT

    const activeFilterCount = FILTER_SECTIONS.reduce(
        (count, section) => count + filters[section].length,
        0
    ) + (search ? 1 : 0)

    const courses = Array.isArray(studentCourses) ? studentCourses : []

    useEffect(() => {
        setSearchInput(search)
    }, [search])

    useEffect(() => {
        let cancelled = false

        async function fetchCourses() {
            setLoading(true)

            const query = new URLSearchParams()

            FILTER_SECTIONS.forEach(section => {
                if (filters[section].length > 0) {
                    query.set(section, filters[section].join(','))
                }
            })

            if (search) query.set('search', search)
            query.set('sortBy', sort)

            try {
                const response = await getStudentCourses(query.toString())

                if (!cancelled) {
                    if (response?.success) {
                        setStudentCourses(response.data || [])
                        if (search && courses.length === 0) {
                            toast.success('No courses match your search')
                        } else if (!search && filters.category.length === 0 && filters.level.length === 0 && filters.language.length === 0) {
                            // Initial load - no toast needed
                        } else {
                            toast.success(`Found ${response.data?.length || 0} courses`)
                        }
                    } else {
                        setStudentCourses([])
                        toast.error(response?.message || 'Could not load courses')
                    }
                }
            } catch {
                if (!cancelled) {
                    setStudentCourses([])
                    toast.error('Could not load courses. Please try again.')
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        fetchCourses()

        return () => {
            cancelled = true
        }
    }, [searchParams, filters, search, sort, setLoading, setStudentCourses])

    function setParam(key, value) {
        const next = new URLSearchParams(searchParams)
        const isEmpty = value === undefined || value === null || value === ''
            || (Array.isArray(value) && value.length === 0)

        if (isEmpty) {
            next.delete(key)
        } else if (Array.isArray(value)) {
            next.set(key, value.join(','))
        } else {
            next.set(key, value)
        }

        setSearchParams(next, { replace: true })
    }

    function toggleFilter(section, optionId) {
        const current = filters[section]
        const next = current.includes(optionId)
            ? current.filter(id => id !== optionId)
            : [...current, optionId]

        setParam(section, next)
    }

    function handleSearchSubmit(event) {
        event.preventDefault()
        setParam('search', searchInput.trim())
    }

    function handleClearAll() {
        setSearchInput('')
        setSearchParams({}, { replace: true })
    }

    function renderFilterSections(idPrefix = 'desktop') {
        return FILTER_SECTIONS.map(section => (
            <FilterSection key={section} title={section === 'category' ? 'Category' : section === 'level' ? 'Level' : 'Language'}>
                {filterOptions[section].map(option => {
                    const id = `${idPrefix}-${section}-${option.id}`
                    return (
                        <div key={option.id} className="flex items-center gap-3">
                            <Checkbox
                                id={id}
                                checked={filters[section].includes(option.id)}
                                onCheckedChange={() => toggleFilter(section, option.id)}
                            />
                            <Label htmlFor={id} className="flex-1 cursor-pointer text-sm font-normal text-foreground/80">
                                {option.label}
                            </Label>
                        </div>
                    )
                })}
            </FilterSection>
        ))
    }

    return (
        <div className="bg-background">
            {/* Catalog header */}
            <section className="border-b bg-muted/30">
                <div className="container-page py-9 sm:py-11">
                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Course catalog</p>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Explore courses</h1>
                            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                                Search the full catalog by topic, level and language. Every course includes lifetime
                                access and saved progress.
                            </p>
                        </div>

                        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md" role="search">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="search"
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="Search by title, topic or instructor"
                                aria-label="Search courses"
                                className="h-11 w-full rounded-xl border bg-background pl-10 pr-24 text-sm shadow-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                            />
                            <Button type="submit" size="sm" className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2">
                                Search
                            </Button>
                        </form>
                    </div>
                </div>
            </section>

            <div className="container-page py-8 lg:py-10">
                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Desktop filters */}
                    <aside className="hidden w-64 shrink-0 lg:block">
                        <div className="sticky top-24 rounded-xl border bg-card p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="flex items-center gap-2 text-sm font-bold">
                                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                                    Filters
                                </h2>
                                {activeFilterCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleClearAll}
                                        className="text-xs font-medium text-primary hover:underline"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            <div className="mt-5 space-y-5">
                                {renderFilterSections()}
                            </div>
                        </div>
                    </aside>

                    <main className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="lg:hidden"
                                    onClick={() => setMobileFiltersOpen(true)}
                                >
                                    <ListFilter className="h-4 w-4" />
                                    Filters
                                    {activeFilterCount > 0 && (
                                        <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </Button>

                                <p className="text-sm text-muted-foreground">
                                    {loading ? 'Loading courses…' : (
                                        <>
                                            <span className="font-semibold text-foreground">{courses.length}</span>
                                            {' '}{courses.length === 1 ? 'course' : 'courses'} found
                                        </>
                                    )}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <ArrowUpDownIcon className="h-4 w-4" />
                                            {sortOptions.find(option => option.id === sort)?.label || 'Sort'}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52">
                                        <DropdownMenuRadioGroup value={sort} onValueChange={(value) => setParam('sortBy', value)}>
                                            {sortOptions.map(option => (
                                                <DropdownMenuRadioItem key={option.id} value={option.id} className="cursor-pointer">
                                                    {option.label}
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {activeFilterCount > 0 && (
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setParam('search', '')}
                                        className="inline-flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition hover:bg-secondary/70"
                                    >
                                        “{search}”
                                        <X className="h-3 w-3" />
                                    </button>
                                )}

                                {FILTER_SECTIONS.flatMap(section =>
                                    filters[section].map(id => (
                                        <button
                                            key={`${section}-${id}`}
                                            type="button"
                                            onClick={() => toggleFilter(section, id)}
                                            className="inline-flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition hover:bg-secondary/70"
                                        >
                                            {getOptionLabel(section, id)}
                                            <X className="h-3 w-3" />
                                        </button>
                                    ))
                                )}

                                <button
                                    type="button"
                                    onClick={handleClearAll}
                                    className="inline-flex items-center gap-1 px-1 text-xs font-semibold text-primary hover:underline"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    Reset
                                </button>
                            </div>
                        )}

                        <div className="mt-5">
                            {loading ? (
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div key={index} className="overflow-hidden rounded-xl border bg-card">
                                            <Skeleton className="aspect-video w-full rounded-none" />
                                            <div className="space-y-3 p-4">
                                                <Skeleton className="h-3 w-1/3" />
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-2/3" />
                                                <Skeleton className="h-3 w-1/2" />
                                                <Skeleton className="h-5 w-1/3" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : courses.length > 0 ? (
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                    {courses.map(course => (
                                        <CourseCard key={course._id} course={course} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
                                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                        <SearchX className="h-7 w-7 text-muted-foreground" />
                                    </span>
                                    <h2 className="mt-5 text-lg font-semibold">No courses match your search</h2>
                                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                        Try a different keyword or remove a few filters. New courses are added regularly.
                                    </p>
                                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                                        <Button variant="outline" onClick={handleClearAll}>
                                            <RotateCcw className="h-4 w-4" />
                                            Clear filters
                                        </Button>
                                        <Button onClick={() => setMobileFiltersOpen(true)}>
                                            Adjust filters
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Mobile filters */}
            <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <DialogContent className="max-h-[86vh] overflow-y-auto sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Filter courses</DialogTitle>
                        <DialogDescription>
                            Narrow the catalog by category, level and language.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-2 space-y-5">{renderFilterSections('mobile')}</div>

                    <div className="sticky bottom-0 -mx-6 mt-2 flex gap-2 border-t bg-background px-6 pb-1 pt-4">
                        <Button variant="outline" className="flex-1" onClick={handleClearAll}>
                            Reset
                        </Button>
                        <Button className="flex-1" onClick={() => setMobileFiltersOpen(false)}>
                            {loading ? <LoadingSpinner className="h-4 w-4" /> : `Show ${courses.length} results`}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default StudentCoursesPage
