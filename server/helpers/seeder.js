const User = require("../models/User.js")
const Order = require("../models/Order.js")
const Course = require("../models/Course.js")
const CourseProgress = require("../models/CourseProgress.js")
const StudentCourses = require("../models/StudentCourses.js")
const courses = require("../helpers/data/courses.js")
const users = require("../helpers/data/users.js")
const readline = require("readline")


require('dotenv').config()
require('mongoose').connect(process.env.MONGODB_URI)

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const confirmAction = (message, callback) => {
    rl.question(`${message} (y/n): `, (answer) => {
        if (answer.toLowerCase().trim() === 'y') {
            callback()
        } else {
            process.exit()
        }
    })
}

const importData = async () => {
    try {
        const userCount = await User.countDocuments()
        const courseCount = await Course.countDocuments()

        if (userCount > 0 || courseCount > 0) {
            confirmAction('❗ Are you sure you want to import new data? This will overwrite existing data', async () => {
                try {
                    await User.deleteMany()
                    await Order.deleteMany()
                    await Course.deleteMany()
                    await StudentCourses.deleteMany()
                    await CourseProgress.deleteMany()

                    await User.insertMany(users)
                    await Course.insertMany(courses)

                    console.log('✔️  DATA OVERWRITTEN')
                    process.exit()
                } catch (err) {
                    console.log(err)
                    process.exit(1)
                }
            })
        } else {
            await User.insertMany(users)
            await Course.insertMany(courses)

            console.log('✔️  DATA IMPORTED')
            process.exit()
        }
    } catch (err) {
        console.log(err)
        process.exit(1)
    }
}

const destroyData = async () => {
    try {
        const userCount = await User.countDocuments()
        const courseCount = await Course.countDocuments()

        if (userCount === 0 && courseCount === 0) {
            console.log('Database is empty')
            process.exit()
            return
        }
        confirmAction('❗ Are you sure you want to delete everything from the database?', async () => {
            confirmAction('❗ This cannot be undone. Proceed? ', async () => {
                await User.deleteMany()
                await Order.deleteMany()
                await Course.deleteMany()
                await StudentCourses.deleteMany()
                await CourseProgress.deleteMany()
        
                console.log('✔️  DATA DESTROYED')
                process.exit()
            })
        })
    } catch (err) {
        console.log(err)
        process.exit(1)
    }
}

if (process.argv[2] === '-d') {
    destroyData() // npm run destroy-data
} else {
    importData() // npm run import-data
}
