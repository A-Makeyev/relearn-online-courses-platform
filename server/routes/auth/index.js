const { registerUser, loginUser } = require('../../controllers/auth')
const { authenticate } = require('../../middleware/auth-middleware')
const express = require('express')
const router = express.Router()


router.post('/register', registerUser)
router.post('/login', loginUser)

router.get('/verify', authenticate, (req, res) => {
    const user = req.user

    res.status(200).json({
        success: true,
        message: `User "${user.username}" was authenticated`,
        data: { user }
    })
})

module.exports = router
