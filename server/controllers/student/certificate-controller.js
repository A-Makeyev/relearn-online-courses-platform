const mongoose = require('mongoose')
const Certificate = require('../../models/Certificate')
const Course = require('../../models/Course')
const CourseProgress = require('../../models/CourseProgress')
const StudentCourses = require('../../models/StudentCourses')
const { issueCertificateFor } = require('../../helpers/certificate')


const publicCertificate = (certificate) => ({
    code: certificate.code,
    studentName: certificate.studentName,
    courseId: certificate.courseId,
    courseTitle: certificate.courseTitle,
    courseCategory: certificate.courseCategory,
    instructorName: certificate.instructorName,
    lectureCount: certificate.lectureCount,
    issuedAt: certificate.issuedAt,
    verified: true
})

const listMyCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({ userId: String(req.user._id) })
            .sort({ issuedAt: -1 })
            .lean()

        res.status(200).json({
            success: true,
            data: certificates.map(certificate => ({
                ...publicCertificate(certificate),
                _id: certificate._id
            }))
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

const issueMyCertificate = async (req, res) => {
    try {
        const { courseId } = req.params

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(404).json({
                success: false,
                message: 'Course Not Found'
            })
        }

        const course = await Course.findById(courseId)

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course Not Found'
            })
        }

        const enrolled = await StudentCourses.findOne({
            userId: String(req.user._id),
            'courses.courseId': courseId
        })

        if (!enrolled) {
            return res.status(403).json({
                success: false,
                message: 'Enroll in this course to earn its certificate'
            })
        }

        const progress = await CourseProgress.findOne({
            userId: String(req.user._id),
            courseId
        })

        if (!progress?.completed) {
            return res.status(400).json({
                success: false,
                message: 'Complete every lecture to unlock your certificate'
            })
        }

        const certificate = await issueCertificateFor({
            userId: req.user._id,
            studentName: req.user.username,
            course
        })

        res.status(200).json({
            success: true,
            data: publicCertificate(certificate)
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

const verifyCertificate = async (req, res) => {
    try {
        const code = String(req.params.code || '').trim().toUpperCase()

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'A certificate code is required'
            })
        }

        const certificate = await Certificate.findOne({ code }).lean()

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'We could not find a certificate with that code'
            })
        }

        res.status(200).json({
            success: true,
            data: publicCertificate(certificate)
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

module.exports = {
    listMyCertificates,
    issueMyCertificate,
    verifyCertificate
}
