const mongoose = require("mongoose")
const Course = require("../../models/Course")
const StudentCourses = require("../../models/StudentCourses")


const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getCourses = async (req, res) => {
    try {
        const { category = [], level = [], language = [], sortBy = 'newest', search = '' } = req.query
        const filters = { isPublished: { $ne: false } }
        let params = { date: -1 }

        if (category.length) filters.category = { $in: String(category).split(',') }
        if (level.length) filters.level = { $in: String(level).split(',') }
        if (language.length) filters.language = { $in: String(language).split(',') }

        const searchTerm = String(search).trim()
        if (searchTerm) {
            const regex = new RegExp(escapeRegex(searchTerm), 'i')
            filters.$or = [
                { title: regex },
                { subtitle: regex },
                { description: regex },
                { instructorName: regex },
                { category: regex }
            ]
        }

        switch (sortBy) {
            case 'title-a-z':
                params = { title: 1 }
                break
            case 'title-z-a':
                params = { title: -1 }
                break
            case 'price-low-high':
                params = { price: 1 }
                break
            case 'price-high-low':
                params = { price: -1 }
                break
            case 'highest-rated':
                params = { averageRating: -1, reviewCount: -1 }
                break
            case 'most-reviewed':
                params = { reviewCount: -1, averageRating: -1 }
                break
            case 'newest':
            default:
                params = { date: -1 }
                break
        }

        const courses = await Course.find(filters).sort(params)

        res.status(200).json({
            success: true,
            data: courses
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

const getCourseDetails = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({
                success: false,
                message: 'Course Not Found',
                data: null,
            })
        }

        const course = await Course.findById(id)

        if (!course || course.isPublished === false) {
            return res.status(404).json({
                success: false,
                message: 'Course Not Found',
                data: null,
            })
        }

        res.status(200).json({
            success: true,
            data: course
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

const getCoursePurchaseInfo = async (req, res) => {
    try {
        const { id, studentId } = req.params

        if (String(req.user?._id) !== String(studentId)) {
            return res.status(403).json({
                success: false,
                message: 'You can only check your own enrollment'
            })
        }

        const acquiredCourses = await StudentCourses.findOne({ userId: studentId })
        const alreadyAcquiredCourse = Boolean(
            acquiredCourses?.courses?.some(item => item.courseId === id)
        )

        res.status(200).json({
            success: true,
            courseAcquired: alreadyAcquiredCourse
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

module.exports = {
    getCourses,
    getCourseDetails,
    getCoursePurchaseInfo
}
