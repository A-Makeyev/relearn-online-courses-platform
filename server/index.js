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


const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_PROD_URL : process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('>>> Connected to MongoDB'))
    .catch((err) => console.log(err))

app.use('/auth', authRoutes)
app.use('/media', instructorMediaRoutes)
app.use('/instructor/courses', instructorCourseRoutes)
app.use('/student/courses', studentCourseRoutes)
app.use('/student/order', studentOrderRoutes)
app.use('/student/acquired-courses', acquiredCoursesRoutes)
app.use('/student/course-progress', courseProgressRoutes)

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/client/dist')))
    app.get('*', (request, response) => response.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html')))
} else {
    app.get('/', (request, response) => response.send('<h1 style="text-align: center margin-top: 20%">Server is Running</h1>'))
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