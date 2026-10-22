require('dotenv').config()
const path = require('path')
const cors = require('cors')
const mongoose = require('mongoose')
const express = require('express')
const authRoutes = require('./routes/auth/index')
const instructorMediaRoutes = require('./routes/instructor-routes/media-routes')
const instructorCourseRoutes = require('./routes/instructor-routes/course-routes')
const studentCourseRoutes = require('./routes/student-routes/course-routes')
const studentOrderRoutes = require('./routes/student-routes/order-routes')
const acquiredCoursesRoutes = require('./routes/student-routes/acquired-courses-routes')
const courseProgressRoutes = require('./routes/student-routes/course-progress-routes')
const wishlistRoutes = require('./routes/student-routes/wishlist-routes')
const certificateRoutes = require('./routes/certificate-routes')


const app = express()
const PORT = process.env.PORT || 5000

const allowedOrigins = (process.env.NODE_ENV === 'production'
    ? [process.env.CLIENT_PROD_URL]
    : [process.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173']).filter(Boolean)

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '1mb' }))
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    next()
})

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('>>> Connected to MongoDB'))
    .catch((err) => console.log('>>> MongoDB connection error:', err.message))

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: Math.round(process.uptime())
    })
})

app.use('/auth', authRoutes)
app.use('/media', instructorMediaRoutes)
app.use('/instructor/courses', instructorCourseRoutes)
app.use('/student/courses', studentCourseRoutes)
app.use('/student/order', studentOrderRoutes)
app.use('/student/acquired-courses', acquiredCoursesRoutes)
app.use('/student/course-progress', courseProgressRoutes)
app.use('/student/wishlist', wishlistRoutes)
app.use('/certificates', certificateRoutes)

app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found'
    })
})

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')))
    app.get('*', (request, response) => response.sendFile(path.resolve(__dirname, '../client/dist/index.html')))
} else {
    app.get('/', (request, response) => response.send('<h1 style="text-align: center; margin-top: 20%">Server is Running</h1>'))
}

app.use((err, req, res, next) => {
    console.log('🥞', err.stack)
    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    })
})

app.listen(PORT, () => {
    console.log(`>>> Server is running on port ${PORT}`)
})
