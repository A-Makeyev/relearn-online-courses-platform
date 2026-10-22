import { useContext, useRef } from "react"
import { InstructorContext } from "@/context/instructor"
import { uploadMedia, bulkUploadMedia, deleteMedia } from "@/services"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollText, Upload } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from "@/components/ui/dialog"
import MediaProgressBar from "@/components/media-progress-bar"
import VideoPlayer from "@/components/video-player"
import { toast } from "sonner"


function CourseCurriculum() {
    const {
        courseCurriculumFormData,
        setCourseCurriculumFormData,
        mediaUploadProgressPercentage,
        setMediaUploadProgressPercentage,
        mediaUploadProgress,
        setMediaUploadProgress
    } = useContext(InstructorContext)
    const bulkUploadRef = useRef(null)

    function handleNewLacture() {
        setCourseCurriculumFormData(prevState => [
            ...prevState,
            { title: '', preview: false, video_url: '', public_id: '' }
        ])

        setTimeout(() => {
            window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: 'smooth' })
        }, 100)
    }

    function handleTitleChange(event, index) {
        setCourseCurriculumFormData(prevState => {
            const newData = [...prevState]
            newData[index] = { ...newData[index], title: event.target.value }
            return newData
        })
    }

    function handlePreviewChange(value, index) {
        setCourseCurriculumFormData(prevState => {
            const newData = [...prevState]
            newData[index] = { ...newData[index], preview: value }
            return newData
        })
    }

    function isDataValid() {
        return courseCurriculumFormData.every(item => {
            return (
                item
                && typeof item === 'object'
                && item.title.trim() !== ''
                && item.video_url.trim() !== ''
            )
        })
    }

    function checkCourseCurriculumFormDataEmptyObjects(arr) {
        return arr.every(obj => {
            return Object.entries(obj).every(([, value]) => {
                if (typeof value === 'boolean') {
                    return true
                }
                return value === ''
            })
        })
    }

    async function handleBulkVideosUpload(event) {
        setMediaUploadProgress(true)

        const files = Array.from(event.target.files)
        if (files.length === 0) return

        const videosFormData = new FormData()
        files.forEach(file => videosFormData.append('files', file))

        try {
            const response = await bulkUploadMedia(videosFormData, setMediaUploadProgressPercentage)

            if (response?.success) {
                setCourseCurriculumFormData(prevState => {
                    let copyCourseCurriculumFormData = checkCourseCurriculumFormDataEmptyObjects(prevState)
                        ? []
                        : [...prevState]

                    copyCourseCurriculumFormData = [
                        ...copyCourseCurriculumFormData,
                        ...response.data.map((item, index) => ({
                            title: `Lecture ${copyCourseCurriculumFormData.length + index + 1}`,
                            public_id: item.public_id,
                            video_url: item.url,
                            preview: false
                        }))
                    ]
                    return copyCourseCurriculumFormData
                })
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Something went wrong', {
                position: "top-right"
            })
        } finally {
            setMediaUploadProgress(false)

            if (event.target) {
                event.target.value = ''
            }
        }
    }

    async function handleSingleVideoUpload(event, index) {
        const video = event.target.files[0]

        if (video) {
            const videoFormData = new FormData()
            videoFormData.append('file', video)
            
            try {
                setMediaUploadProgress(true)

                const response = await uploadMedia(videoFormData, setMediaUploadProgressPercentage)
                if (response?.success) {
                    setCourseCurriculumFormData(prevState => {
                        const newData = [...prevState]
                        newData[index] = {
                            ...newData[index],
                            video_url: response?.data?.url,
                            public_id: response?.data?.public_id
                        }
                        return newData
                    })
                }
                setMediaUploadProgress(false)
            } catch (err) {
                toast.error(err?.response?.data?.message || 'Something went wrong', {
                    position: "top-right"
                })
            }
        }
    }

    async function handleVideoUrl(event, index) {
        const url = event.target.value

        setCourseCurriculumFormData(prevState => {
            const newData = [...prevState]
            newData[index] = {
                ...newData[index],
                tempUrl: url
            }
            return newData
        })
    }

    function handleApplyUrl(index) {
        const url = courseCurriculumFormData[index]?.tempUrl
        
        if (url) {
            setCourseCurriculumFormData(prevState => {
                const newData = [...prevState]
                newData[index] = {
                    ...newData[index],
                    video_url: url,
                    public_id: `url_video_${Date.now()}`,
                    tempUrl: ''
                }
                return newData
            })
        }
    }

    async function handleDeleteVideo(index) {
        const copyCourseCurriculumFormData = [...courseCurriculumFormData]
        const currentVideoPublicId = copyCourseCurriculumFormData[index].public_id
        const response = await deleteMedia(currentVideoPublicId, 'video')

        if (response?.success) {
            setCourseCurriculumFormData(prevState => {
                const newData = [...prevState]
                newData[index] = {
                    ...newData[index],
                    public_id: '',
                    video_url: ''
                }
                return newData
            })
        }
    }

    async function handleDeleteLecture(index) {
        const copyCourseCurriculumFormData = [...courseCurriculumFormData]
        const currentVideoPublicId = copyCourseCurriculumFormData[index].public_id
        const lectureTitle = copyCourseCurriculumFormData[index].title || `Lecture ${index + 1}`
        const response = await deleteMedia(currentVideoPublicId, 'video')

        if (response?.success) {
            const newCourseCurriculumFormData = copyCourseCurriculumFormData.filter((_, currentIndex) => currentIndex !== index)
            setCourseCurriculumFormData(newCourseCurriculumFormData)

            toast.success(`${lectureTitle} lecture was deleted`, {
                position: "top-right"
            })
        }
    }

    return (
        <Card className="px-4 pb-4 -mx-4 lg:-mx-0">
            <CardHeader className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-4">
                <CardTitle className="order-2 sm:order-1 text-xl font-medium mt-6 sm:mt-2">
                    Course Lectures
                </CardTitle>
                <div className="flex gap-2 order-1 sm:order-2">
                    <Input
                        multiple
                        type="file"
                        accept="video/*"
                        className="hidden"
                        id="bulk-media-upload"
                        onChange={handleBulkVideosUpload}
                        ref={bulkUploadRef}
                    />
                    <Button
                        as="label"
                        variant="outline"
                        htmlFor="bulk-media-upload"
                        className="cursor-pointer"
                        disabled={mediaUploadProgress}
                        onClick={() => bulkUploadRef.current?.click()}
                    >
                        { mediaUploadProgress ? (
                            <>
                                <LoadingSpinner />
                                <span>Uploading</span>
                            </>
                        ) : (
                            <>
                                <Upload />
                                <span>Bulk Upload</span>
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={handleNewLacture}
                        disabled={!isDataValid() || mediaUploadProgress}
                    >
                        <ScrollText />
                        Add Lecture
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 xl:gap-10">
                    { courseCurriculumFormData.map((lecture, index) => (
                        <div key={index} className="border shadow p-4 sm:p-6 -mb-2 sm:-mb-0 -mx-5 lg:-mx-3 rounded-md">
                            <div className="flex flex-col gap-5 items-start w-full">
                                <div className="flex flex-col w-full gap-5">
                                    <div className="flex items-center justify-between w-full">
                                        <h3 className="font-semibold pl-0.5">
                                            Lecture {index + 1}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id={`preview-lecture-${index + 1}`}
                                                checked={lecture?.preview}
                                                onCheckedChange={(value) => handlePreviewChange(value, index)}
                                            />
                                            <Label htmlFor={`preview-lecture-${index + 1}`}>
                                                Preview
                                            </Label>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold pl-0.5">
                                            Title
                                        </h3>
                                        <Input
                                            name={`lecture-${index + 1}`}
                                            value={lecture?.title}
                                            onChange={(event) => handleTitleChange(event, index)}
                                            placeholder="What is this lecture about?"
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                                <div className="w-full">
                                    { lecture?.video_url ? (
                                        <div className="space-y-3">
                                            <div className="w-full">
                                                <VideoPlayer
                                                    url={lecture?.video_url}
                                                    videoId={lecture?.public_id}
                                                    width="100%"
                                                    height="400px"
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <Button onClick={() => handleDeleteVideo(index)} className="flex-1">
                                                    Replace Video
                                                </Button>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="destructive" className="flex-1">
                                                            Delete Lecture
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:w-[425px]">
                                                        <DialogTitle className="font-semibold text-xl">
                                                            { lecture?.title || `Lecture ${index + 1}` }
                                                        </DialogTitle>
                                                        <DialogDescription className="text-base font-medium text-gray-900 mt-3">
                                                            Are you sure you want to delete Lecture {index + 1}?
                                                        </DialogDescription>
                                                        <div className="flex justify-end space-x-2 mt-5">
                                                            <DialogClose asChild>
                                                                <Button variant="outline">
                                                                    Cancel
                                                                </Button>
                                                            </DialogClose>
                                                            <DialogClose asChild>
                                                                <Button
                                                                    variant="destructive"
                                                                    onClick={() => handleDeleteLecture(index)}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </DialogClose>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            { mediaUploadProgress ? (
                                                <MediaProgressBar
                                                    isMediaUploading={mediaUploadProgress}
                                                    progress={mediaUploadProgressPercentage}
                                                />
                                            ) : (
                                                <div className="flex flex-col gap-4">
                                                    <h3 className="font-semibold pl-0.5">
                                                        Upload
                                                    </h3>
                                                    <div className="flex flex-col gap-4">
                                                        <Input
                                                            type="file"
                                                            accept="video/*"
                                                            onChange={(event) => handleSingleVideoUpload(event, index)}
                                                            className="cursor-pointer"
                                                        />
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <div className="h-[1px] flex-1 bg-border"></div>
                                                            <span className="text-sm text-muted-foreground">or</span>
                                                            <div className="h-[1px] flex-1 bg-border"></div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <h3 className="font-semibold pl-0.5">
                                                                Video URL
                                                            </h3>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    type="url"
                                                                    placeholder="Enter video URL"
                                                                    value={lecture?.tempUrl || ''}
                                                                    onChange={(event) => handleVideoUrl(event, index)}
                                                                    className="flex-1"
                                                                />
                                                                <Button
                                                                    onClick={() => handleApplyUrl(index)}
                                                                    disabled={!lecture?.tempUrl}
                                                                >
                                                                    Apply
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default CourseCurriculum