import { useContext, useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { AuthContext } from "@/context/auth"
import { StudentContext } from "@/context/student"
import { filterOptions, sortOptions } from "@/config"
import { getCoursePurchaseInfo, getStudentCourses } from "@/services"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowUpDownIcon, Atom, ListFilter, Play, RotateCcw, ScrollText, User2 } from "lucide-react"
import { adjustPrice } from "@/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu"


function StudentCoursesPage() {
    const navigate = useNavigate()
    const { auth } = useContext(AuthContext)
    const { 
        studentCourses, 
        setStudentCourses, 
        loading, 
        setLoading 
    } = useContext(StudentContext)
    const [filters, setFilters] = useState(JSON.parse(sessionStorage.getItem('filters')) || {})
    const [searchParams, setSearchParams] = useSearchParams()
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [sort, setSort] = useState('title-a-z')

    async function handleCourseNavigation(id) {
        const response = await getCoursePurchaseInfo(id, auth?.user?._id)
        if (response?.success) {
            navigate(response?.data ? `/course-progress/${id}` : `/course/details/${id}`)
        }
    }
    
    async function getCourses(filters, sort) {
        if (!filters || !sort) return

        setLoading(true)
        
        const query = new URLSearchParams({
            ...filters,
            sortBy: sort
        })
        
        const response = await getStudentCourses(query)

        if (response?.data) {
            setStudentCourses(response.data)
        }
        setLoading(false)
    }

    function handleFiltersChange(section, option) {
        let copyFilters = { ...filters }
        const sectionValues = copyFilters[section] || []

        if (!sectionValues.includes(option.id)) {
            copyFilters[section] = [...sectionValues, option.id]
        } else {
            copyFilters[section] = sectionValues.filter(id => id !== option.id)
        }

        if (copyFilters[section].length === 0) {
            delete copyFilters[section]
        }

        setFilters(copyFilters)
    }

    function updateSearchParams(filterParams) {
        if (!filterParams) return
        
        const params = Object.entries(filterParams)
            .filter(([_, value]) => Array.isArray(value) && value.length > 0)
            .map(([key, value]) => [key, value.join(',')])

        setSearchParams(new URLSearchParams(params))
        return Object.fromEntries(searchParams)
    }

    function handleFiltersReset() {
        setSort('title-a-z')
        setFilters({})
    }

    useEffect(() => {
        getCourses(filters, sort)
    }, [filters, sort])

    useEffect(() => {
        sessionStorage.setItem('filters', JSON.stringify(filters))
        updateSearchParams(filters)
    }, [filters])

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024 && isFilterOpen) {
                setIsFilterOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
            sessionStorage.removeItem('filters')
        }
    }, [isFilterOpen])

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl text-center sm:text-start font-bold  mb-6">
                All Courses
            </h1>
            <div className="flex flex-col lg:flex-row gap-6">
                <aside className="w-full lg:w-auto mr-10">
                    <div className="hidden lg:flex lg:flex-col lg:gap-8 lg:mt-14">
                        { filterOptions && Object.keys(filterOptions).map(item => (
                            <div key={item} className="space-y-4">
                                <p className="font-semibold text-lg">
                                    { item.toUpperCase() }
                                </p>
                                <div className="space-y-3">
                                    { filterOptions[item].map(option => (
                                        <Label key={option.id} className="flex font-medium items-center gap-3">
                                            <Checkbox
                                                onCheckedChange={() => handleFiltersChange(item, option)}
                                                checked={
                                                    filters &&
                                                    Object.keys(filters).length > 0 &&
                                                    filters[item] &&
                                                    filters[item].indexOf(option.id) > -1
                                                }
                                            />
                                            { option.label }
                                        </Label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
                <main className="flex-1">
                    <div className="flex justify-end items-center gap-4 mb-6">
                        <span className="font-mono font-medium text-gray-700">
                            { studentCourses.length ? `${studentCourses.length} ${studentCourses.length === 1 ? 'Result' : 'Results'}` : null }
                        </span>
                        <div className="flex items-center gap-2">
                            <div className="lg:hidden">
                                <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="flex items-center">
                                            <ListFilter />
                                            Filters
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="flex flex-col md:flex-row md:space-x-4 md:w-[500px] md:mr-6 w-[280px] p-4">
                                        { filterOptions && Object.keys(filterOptions).map(item => (
                                            <div key={item} className="space-y-2">
                                                <DropdownMenuLabel>
                                                    { item.toUpperCase() }
                                                </DropdownMenuLabel>
                                                <div className="space-y-2 pl-2 pb-2">
                                                    { filterOptions[item].map(option => (
                                                        <Label key={option.id} className="flex font-medium items-center gap-3">
                                                            <Checkbox
                                                                onCheckedChange={() => handleFiltersChange(item, option)}
                                                                checked={
                                                                    filters &&
                                                                    Object.keys(filters).length > 0 &&
                                                                    filters[item] &&
                                                                    filters[item].indexOf(option.id) > -1
                                                                }
                                                            />
                                                            { option.label }
                                                        </Label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <ArrowUpDownIcon />
                                        Sort
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[180px]">
                                    <DropdownMenuRadioGroup value={sort} onValueChange={(value) => setSort(value)}>
                                        { sortOptions && sortOptions.map(item => (
                                            <DropdownMenuRadioItem key={item.id} value={item.id} className="cursor-pointer">
                                                { item.label }
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="outline" onClick={handleFiltersReset} disabled={Object.keys(filters).length === 0}>
                                <RotateCcw />
                                Reset
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pt-0.5">
                        { loading ? (
                            <div className="flex justify-center col-span-full">
                                <LoadingSpinner className="mt-20 w-12 h-12" />
                            </div>
                        ) : studentCourses && studentCourses.length > 0 ? (
                            studentCourses.map(item => (
                                <div 
                                    key={item._id} 
                                    className="shadow border rounded overflow-hidden hover:shadow-lg duration-300 cursor-default"
                                >
                                    <div 
                                        onClick={() => handleCourseNavigation(item._id)}
                                        className="relative h-60 cursor-pointer group overflow-hidden"
                                    >
                                        <img 
                                            alt={item.title}
                                            src={item.image_url}
                                            className="w-full h-full object-cover duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 duration-500 group-hover:opacity-100"></div>
                                        <Play className="w-10 h-10 absolute inset-0 m-auto opacity-0 duration-500 group-hover:opacity-100 group-hover:scale-125 text-white" />
                                    </div>
                                    <div className="p-4 space-y-1">
                                        <p className="text-lg font-semibold">
                                            <span
                                                onClick={() => handleCourseNavigation(item._id)}
                                                className="cursor-pointer text-gray-900 hover:text-gray-700 transition"
                                            >
                                                { item.title }
                                            </span>
                                        </p>
                                        <p className="flex flex-row text-base font-semibold text-gray-700">
                                            <User2 className="w-4 h-4 mt-1 mr-1" />
                                            Created by
                                            <span className="cursor-pointer ml-1 text-gray-700 hover:text-gray-500 transition">
                                                { item.instructorName }
                                            </span>
                                        </p>
                                        <p className="flex flex-row text-base font-semibold capitalize text-gray-700">
                                            <ScrollText className="w-4 h-4 mt-1 mr-1" />
                                            {`${item.curriculum.length} ${item.curriculum.length <= 1 ? 'Lecture' : 'Lectures'}, ${item.level}`}
                                        </p>
                                        <p className="flex flex-row text-base font-semibold text-gray-700">
                                            <Atom className="w-4 h-4 mt-1" />
                                            <span className="capitalize ml-1 text-gray-700">
                                                { item.category.replace('-', ' ') }
                                            </span>
                                        </p>
                                        <p className="text-lg font-semibold font-mono">
                                            { adjustPrice(item.price) }
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center font-medium text-xl mt-20">
                                <h1>No Courses Found</h1>
                                <h1>¯\_(ツ)_/¯</h1>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default StudentCoursesPage