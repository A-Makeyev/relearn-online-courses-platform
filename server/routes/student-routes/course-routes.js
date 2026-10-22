const { getCourses, getCourseDetails, getCoursePurchaseInfo } = require('../../controllers/student/course-controller')
const { getCourseReviews, upsertCourseReview } = require('../../controllers/student/review-controller')
const { authenticate } = require('../../middleware/auth-middleware')
const express = require('express')


const router = express.Router()

router.get('/all-courses', getCourses)
router.get('/course-details/:id', getCourseDetails)
router.get('/purchase-info/:id/:studentId', authenticate, getCoursePurchaseInfo)
router.get('/:courseId/reviews', getCourseReviews)
router.post('/:courseId/reviews', authenticate, upsertCourseReview)

module.exports = router
