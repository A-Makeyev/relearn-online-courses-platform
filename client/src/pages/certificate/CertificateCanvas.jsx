import { useRef } from "react"
import { toast } from "sonner"
import { DownloadButton } from "./DownloadButton"


export function CertificateCanvas({ certificateData }) {
    const canvasRef = useRef(null)

    async function handleDownload() {
        const canvas = canvasRef.current
        if (!canvas) {
            toast.error("Certificate canvas not ready")
            return
        }

        try {
            // Create canvas content programmatically
            const ctx = canvas.getContext('2d')
            
            // Set canvas size
            canvas.width = 700
            canvas.height = 450
            
            // Draw background
            ctx.fillStyle = '#1e293b'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            // Draw certificate content
            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 48px Inter, sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('Certificate of Completion', canvas.width / 2, 80)
            
            ctx.font = '24px Inter, sans-serif'
            ctx.fillStyle = '#94a3b8'
            ctx.fillText('This certificate is presented to', canvas.width / 2, 140)
            
            ctx.font = 'bold 32px Inter, sans-serif'
            ctx.fillStyle = '#ffffff'
            ctx.fillText(certificateData.name || 'Student', canvas.width / 2, 190)
            
            ctx.font = '18px Inter, sans-serif'
            ctx.fillStyle = '#94a3b8'
            ctx.fillText('for successfully completing', canvas.width / 2, 230)
            
            ctx.font = 'bold 24px Inter, sans-serif'
            ctx.fillStyle = '#c084fc'
            ctx.fillText(certificateData.courseName || 'Course Name', canvas.width / 2, 270)
            
            ctx.font = '16px Inter, sans-serif'
            ctx.fillStyle = '#64748b'
            ctx.fillText(`Instructor: ${certificateData.instructor || 'Instructor'}`, canvas.width / 2, 310)
            ctx.fillText(`Date: ${certificateData.date || ''}`, canvas.width / 2, 340)
            ctx.fillText(`Certificate ID: ${certificateData.studentId?.slice(-6) || 'N/A'}`, canvas.width / 2, 370)
            
            // Download as PNG
            const link = document.createElement('a')
            link.download = `certificate-${certificateData.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`
            link.href = canvas.toDataURL('image/png')
            link.click()

            toast.success('Certificate downloaded successfully!')
        } catch (error) {
            console.error('Download error:', error)
            toast.error('Failed to download certificate')
        }
    }

    async function handleShare() {
        const canvas = canvasRef.current
        if (!canvas) {
            toast.error('Certificate canvas not ready')
            return
        }

        try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
            if (navigator.share && blob) {
                const file = new File([blob], 'certificate.png', { type: 'image/png' })
                await navigator.share({
                    title: 'My Certificate',
                    text: `I completed ${certificateData.courseName}!`,
                    files: [file],
                })
                toast.success('Shared successfully!')
            } else if (blob) {
                // Fallback to copy
                const url = URL.createObjectURL(blob)
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob }),
                ])
                URL.revokeObjectURL(url)
                toast.success('Certificate image copied to clipboard!')
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share error:', error)
                toast.error('Failed to share certificate')
            }
        }
    }

    return (
        <div className="relative">
            {/* Certificate visual preview */}
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-8 shadow-xl">
                <div className="border-2 border-dashed border-slate-700 p-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">Certificate of Completion</h2>
                        <p className="mt-4 text-slate-400">This certificate is presented to</p>
                        <p className="mt-2 text-2xl font-bold text-white">{certificateData.name}</p>
                        <p className="mt-2 text-slate-400">for successfully completing</p>
                        <p className="mt-1 text-lg font-semibold text-purple-400">{certificateData.courseName}</p>
                        <div className="mt-6 flex justify-center gap-6 text-sm text-slate-500">
                            <p>Instructor: {certificateData.instructor}</p>
                            <p>Date: {certificateData.date}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden canvas for export */}
            <canvas
                ref={canvasRef}
                className="hidden"
                width="700"
                height="450"
            />

            {/* Download button */}
            <div className="mt-4 flex gap-3">
                <button
                    onClick={handleDownload}
                    className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 font-semibold text-white transition hover:opacity-90 hover:shadow-lg"
                >
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PNG
                </button>
                <button
                    onClick={handleShare}
                    className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 font-semibold text-slate-300 transition hover:bg-slate-700"
                >
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                </button>
            </div>
        </div>
    )
}
