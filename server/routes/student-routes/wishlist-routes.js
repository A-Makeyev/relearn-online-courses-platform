const {
    getWishlist,
    getWishlistIds,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
} = require('../../controllers/student/wishlist-controller')
const { authenticate } = require('../../middleware/auth-middleware')
const express = require('express')


const router = express.Router()

router.use(authenticate)

router.get('/', getWishlist)
router.get('/ids', getWishlistIds)
router.delete('/', clearWishlist)
router.post('/:courseId', addToWishlist)
router.delete('/:courseId', removeFromWishlist)

module.exports = router
