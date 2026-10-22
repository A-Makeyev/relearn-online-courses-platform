const mongoose = require("mongoose")
const Course = require("../../models/Course")
const Progress = require("../../models/CourseProgress")
const StudentCourses = require("../../models/StudentCourses")
const Review = require("../../models/Review")


const EDITABLE_FIELDS = [
    'title',
    'category',
    'level',
    'language',
    'subtitle',
    'description',
    'image_url',
    'public_id',
    'welcomeMessage',
    'price',
    'objectives',
    'isPublished',
    'curriculum'
]

const pickEditableFields = (payload = {}) => EDITABLE_FIELDS.reduce((acc, field) => {
    if (payload[field] !== undefined) {
        acc[field] = field === 'price' ? Number(payload[field]) : payload[field]
    }
    return acc
}, {})

const addNewCourse = async (req, res) => {
    try {
        const data = req.body

        if (!data?.title || !data?.category || !data?.level || !data?.language) {
            return res.status(400).json({
                success: false,
                message: 'Title, category, level and language are required'
            })
        }

        if (data.price === undefined || Number(data.price) < 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid price'
            })
        }

        if (!Array.isArray(data.curriculum) || data.curriculum.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Add at least one lecture before publishing a course'
            })
        }

        const course = new Course({
            ...pickEditableFields(data),
            instructorId: req.user._id,
            instructorName: req.user.username,
            date: new Date(),
            isPublished: data.isPublished !== false
        })
        const newCourse = await course.save()

        res.status(201).json({
            success: true,
            message: 'Course created',
            data: newCourse
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({}).sort({ date: -1 })

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
                message: 'Course Not Found'
            })
        }

        const course = await Course.findById(id)

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course Not Found'
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

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params
        const newCourseData = req.body

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({
                success: false,
                message: 'Course Not Found'
            })
        }

        const existingCourse = await Course.findById(id)

        if (!existingCourse) {
            return res.status(404).json({
                success: false,
                message: 'Course Not Found'
            })
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            {
                ...pickEditableFields(newCourseData),
                // Ownership and aggregate stats are decided by the server,
                // never by the client payload.
                instructorId: existingCourse.instructorId,
                instructorName: existingCourse.instructorName
            },
            { new: true, runValidators: true }
        )

        res.status(200).json({
            success: true,
            message: 'Course updated',
            data: updatedCourse
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({
                success: false,
                message: 'Course Not Found'
            })
        }

        const course = await Course.findById(id)

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course Not Found'
            })
        }

        await Course.deleteOne({ _id: id })
        await StudentCourses.updateMany(
            { 'courses.courseId': id },
            { $pull: { courses: { courseId: id } } }
        )
        await Progress.deleteMany({ courseId: id })
        await Review.deleteMany({ courseId: id })

        res.status(200).json({
            success: true,
            message: `Deleted Course ${course.title}`
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

module.exports = {
    addNewCourse,
    getCourses,
    getCourseDetails,
    updateCourse,
    deleteCourse
}
