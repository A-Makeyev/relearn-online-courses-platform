const { getAcquiredCourses } = require('../../controllers/student/acquired-courses-controller')
const { authenticate } = require('../../middleware/auth-middleware')
const express = require('express')


const router = express.Router()

router.get('/:studentId', authenticate, getAcquiredCourses)

module.exports = router
