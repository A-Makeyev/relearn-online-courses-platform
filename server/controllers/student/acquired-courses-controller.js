const StudentCourses = require('../../models/StudentCourses')


const getAcquiredCourses = async (req, res) => {
    try {
        const { studentId } = req.params

        if (String(req.user._id) !== String(studentId)) {
            return res.status(403).json({
                success: false,
                message: 'You can only view your own courses'
            })
        }

        const acquiredCourses = await StudentCourses.findOne({ userId: studentId })

        if (!acquiredCourses) {
            return res.status(200).json({
                success: true,
                message: 'No Acquired Courses',
                data: []
            })
        }

        res.status(200).json({
            success: true,
            data: acquiredCourses.courses
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

module.exports = { getAcquiredCourses }
