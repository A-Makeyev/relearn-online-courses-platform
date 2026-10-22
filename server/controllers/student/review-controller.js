const mongoose = require("mongoose")
const Review = require("../../models/Review")
const Course = require("../../models/Course")
const StudentCourses = require("../../models/StudentCourses")


const recalculateCourseRating = async (courseId) => {
    const stats = await Review.aggregate([
        { $match: { courseId: String(courseId) } },
        {
            $group: {
                _id: null,
                average: { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ])

    const average = stats[0]?.average || 0
    const count = stats[0]?.count || 0

    await Course.findByIdAndUpdate(courseId, {
        averageRating: Math.round(average * 10) / 10,
        reviewCount: count
    })

    return { averageRating: Math.round(average * 10) / 10, reviewCount: count }
}

const getCourseReviews = async (req, res) => {
    try {
        const { courseId } = req.params

        const [reviews, summaryRows, distributionRows] = await Promise.all([
            Review.find({ courseId })
                .sort({ createdAt: -1 })
                .limit(100)
                .lean(),
            Review.aggregate([
                { $match: { courseId: String(courseId) } },
                { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
            ]),
            Review.aggregate([
                { $match: { courseId: String(courseId) } },
                { $group: { _id: '$rating', count: { $sum: 1 } } }
            ])
        ])

        const summary = summaryRows[0]
        const average = summary?.average || 0
        const reviewCount = summary?.count || 0
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

        distributionRows.forEach(row => {
            if (distribution[row._id] !== undefined) {
                distribution[row._id] = row.count
            }
        })

        res.status(200).json({
            success: true,
            data: {
                reviews,
                averageRating: Math.round(average * 10) / 10,
                reviewCount,
                distribution
            }
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

const upsertCourseReview = async (req, res) => {
    try {
        const { courseId } = req.params
        const rating = Number(req.body.rating)
        const comment = (req.body.comment || '').trim().slice(0, 2000)

        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            })
        }

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

        const acquired = await StudentCourses.findOne({
            userId: req.user._id,
            'courses.courseId': courseId
        })

        if (!acquired) {
            return res.status(403).json({
                success: false,
                message: 'You can review a course after enrolling in it'
            })
        }

        const review = await Review.findOneAndUpdate(
            { courseId, userId: req.user._id },
            {
                courseId,
                userId: req.user._id,
                userName: req.user.username,
                rating,
                comment
            },
            { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
        )

        const summary = await recalculateCourseRating(courseId)

        res.status(200).json({
            success: true,
            message: 'Thanks for sharing your feedback',
            data: { review, ...summary }
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

module.exports = {
    getCourseReviews,
    upsertCourseReview,
    recalculateCourseRating
}
