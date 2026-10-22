const mongoose = require('mongoose')
const Wishlist = require('../../models/Wishlist')
const Course = require('../../models/Course')


const getWishlistIds = async (req, res) => {
    try {
        const items = await Wishlist.find({ userId: String(req.user._id) })
            .select('courseId')
            .lean()

        res.status(200).json({
            success: true,
            data: items.map(item => item.courseId)
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

const getWishlist = async (req, res) => {
    try {
        const items = await Wishlist.find({ userId: String(req.user._id) })
            .sort({ createdAt: -1 })
            .lean()

        const validIds = items
            .map(item => item.courseId)
            .filter(id => mongoose.isValidObjectId(id))

        const courses = await Course.find({
            _id: { $in: validIds },
            isPublished: { $ne: false }
        }).lean()

        const byId = new Map(courses.map(course => [String(course._id), course]))
        const data = items
            .map(item => byId.get(item.courseId))
            .filter(Boolean)

        res.status(200).json({
            success: true,
            data
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

const addToWishlist = async (req, res) => {
    try {
        const { courseId } = req.params

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(404).json({
                success: false,
                message: 'Course Not Found'
            })
        }

        const course = await Course.findById(courseId).select('_id isPublished')

        if (!course || course.isPublished === false) {
            return res.status(404).json({
                success: false,
                message: 'Course Not Found'
            })
        }

        await Wishlist.findOneAndUpdate(
            { userId: String(req.user._id), courseId },
            { userId: String(req.user._id), courseId },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        )

        res.status(200).json({
            success: true,
            message: 'Saved to your wishlist',
            data: { courseId, saved: true }
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

const removeFromWishlist = async (req, res) => {
    try {
        const { courseId } = req.params

        await Wishlist.deleteOne({ userId: String(req.user._id), courseId })

        res.status(200).json({
            success: true,
            message: 'Removed from your wishlist',
            data: { courseId, saved: false }
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

const clearWishlist = async (req, res) => {
    try {
        await Wishlist.deleteMany({ userId: String(req.user._id) })

        res.status(200).json({
            success: true,
            message: 'Wishlist cleared'
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

module.exports = {
    getWishlist,
    getWishlistIds,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
}
