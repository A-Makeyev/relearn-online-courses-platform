const mongoose = require('mongoose')


const WishlistSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    courseId: {
        type: String,
        required: true,
        index: true
    }
}, { timestamps: true })

WishlistSchema.index({ userId: 1, courseId: 1 }, { unique: true })

module.exports = mongoose.model('Wishlist', WishlistSchema)
