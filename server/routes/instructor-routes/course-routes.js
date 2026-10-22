const { addNewCourse, getCourses, getCourseDetails, updateCourse, deleteCourse } = require('../../controllers/instructor/course-controller')
const { authenticate, authorize } = require('../../middleware/auth-middleware')
const express = require('express')


const router = express.Router()

router.use(authenticate, authorize('instructor'))

router.post('/new-course', addNewCourse)
router.get('/all-courses', getCourses)
router.get('/course-details/:id', getCourseDetails)
router.put('/update-course/:id', updateCourse)
router.delete('/delete/:id', deleteCourse)

module.exports = router
