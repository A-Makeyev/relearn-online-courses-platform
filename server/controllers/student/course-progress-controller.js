const mongoose = require("mongoose")
const Course = require("../../models/Course")
const StudentCourses = require("../../models/StudentCourses")
const CourseProgress = require("../../models/CourseProgress")
const Certificate = require("../../models/Certificate")
const { issueCertificateFor } = require("../../helpers/certificate")


const isAcquired = async (userId, courseId) => {
    const acquiredCourses = await StudentCourses.findOne({ userId })
    return Boolean(acquiredCourses?.courses?.some(item => item.courseId === courseId))
}

const getCourseProgress = async (req, res) => {
    try {
        const { userId, courseId } = req.params

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(404).json({
                success: false,
                message: 'Course Not Found'
            })
        }

        if (String(req.user._id) !== String(userId)) {
            return res.status(403).json({
                success: false,
                message: 'You can only view your own progress'
            })
        }

        const courseAcquired = await isAcquired(userId, courseId)

        if (!courseAcquired) {
            return res.status(200).json({
                success: true,
                message: 'Course Not Acquired',
                data: {
                    courseAcquired: false
                }
            })
        }

        const course = await Course.findById(courseId)

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course Not Found'
            })
        }

        const courseProgress = await CourseProgress.findOne({ userId, courseId })

        if (!courseProgress) {
            return res.status(200).json({
                success: true,
                message: 'No Course Progress',
                data: {
                    courseAcquired: true,
                    courseDetails: course,
                    lastViewedLecture: course.curriculum[0]?._id || null,
                    progress: []
                }
            })
        }

        const certificate = courseProgress.completed
            ? await Certificate.findOne({ userId, courseId }).select('code').lean()
            : null

        res.status(200).json({
            success: true,
            data: {
                courseAcquired: true,
                courseDetails: course,
                progress: courseProgress.lectureProgress,
                lastViewedLecture: courseProgress.lastViewedLecture,
                completionDate: courseProgress.completionDate,
                completed: courseProgress.completed,
                certificateCode: certificate?.code || null
            }
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

const resetCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.user._id

        const progress = await CourseProgress.findOne({ userId, courseId })

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'No Course Progress'
            })
        }

        progress.completed = false
        progress.completionDate = null
        progress.lastViewedLecture = null
        progress.lectureProgress = []
        await progress.save()

        res.status(200).json({
            success: true,
            message: 'Course Progress Reset',
            data: progress
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

const lastViewedLecture = async (req, res) => {
    try {
        const { courseId, lectureId } = req.body
        const userId = req.user._id

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(404).json({
                success: false,
                message: 'Course Not Found'
            })
        }

        const courseAcquired = await isAcquired(userId, courseId)

        if (!courseAcquired) {
            return res.status(200).json({
                success: true,
                message: 'Course Not Acquired',
                data: {
                    courseAcquired: false
                }
            })
        }

        const course = await Course.findById(courseId)

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course Not Found'
            })
        }

        let progress = await CourseProgress.findOne({ userId, courseId })

        if (!progress) {
            progress = new CourseProgress({
                userId,
                courseId,
                lastViewedLecture: lectureId,
                completed: false,
                completionDate: null,
                lectureProgress: []
            })
            await progress.save()
        } else {
            progress.lastViewedLecture = lectureId
            await progress.save()
        }

        res.status(200).json({
            success: true,
            data: {
                courseAcquired: true,
                progress
            }
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

const viewLecture = async (req, res) => {
    try {
        const { courseId, lectureId } = req.body
        const userId = req.user._id

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(404).json({
                success: false,
                message: 'Course Not Found'
            })
        }

        const courseAcquired = await isAcquired(userId, courseId)

        if (!courseAcquired) {
            return res.status(403).json({
                success: false,
                message: 'Please enroll in this course to track your progress'
            })
        }

        let progress = await CourseProgress.findOne({ userId, courseId })

        if (!progress) {
            progress = new CourseProgress({
                userId,
                courseId,
                lastViewedLecture: lectureId,
                lectureProgress: [{
                    lectureId,
                    viewed: true,
                    dateViewed: new Date()
                }]
            })
            await progress.save()
        } else {
            const lectureProgress = progress.lectureProgress.find(item => item.lectureId === lectureId)

            if (lectureProgress) {
                lectureProgress.viewed = true
                lectureProgress.dateViewed = new Date()
            } else {
                progress.lectureProgress.push({
                    lectureId,
                    viewed: true,
                    dateViewed: new Date()
                })
            }
            progress.lastViewedLecture = lectureId
            await progress.save()
        }

        const course = await Course.findById(courseId)

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course Not Found'
            })
        }

        const allLecturesViewed = progress.lectureProgress.length === course.curriculum.length
            && progress.lectureProgress.every(item => item.viewed)

        if (allLecturesViewed && !progress.completed) {
            progress.completed = true
            progress.completionDate = new Date()
            await progress.save()
        }

        const certificate = progress.completed
            ? await issueCertificateFor({
                userId,
                studentName: req.user.username,
                course
            })
            : null

        res.status(200).json({
            success: true,
            data: {
                ...progress.toObject(),
                certificateCode: certificate?.code || null
            }
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

module.exports = {
    getCourseProgress,
    resetCourseProgress,
    lastViewedLecture,
    viewLecture
}
