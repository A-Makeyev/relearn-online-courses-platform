const User = require("../../models/User")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../helpers/jwt')


const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const publicUser = (user) => ({
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
})

const registerUser = async (req, res) => {
    try {
        const username = (req.body.username || '').trim()
        const email = (req.body.email || '').trim().toLowerCase()
        const password = req.body.password || ''

        if (username.length < 2 || username.length > 40) {
            return res.status(400).json({
                success: false,
                message: 'Username must be between 2 and 40 characters'
            })
        }

        if (!EMAIL_PATTERN.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            })
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            })
        }

        const user = await User.findOne({
            $or: [{ username }, { email }]
        })

        if (user) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            // Accounts always start as students. Instructor access is provisioned
            // by an administrator or through the seed data.
            role: 'student'
        })
        await newUser.save()

        return res.status(201).json({
            success: true,
            message: 'Your account has been created'
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

const loginUser = async (req, res) => {
    try {
        const email = (req.body.email || '').trim().toLowerCase()
        const password = req.body.password || ''

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            })
        }

        const user = await User.findOne({ email })

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: 'Email or password do not match'
            })
        }

        const accessToken = jwt.sign({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${user.username}`,
            data: {
                accessToken,
                user: publicUser(user)
            }
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

module.exports = { registerUser, loginUser }
