const Notes = require("../../models/Notes")

// @desc    Get all notes for a user/course
// @route   GET /api/student/notes
// @access  Private
const getNotes = async (req, res) => {
    try {
        const { courseId } = req.query
        const userId = req.userId

        const query = { userId }
        if (courseId) query.courseId = courseId

        const notes = await Notes.find(query).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            data: notes
        })
    } catch (error) {
        console.error("Get notes error:", error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch notes"
        })
    }
}

// @desc    Create a new note
// @route   POST /api/student/notes
// @access  Private
const createNote = async (req, res) => {
    try {
        const { courseId, lectureId, content } = req.body
        const userId = req.userId

        if (!courseId || !content) {
            return res.status(400).json({
                success: false,
                message: "Course ID and content are required"
            })
        }

        const note = await Notes.create({
            userId,
            courseId,
            lectureId,
            content
        })

        res.status(201).json({
            success: true,
            data: note
        })
    } catch (error) {
        console.error("Create note error:", error)
        res.status(500).json({
            success: false,
            message: "Failed to create note"
        })
    }
}

// @desc    Update a note
// @route   PUT /api/student/notes/:id
// @access  Private
const updateNote = async (req, res) => {
    try {
        const { id } = req.params
        const { content } = req.body
        const userId = req.userId

        let note = await Notes.findById(id)

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            })
        }

        // Verify ownership
        if (note.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this note"
            })
        }

        note.content = content
        note.updatedAt = new Date()
        await note.save()

        res.status(200).json({
            success: true,
            data: note
        })
    } catch (error) {
        console.error("Update note error:", error)
        res.status(500).json({
            success: false,
            message: "Failed to update note"
        })
    }
}

// @desc    Delete a note
// @route   DELETE /api/student/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const note = await Notes.findById(id)

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            })
        }

        // Verify ownership
        if (note.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this note"
            })
        }

        await Notes.findByIdAndDelete(id)

        res.status(200).json({
            success: true,
            message: "Note deleted"
        })
    } catch (error) {
        console.error("Delete note error:", error)
        res.status(500).json({
            success: false,
            message: "Failed to delete note"
        })
    }
}

module.exports = {
    getNotes,
    createNote,
    updateNote,
    deleteNote
}
