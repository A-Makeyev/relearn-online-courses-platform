import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMyCertificates, verifyCertificate } from '@/services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { getCategoryMeta } from '@/lib/course-meta'
import { formatDate } from '@/utils'
import {
    Award,
    BadgeCheck,
    BookOpen,
    CalendarDays,
    Copy,
    GraduationCap,
    Search,
    ShieldCheck,
    Sparkles
} from 'lucide-react'
import { toast } from 'sonner'


function CertificatesSkeleton() {
    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-xl border bg-card">
                    <Skeleton className="h-36 w-full" />
                    <div className="space-y-3 p-5">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                </div>
            ))}
        </div>
    )
}

function MyCertificatesPage() {
    const navigate = useNavigate()
    const [certificates, setCertificates] = useState([])
    const [loading, setLoading] = useState(true)
    const [lookupCode, setLookupCode] = useState('')
    const [verifying, setVerifying] = useState(false)

    useEffect(() => {
        let cancelled = false

        async function load() {
            setLoading(true)

            try {
                const response = await getMyCertificates()
                if (!cancelled && response?.success) {
                    setCertificates(response.data || [])
                }
            } catch {
                if (!cancelled) toast.error('Could not load your certificates')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()

        return () => {
            cancelled = true
        }
    }, [])

    const latest = useMemo(() => certificates[0] || null, [certificates])

    function handleCopyLink(code) {
        const url = `${window.location.origin}/certificate/${code}`
        navigator.clipboard?.writeText(url)
            .then(() => toast.success('Certificate link copied'))
            .catch(() => toast.error('Could not copy the link'))
    }

    async function handleVerify(event) {
        event.preventDefault()
        const code = lookupCode.trim().toUpperCase()

        if (!code) {
            toast.error('Enter a certificate code first')
            return
        }

        try {
            setVerifying(true)
            const response = await verifyCertificate(code)
            if (response?.success) {
                navigate(`/certificate/${encodeURIComponent(code)}`)
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Certificate not found')
        } finally {
            setVerifying(false)
        }
    }

    return (
        <div className="bg-background">
            <section className="relative overflow-hidden border-b bg-brand-gradient text-white">
                <div className="absolute inset-0 bg-dot-grid opacity-20" />
                <div className="container-page relative flex flex-col justify-between gap-6 py-10 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Your achievements</p>
                        <h1 className="mt-2 flex items-center gap-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                            <Award className="h-8 w-8" />
                            Certificates
                        </h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
                            Every certificate is permanent, verifiable, and ready to share with employers or your network.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                        onClick={() => navigate('/acquired-courses')}
                    >
                        <BookOpen className="h-4 w-4" />
                        My learning
                    </Button>
                </div>
            </section>

            <div className="container-page py-8 lg:py-10">
                {loading ? (
                    <CertificatesSkeleton />
                ) : certificates.length > 0 ? (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-muted-foreground">
                                {certificates.length} {certificates.length === 1 ? 'certificate' : 'certificates'} earned
                            </p>
                            {latest && (
                                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                    Latest: {latest.courseTitle}
                                </p>
                            )}
                        </div>

                        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {certificates.map(certificate => {
                                const meta = getCategoryMeta(certificate.courseCategory)
                                const CategoryIcon = meta.icon

                                return (
                                    <article
                                        key={certificate.code}
                                        className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
                                    >
                                        <div className="relative overflow-hidden bg-brand-gradient px-5 py-6 text-white">
                                            <GraduationCap className="absolute -right-4 -top-4 h-24 w-24 text-white/10" />
                                            <div className="relative flex items-start justify-between gap-3">
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-inset ring-white/25">
                                                    <Award className="h-5 w-5" />
                                                </span>
                                                <span className="flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-100 ring-1 ring-inset ring-emerald-300/30">
                                                    <BadgeCheck className="h-3 w-3" />
                                                    Verified
                                                </span>
                                            </div>
                                            <p className="relative mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">
                                                Certificate of completion
                                            </p>
                                        </div>

                                        <div className="flex flex-1 flex-col p-5">
                                            <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                                <CategoryIcon className="h-3.5 w-3.5" />
                                                {meta.label}
                                            </p>
                                            <h2 className="mt-2 line-clamp-2 text-base font-bold leading-snug">
                                                {certificate.courseTitle}
                                            </h2>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {certificate.instructorName}
                                            </p>

                                            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <CalendarDays className="h-3 w-3" />
                                                    {formatDate(certificate.issuedAt)}
                                                </span>
                                                <span className="font-mono font-semibold text-foreground/70">
                                                    {certificate.code}
                                                </span>
                                            </div>

                                            <div className="mt-4 flex items-center gap-2">
                                                <Button size="sm" className="flex-1" asChild>
                                                    <Link to={`/certificate/${certificate.code}`}>
                                                        View certificate
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    aria-label={`Copy link for ${certificate.courseTitle}`}
                                                    onClick={() => handleCopyLink(certificate.code)}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                            <Award className="h-8 w-8" />
                        </span>
                        <h2 className="mt-5 text-xl font-bold">Your first certificate is close</h2>
                        <p className="mt-2 max-w-md text-sm text-muted-foreground">
                            Finish every lecture in a course to unlock a verifiable certificate you can share anywhere.
                        </p>
                        <Button className="mt-6" onClick={() => navigate('/acquired-courses')}>
                            <BookOpen className="h-4 w-4" />
                            Continue learning
                        </Button>
                    </div>
                )}

                <section className="mt-10 rounded-2xl border bg-card p-6 shadow-sm">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-base font-bold">
                                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                Verify a certificate
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Anyone can check the authenticity of a certificate using its ID.
                            </p>
                        </div>
                        <form onSubmit={handleVerify} className="flex w-full gap-2 sm:max-w-sm">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={lookupCode}
                                    onChange={(event) => setLookupCode(event.target.value)}
                                    placeholder="EP-XXXX-XXXX"
                                    aria-label="Certificate code"
                                    className="pl-9 font-mono uppercase"
                                />
                            </div>
                            <Button type="submit" disabled={verifying}>
                                Verify
                            </Button>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default MyCertificatesPage
