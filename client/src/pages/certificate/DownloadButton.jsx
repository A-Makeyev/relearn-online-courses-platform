// This file is no longer needed - functionality moved to CertificateCanvas.jsx
// Kept for backwards compatibility
export {} 


export function DownloadButton({ certificateData, canvasRef }) {
    const navigate = useNavigate()

    async function handleDownload() {
        const canvas = canvasRef.current
        if (!canvas) {
            toast.error("Certificate canvas not ready")
            return
        }

        try {
            // Download as PNG
            const link = document.createElement("a")
            link.download = `certificate-${certificateData.name.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.png`
            link.href = canvas.toDataURL("image/png")
            link.click()

            toast.success("Certificate downloaded successfully!")
        } catch (error) {
            console.error("Download error:", error)
            toast.error("Failed to download certificate")
        }
    }

    async function handlePrint() {
        // For print functionality, we could use window.print()
        // But since react-to-print handles this, we'll just show a toast
        toast.success("Opening print dialog...")
        setTimeout(() => window.print(), 500)
    }

    async function handleShare() {
        const canvas = canvasRef.current
        if (!canvas) {
            toast.error("Certificate canvas not ready")
            return
        }

        try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"))
            if (navigator.share && blob) {
                const file = new File([blob], "certificate.png", { type: "image/png" })
                await navigator.share({
                    title: "My Certificate",
                    text: `I completed ${certificateData.courseName}!`,
                    files: [file],
                })
                toast.success("Shared successfully!")
            } else if (blob) {
                // Fallback to copy
                const url = URL.createObjectURL(blob)
                await navigator.clipboard.write([
                    new ClipboardItem({ "image/png": blob }),
                ])
                URL.revokeObjectURL(url)
                toast.success("Certificate image copied to clipboard!")
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("Share error:", error)
                toast.error("Failed to share certificate")
            }
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <Button
                onClick={handleDownload}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
            >
                <Download className="mr-2 h-4 w-4" />
                Download PNG
            </Button>

            <Button
                onClick={handleShare}
                variant="outline"
                className="w-full border-slate-600 hover:bg-slate-800"
            >
                <Share2 className="mr-2 h-4 w-4" />
                Share Certificate
            </Button>

            <Button
                onClick={() => navigate("/student/courses")}
                variant="ghost"
                className="w-full text-slate-400 hover:text-white"
            >
                <CreditCard className="mr-2 h-4 w-4" />
                Back to Courses
            </Button>
        </div>
    )
}
