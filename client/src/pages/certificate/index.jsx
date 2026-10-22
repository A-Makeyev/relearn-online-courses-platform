import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { verifyCertificate } from '@/services'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCategoryMeta } from '@/lib/course-meta'
import { cn } from '@/lib/utils'
import {
    ArrowLeft,
    Award,
    BadgeCheck,
    CalendarDays,
    Copy,
    GraduationCap,
    Link2,
    Printer,
    Search,
    ShieldCheck
} from 'lucide-react'
import { toast } from 'sonner'


const formatIssuedDate = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

function CertificatePage() {
    const { code } = useParams()
    const navigate = useNavigate()
    const [certificate, setCertificate] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lookupCode, setLookupCode] = useState('')

    useEffect(() => {
        let cancelled = false

        async function load() {
            setLoading(true)
            setCertificate(null)

            try {
                const response = await verifyCertificate(code)

                if (!cancelled && response?.success) {
                    setCertificate(response.data)
                }
            } catch {
                // 404 is handled by the not-found state below.
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        if (code) load()

        return () => {
            cancelled = true
        }
    }, [code])

    function handlePrint() {
        window.print()
    }

    function handleCopy() {
        const url = window.location.href
        navigator.clipboard?.writeText(url)
            .then(() => toast.success('Verification link copied'))
            .catch(() => toast.error('Could not copy the link'))
    }

    function handleLookup(event) {
        event.preventDefault()
        const trimmed = lookupCode.trim().toUpperCase()

        if (!trimmed) {
            toast.error('Enter a certificate code first')
            return
        }

        navigate(`/certificate/${encodeURIComponent(trimmed)}`)
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <LoadingSpinner className="h-10 w-10 text-white" />
            </div>
        )
    }

    if (!certificate) {
        return (
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-16">
                <div className="absolute inset-0 bg-dot-grid opacity-20" />
                <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-white shadow-2xl">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                        <Search className="h-7 w-7" />
                    </span>
                    <h1 className="mt-5 text-xl font-bold">Certificate not found</h1>
                    <p className="mt-2 text-sm text-slate-400">
                        We could not verify <span className="font-mono text-slate-200">{code}</span>. Check the code
                        printed on the certificate, or try another one.
                    </p>
                    <form onSubmit={handleLookup} className="mt-6 flex gap-2">
                        <Input
                            value={lookupCode}
                            onChange={(event) => setLookupCode(event.target.value)}
                            placeholder="EP-XXXX-XXXX"
                            aria-label="Certificate code"
                            className="border-white/15 bg-white/5 text-white placeholder:text-slate-500"
                        />
                        <Button type="submit">Verify</Button>
                    </form>
                    <Button asChild variant="ghost" className="mt-4 text-slate-300 hover:bg-white/10 hover:text-white">
                        <Link to="/home">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Easy Programming
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    const meta = getCategoryMeta(certificate.courseCategory)
    const CategoryIcon = meta.icon
    const issuedDate = formatIssuedDate(certificate.issuedAt)
    const verifyUrl = `${window.location.origin}/certificate/${certificate.code}`

    return (
        <div className="certificate-stage min-h-screen bg-slate-950 px-4 py-8 sm:px-6 sm:py-12">
            <div className="no-print mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 pb-6">
                <div className="flex items-center gap-2.5 text-white">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
                        <GraduationCap className="h-5 w-5" />
                    </span>
                    <div className="leading-tight">
                        <p className="text-sm font-bold">Easy Programming</p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Certificate registry</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 bg-transparent text-slate-200 hover:bg-white/10 hover:text-white"
                        onClick={handleCopy}
                    >
                        <Link2 className="h-4 w-4" />
                        Copy link
                    </Button>
                    <Button size="sm" onClick={handlePrint}>
                        <Printer className="h-4 w-4" />
                        Print / Save PDF
                    </Button>
                </div>
            </div>

            <article className="certificate-sheet relative mx-auto max-w-4xl overflow-hidden rounded-2xl bg-[#fffdf7] text-slate-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] ring-1 ring-black/10">
                <div className="h-2 w-full bg-brand-gradient" />

                {/* Decorative frame */}
                <div className="pointer-events-none absolute inset-3 rounded-lg border border-violet-900/15" />
                <div className="pointer-events-none absolute inset-4 rounded-lg border border-violet-900/10" />

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <GraduationCap className="h-72 w-72 text-violet-900/[0.04]" />
                </div>

                <div className="relative flex flex-col px-7 py-10 sm:px-14 sm:py-14">
                    <header className="flex flex-col items-center text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-white shadow-lg">
                            <Award className="h-6 w-6" />
                        </span>
                        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.34em] text-violet-700">
                            Certificate of completion
                        </p>
                        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                            Easy Programming Academy
                        </h1>
                    </header>

                    <div className="mt-8 text-center sm:mt-10">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">This certifies that</p>
                        <p className="mt-3 font-serif text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                            {certificate.studentName}
                        </p>
                        <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-slate-600">
                            has successfully completed every lecture of
                        </p>
                        <h2 className="mx-auto mt-2 max-w-2xl text-balance text-xl font-bold leading-snug text-violet-900 sm:text-2xl">
                            {certificate.courseTitle}
                        </h2>
                        <p className="mt-3 text-sm text-slate-500">
                            {certificate.lectureCount > 0 && (
                                <>A {certificate.lectureCount}-lecture course · </>
                            )}
                            {certificate.courseCategory ? meta.label : 'Online learning'} · Issued {issuedDate}
                        </p>
                    </div>

                    <div className="mt-10 flex flex-col gap-8 sm:mt-12 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex-1">
                            <p className="font-serif text-2xl italic text-slate-800">{certificate.instructorName}</p>
                            <div className="mt-1 h-px w-52 max-w-full bg-slate-300" />
                            <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                Course instructor
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-1 sm:px-6">
                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-white shadow-lg ring-4 ring-violet-900/10">
                                <BadgeCheck className="h-8 w-8" />
                            </span>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-800">
                                Verified
                            </p>
                        </div>

                        <div className="flex-1 sm:text-right">
                            <p className="font-mono text-sm font-semibold tracking-wider text-slate-800">
                                {certificate.code}
                            </p>
                            <div className="mt-1 h-px w-52 max-w-full bg-slate-300 sm:ml-auto" />
                            <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                Certificate ID
                            </p>
                        </div>
                    </div>

                    <footer className="mt-10 rounded-lg border border-violet-900/10 bg-violet-50/60 px-4 py-3 text-center">
                        <p className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-600">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            Verify this certificate at
                            <span className="font-mono text-[11px] font-semibold text-slate-800">{verifyUrl}</span>
                        </p>
                    </footer>
                </div>
            </article>

            <div className="no-print mx-auto mt-6 flex max-w-4xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
                <p className="text-xs text-slate-400">
                    Tip: choose “Save as PDF” in the print dialog to download a shareable copy.
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Issued {issuedDate}
                    </span>
                    <Link
                        to={certificate.courseId ? `/course/details/${certificate.courseId}` : '/courses'}
                        className="flex items-center gap-1.5 font-semibold text-violet-300 transition hover:text-violet-200"
                    >
                        <CategoryIcon className="h-3.5 w-3.5" />
                        View course
                    </Link>
                </div>
            </div>

            <div className="no-print mx-auto mt-10 flex max-w-4xl justify-center">
                <div className="flex flex-wrap items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-xs text-slate-400">
                    <BadgeCheck className="h-4 w-4 text-emerald-400" />
                    <span>
                        Verified record · {certificate.studentName} · {certificate.code}
                    </span>
                    <span className={cn('h-1 w-1 rounded-full bg-slate-600')} />
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1 font-semibold text-slate-300 transition hover:text-white"
                    >
                        <Copy className="h-3.5 w-3.5" />
                        Copy link
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CertificatePage
