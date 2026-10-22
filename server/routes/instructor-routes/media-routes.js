const { uploadMedia, deleteMedia } = require('../../helpers/cloudinary')
const { authenticate, authorize } = require('../../middleware/auth-middleware')
const express = require('express')
const multer = require('multer')
const fs = require('fs/promises')


const router = express.Router()
const upload = multer({ dest: 'uploads/' })

router.use(authenticate, authorize('instructor'))

const cleanupFiles = async (files = []) => {
    await Promise.all(files.filter(Boolean).map(async (file) => {
        try {
            await fs.unlink(file.path)
        } catch (err) {
            // Temporary files are best-effort cleanup only.
        }
    }))
}

router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Please choose a file to upload'
        })
    }

    try {
        const result = await uploadMedia(req.file.path)
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error uploading file'
        })
    } finally {
        await cleanupFiles([req.file])
    }
})

router.delete('/delete/:type/:id?', async (req, res) => {
    try {
        const { type, id } = req.params
        const { public_ids } = req.body

        if (!['image', 'video'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid media type. Must be "image" or "video"'
            })
        }

        let mediaToDelete = []

        if (public_ids && Array.isArray(public_ids) && public_ids.length > 0) {
            mediaToDelete = public_ids
        } else if (id) {
            mediaToDelete = [id]
        } else {
            return res.status(400).json({
                success: false,
                message: 'Asset id(s) are required'
            })
        }

        const result = await deleteMedia(mediaToDelete, type)
        res.status(200).json({
            success: true,
            data: result,
            message: 'Deleted Media'
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error deleting file'
        })
    }
})

router.post('/bulk-upload', upload.array('files', 10), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please choose at least one file to upload'
        })
    }

    try {
        const uploads = req.files.map(file => uploadMedia(file.path))
        const result = await Promise.all(uploads)

        res.status(200).json({
            success: true,
            data: result
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error uploading files'
        })
    } finally {
        await cleanupFiles(req.files)
    }
})

module.exports = router
