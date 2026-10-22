const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

module.exports = { JWT_SECRET, JWT_EXPIRES_IN }
