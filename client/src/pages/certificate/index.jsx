import { useEffect, useState, useContext } from "react"
import { AuthContext } from "@/context/auth"
import { toast } from "sonner"
import { formatDate, getInitials } from "@/utils"
import { CertificateCanvas } from "./CertificateCanvas"


export default function CertificatePage() {
    const { auth } = useContext(AuthContext)
    const [courseId, setCourseId] = useState(null)
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const id = sessionStorage.getItem("courseProgressId") || sessionStorage.getItem("viewingCourseId") || window.location.pathname.split("/certificate/")[1]
        if (id) {
            setCourseId(id)
            loadCourse(id)
        } else {
            setLoading(false)
        }
    }, [])

    async function loadCourse(id) {
        try {
            const response = await fetch(`/api/student/course/${id}`)
            if (response.ok) {
                const data = await response.json()
                setCourse(data.data || data)
            }
        } catch (error) {
            console.error("Error loading course:", error)
        } finally {
            setLoading(false)
        }
    }

    function handleCertificate() {
        toast.success("Certificate generated!")
        setCanvasReady(prev => !prev)
    }

    if (loading) return null

    const initials = getInitials(auth?.user?.name || auth?.user?.username || "Student")

    const certificateData = {
        name: auth?.user?.name || auth?.user?.username || "Student",
        courseName: course?.title || "Course Title",
        instructor: course?.instructorName || "Instructor",
        date: formatDate(new Date()),
        studentId: auth?.user?._id || "",
        courseId: course?._id || courseId || "",
        image_url: course?.image_url || "",
        initials,
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto max-w-5xl px-4 py-10 text-center sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your Certificate</h1>
                    <p className="mt-3 text-lg text-slate-400">
                        Download and share your achievement
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-5">
                    {/* Certificate Preview */}
                    <div className="lg:col-span-3">
                        <CertificateCanvas
                            certificateData={certificateData}
                        />
                    </div>

                    {/* Actions Panel */}
                    <div className="lg:col-span-2 space-y-6 lg:pl-8">
                        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                            <h3 className="text-lg font-semibold">Share your achievement</h3>
                            <p className="mt-2 text-sm text-slate-400">
                                Share on social media or download for your portfolio
                            </p>

                            <div className="mt-4 space-y-3">
                                <button
                                    type="button"
                                    onClick={handleCertificate}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gradient px-4 py-3 text-white shadow-lg transition hover:opacity-90 hover:shadow-xl"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                    Download Certificate
                                </button>

                                <button
                                    type="button"
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-700"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 4.5c0-1.55-1.026-2.84-2.48-3.26C19.32 1.06 17.92 0 16.26.1c-1.26.08-2.4.68-3.12 1.56-4.58 6.06-6.94 9.88-7.06 11.38-.02.22-.12.38-.28.42-.76.24-1.54.44-2.34.56-.18-1.06-.6-2.04-1.32-2.84C1.68 9.26 1.16 8.08.96 6.96c-.24-1.34-.74-2.6-1.44-3.74-4.66-7.94-1.64-13.98 4.2-16.36 3.92-1.54 8.68-1.06 11.52 1.04 1.04.76 1.92 1.8 2.56 3.02.86 1.6 1.48 3.36 1.84 5.18.08.42.28.72.42.92.18.28.42.42.76.42.1.02.12.04.12.04L24 5.62l-.04.12zM4.5 9c-1.026 0-1.96.42-2.56 1.14-.82.94-1.2 2.08-1.06 3.22.14 1.18.72 2.2 1.6 3.04.92.88 2.12 1.36 3.34 1.4.2 0 .34.08.42.08s.12-.06.12-.06c.02-.02.02-.04.02-.04 1.46-.96 2.62-2.3 3.24-3.84.62-1.54.6-3.16-.04-4.68-1.54-3.5-1.54-6.28 0-7.86 1.66-1.57 4.06-1.84 5.92-.72 1.38.9 2.3 2.34 2.76 3.94.4 1.32.48 2.7.26 4.02-.24 1.5-.86 2.92-1.78 4.08-.96 1.2-2.18 2.14-3.54 2.74-1.42.64-2.96.86-4.52.66-1.18-.16-2.3-.7-3.1-1.44-.9-.86-1.56-1.96-1.56-3.34 0-1.22.54-2.3 1.54-3.22 1.46-1.38 3.48-2.08 5.72-2.08zM15.68 3.34c-1.46-.58-3.06-1.06-4.7-1.42-1.36-.3-2.76-.38-4.16-.22-.9.1-1.76.36-2.54.72-.96.44-1.82 1.1-2.5 1.88-1.28 1.48-1.84 3.36-1.66 5.34.16 1.72.72 3.36 1.6 4.86.9 1.54 2.2 2.8 3.76 3.58 1.52.78 3.18 1.12 4.86 1.08.28 0 .48.04.56.04.02 0 .02.02.02.02.14 0 .14-.02.14-.06 1.28-.56 2.36-1.44 3.18-2.6.86-1.2 1.38-2.6 1.52-4.14.12-1.28.04-2.56-.24-3.82-.3-.88-.78-1.68-1.46-2.32-.7-.66-1.54-1.12-2.46-1.4-.92-.28-1.9-.36-2.9-.24-.98.12-1.9.44-2.74.92C2.9 5.7 1.8 7.2 1.3 8.92c-.5 1.7.14 3.48 1.36 4.82s2.94 2.38 4.64 2.52c1.12.08 2.22-.04 3.26-.34.92-.26 1.76-.74 2.48-1.44s1.3-1.66 1.64-2.64c.36-1.08.54-2.24.54-3.44 0-1.2-.22-2.34-.66-3.42-.44-1.1-.92-2.06-1.46-2.88-.54-.82-1.22-1.5-1.98-2.02-1.1-.82-2.42-1.32-3.84-1.5-1.4-.18-2.82-.04-4.24.4-.14.06-.22.12-.3.18L4.9 11.64c.08.14.14.24.14.24z" />
                                    </svg>
                                    Share Certificate
                                </button>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
                            <h3 className="text-lg font-semibold">Certificate Details</h3>
                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Student</span>
                                    <span className="font-medium">{certificateData.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Course</span>
                                    <span className="font-medium truncate ml-4 max-w-[200px]">{certificateData.courseName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Instructor</span>
                                    <span className="font-medium">{certificateData.instructor}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Date Completed</span>
                                    <span className="font-medium">{certificateData.date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Certificate ID</span>
                                    <span className="font-mono text-xs text-slate-500">{auth?.user?._id?.slice(-6) || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="rounded-xl border border-emerald-700/50 bg-emerald-900/20 p-5">
                            <h3 className="text-sm font-semibold text-emerald-400">Pro Tips</h3>
                            <ul className="mt-3 space-y-2 text-xs text-slate-400">
                                <li className="flex items-start gap-2">
                                    <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Add your certificate to LinkedIn under "Licenses & certifications"
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Include in your portfolio or resume under "Certifications"
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414 1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Share on Twitter/LinkedIn to celebrate your achievement
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
