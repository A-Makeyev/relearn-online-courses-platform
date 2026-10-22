const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../helpers/jwt')


const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        })
    }

    try {
        const accessToken = authHeader.split(' ')[1]
        const payload = jwt.verify(accessToken, JWT_SECRET)

        req.user = payload
        next()
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Your session has expired. Please sign in again.'
        })
    }
}

const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'You do not have permission to perform this action'
        })
    }

    next()
}

module.exports = { authenticate, authorize }
