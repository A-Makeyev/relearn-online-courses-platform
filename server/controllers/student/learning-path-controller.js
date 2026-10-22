const LearningPath = require("../../models/LearningPath")
const LearningPathEnrollment = require("../../models/LearningPathEnrollment")
const CourseProgress = require("../../models/CourseProgress")

// @desc    Get all learning paths
// @route   GET /api/student/learning-paths
// @access  Private
const getLearningPaths = async (req, res) => {
    try {
        const paths = await LearningPath.find().sort({ createdAt: -1 })
        
        res.status(200).json({
            success: true,
            data: paths
        })
    } catch (error) {
        console.error("Get learning paths error:", error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch learning paths"
        })
    }
}

// @desc    Get single learning path
// @route   GET /api/student/learning-paths/:pathId
// @access  Private
const getLearningPath = async (req, res) => {
    try {
        const { pathId } = req.params
        const userId = req.userId
        
        const path = await LearningPath.findById(pathId)
        
        if (!path) {
            return res.status(404).json({
                success: false,
                message: "Learning path not found"
            })
        }
        
        // Get enrollment if exists
        const enrollment = await LearningPathEnrollment.findOne({ pathId, userId })
        
        res.status(200).json({
            success: true,
            data: {
                ...path.toObject(),
                enrollment: enrollment ? {
                    progress: enrollment.progress,
                    completedCourses: enrollment.completedCourses,
                    activeCourseId: enrollment.activeCourseId,
                    startedAt: enrollment.startedAt,
                    completedAt: enrollment.completedAt
                } : null
            }
        })
    } catch (error) {
        console.error("Get learning path error:", error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch learning path"
        })
    }
}

// @desc    Enroll in learning path
// @route   POST /api/student/learning-paths/:pathId/enroll
// @access  Private
const enrollInPath = async (req, res) => {
    try {
        const { pathId } = req.params
        const userId = req.userId
        
        // Enroll user
        await LearningPath.enrollUser(pathId, userId)
        
        // Create enrollment record
        const enrollment = await LearningPathEnrollment.findOneAndUpdate(
            { pathId, userId },
            { pathId, userId },
            { upsert: true, new: true }
        )
        
        // Get updated path with enrollment
        const path = await LearningPath.findById(pathId)
        const updatedEnrollment = await LearningPathEnrollment.findOne({ pathId, userId })
        
        res.status(200).json({
            success: true,
            data: {
                ...path.toObject(),
                enrollment: updatedEnrollment ? {
                    progress: updatedEnrollment.progress,
                    completedCourses: updatedEnrollment.completedCourses,
                    activeCourseId: updatedEnrollment.activeCourseId,
                    startedAt: updatedEnrollment.startedAt,
                    completedAt: updatedEnrollment.completedAt
                } : null
            },
            message: "Enrolled in learning path"
        })
    } catch (error) {
        console.error("Enroll in path error:", error)
        res.status(500).json({
            success: false,
            message: "Failed to enroll in learning path"
        })
    }
}

// @desc    Update path progress
// @route   POST /api/student/learning-paths/:pathId/progress
// @access  Private
const updatePathProgress = async (req, res) => {
    try {
        const { pathId } = req.params
        const userId = req.userId
        const { courseId, completed } = req.body
        
        const enrollment = await LearningPathEnrollment.findOne({ pathId, userId })
        
        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "Not enrolled in this learning path"
            })
        }
        
        if (completed) {
            // Add to completed courses if not already
            if (!enrollment.completedCourses.includes(courseId)) {
                enrollment.completedCourses.push(courseId)
            }
        } else {
            // Remove from completed if marking incomplete
            enrollment.completedCourses = enrollment.completedCourses.filter(id => id !== courseId)
        }
        
        // Calculate progress
        const path = await LearningPath.findById(pathId)
        const totalCourses = path.courses.length
        const completedCourses = enrollment.completedCourses.length
        enrollment.progress = Math.round((completedCourses / totalCourses) * 100)
        
        // Check if all courses completed
        if (enrollment.progress === 100) {
            enrollment.completedAt = new Date()
        } else {
            enrollment.completedAt = null
        }
        
        // Set active course
        if (completed && !enrollment.activeCourseId) {
            // Find next incomplete course
            const nextCourse = path.courses.find(c => !enrollment.completedCourses.includes(c.courseId))
            if (nextCourse) {
                enrollment.activeCourseId = nextCourse.courseId
            }
        }
        
        await enrollment.save()
        
        res.status(200).json({
            success: true,
            data: {
                progress: enrollment.progress,
                completedCourses: enrollment.completedCourses.length,
                totalCourses,
                completedAt: enrollment.completedAt
            }
        })
    } catch (error) {
        console.error("Update path progress error:", error)
        res.status(500).json({
            success: false,
            message: "Failed to update path progress"
        })
    }
}

// @desc    Get user's enrolled learning paths
// @route   GET /api/student/learning-paths/enrolled
// @access  Private
const getEnrolledPaths = async (req, res) => {
    try {
        const userId = req.userId
        
        const enrollments = await LearningPathEnrollment.find({ userId })
        
        const paths = []
        for (const enrollment of enrollments) {
            const path = await LearningPath.findById(enrollment.pathId)
            if (path) {
                paths.push({
                    ...path.toObject(),
                    enrollment: {
                        progress: enrollment.progress,
                        completedCourses: enrollment.completedCourses,
                        activeCourseId: enrollment.activeCourseId,
                        startedAt: enrollment.startedAt,
                        completedAt: enrollment.completedAt
                    }
                })
            }
        }
        
        res.status(200).json({
            success: true,
            data: paths
        })
    } catch (error) {
        console.error("Get enrolled paths error:", error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch enrolled paths"
        })
    }
}

module.exports = {
    getLearningPaths,
    getLearningPath,
    enrollInPath,
    updatePathProgress,
    getEnrolledPaths
}
