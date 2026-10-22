const mongoose = require("mongoose")
const paypal = require("../../helpers/paypal")
const Order = require("../../models/Order")
const Course = require("../../models/Course")
const StudentCourses = require("../../models/StudentCourses")


const createPaypalPayment = (paymentJson) => new Promise((resolve, reject) => {
    paypal.payment.create(paymentJson, (err, paymentInfo) => {
        if (err) return reject(err)
        resolve(paymentInfo)
    })
})

const executePaypalPayment = (paymentId, payerId) => new Promise((resolve, reject) => {
    paypal.payment.execute(paymentId, { payer_id: payerId }, (err, paymentInfo) => {
        if (err) return reject(err)
        resolve(paymentInfo)
    })
})

const buildOrderData = (course, user) => ({
    userId: String(user._id),
    userName: user.username,
    userEmail: user.email,
    orderDate: new Date(),
    instructorId: course.instructorId,
    instructorName: course.instructorName,
    courseImage: course.image_url,
    courseTitle: course.title,
    courseId: String(course._id),
    coursePrice: Number(course.price || 0).toFixed(2),
    courseCategory: course.category
})

const enrollStudent = async (order) => {
    const studentCourses = await StudentCourses.findOne({ userId: order.userId })

    if (studentCourses) {
        const alreadyThere = studentCourses.courses.some(
            item => item.courseId === order.courseId
        )

        if (!alreadyThere) {
            studentCourses.courses.push({
                courseId: order.courseId,
                title: order.courseTitle,
                instructorId: order.instructorId,
                instructorName: order.instructorName,
                purchaseDate: order.orderDate,
                courseImage: order.courseImage,
                courseCategory: order.courseCategory
            })
            await studentCourses.save()
        }
    } else {
        await new StudentCourses({
            userId: order.userId,
            courses: [
                {
                    courseId: order.courseId,
                    title: order.courseTitle,
                    instructorId: order.instructorId,
                    instructorName: order.instructorName,
                    purchaseDate: order.orderDate,
                    courseImage: order.courseImage,
                    courseCategory: order.courseCategory
                }
            ]
        }).save()
    }

    const course = await Course.findById(order.courseId)
    const alreadyEnrolled = course?.students?.some(
        student => student.studentId === order.userId
    )

    if (course && !alreadyEnrolled) {
        course.students.push({
            studentId: order.userId,
            studentName: order.userName,
            studentEmail: order.userEmail,
            paidAmount: order.coursePrice
        })
        await course.save()
    }
}

const createOrder = async (req, res) => {
    try {
        const { courseId } = req.body

        if (!courseId || !mongoose.isValidObjectId(courseId)) {
            return res.status(400).json({
                success: false,
                message: 'A valid course is required to create an order'
            })
        }

        const course = await Course.findById(courseId)

        if (!course || course.isPublished === false) {
            return res.status(404).json({
                success: false,
                message: 'Course Not Found'
            })
        }

        const alreadyEnrolled = await StudentCourses.findOne({
            userId: req.user._id,
            'courses.courseId': courseId
        })

        if (alreadyEnrolled) {
            return res.status(400).json({
                success: false,
                message: 'You are already enrolled in this course'
            })
        }

        const coursePrice = Number(course.price || 0)

        // Free courses skip PayPal entirely and enroll immediately.
        if (coursePrice <= 0) {
            const freeOrder = new Order({
                ...buildOrderData(course, req.user),
                paymentId: 'free',
                payerId: 'free',
                paymentMethod: 'free',
                paymentStatus: 'paid',
                orderStatus: 'confirmed'
            })

            await freeOrder.save()
            await enrollStudent(freeOrder)

            return res.status(201).json({
                success: true,
                message: 'You are enrolled',
                data: {
                    free: true,
                    courseId: String(course._id),
                    orderId: freeOrder._id
                }
            })
        }

        const clientUrl = process.env.NODE_ENV === 'production'
            ? process.env.CLIENT_PROD_URL
            : process.env.CLIENT_URL

        const createPaymentJson = {
            intent: 'sale',
            payer: {
                payment_method: 'paypal',
            },
            redirect_urls: {
                return_url: `${clientUrl}/payment-return`,
                cancel_url: `${clientUrl}/payment-cancel`,
            },
            transactions: [
                {
                    item_list: {
                        items: [
                            {
                                name: course.title,
                                sku: String(course._id),
                                price: coursePrice.toFixed(2),
                                currency: 'ILS',
                                quantity: 1,
                            },
                        ],
                    },
                    amount: {
                        currency: 'ILS',
                        total: coursePrice.toFixed(2)
                    },
                    description: course.category
                }
            ]
        }

        const paymentInfo = await createPaypalPayment(createPaymentJson)
        const approvalUrl = paymentInfo.links?.find(link => link.rel === 'approval_url')?.href

        if (!approvalUrl) {
            return res.status(502).json({
                success: false,
                message: 'Could not start the payment. Please try again.'
            })
        }

        const order = new Order({
            ...buildOrderData(course, req.user),
            paymentMethod: 'paypal',
            paymentStatus: 'initiated',
            orderStatus: 'pending'
        })

        await order.save()

        res.status(201).json({
            success: true,
            data: {
                approvalUrl,
                orderId: order._id,
            }
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Could not create your order. Please try again.'
        })
    }
}

const capturePaymentAndFinalizeOrder = async (req, res) => {
    try {
        const { paymentId, payerId, orderId } = req.body

        if (!paymentId || !payerId || !orderId || !mongoose.isValidObjectId(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment details'
            })
        }

        const order = await Order.findById(orderId)

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order Not Found'
            })
        }

        if (String(order.userId) !== String(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'This order belongs to another account'
            })
        }

        // PayPal can call the return URL more than once. Treat an already
        // confirmed order as success instead of enrolling the student twice.
        if (order.paymentStatus === 'paid') {
            return res.status(200).json({
                success: true,
                message: 'Order already confirmed',
                data: order
            })
        }

        const paymentInfo = await executePaypalPayment(paymentId, payerId)

        if (paymentInfo?.state !== 'approved') {
            return res.status(402).json({
                success: false,
                message: 'Payment was not approved'
            })
        }

        order.paymentStatus = 'paid'
        order.orderStatus = 'confirmed'
        order.paymentId = paymentId
        order.payerId = payerId
        await order.save()

        await enrollStudent(order)

        res.status(200).json({
            success: true,
            message: 'Order Confirmed',
            data: order
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Could not confirm your payment. Please contact support.'
        })
    }
}

const getInstructorOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            instructorId: String(req.user._id),
            orderStatus: 'confirmed'
        })
            .sort({ orderDate: -1 })
            .lean()

        const totalRevenue = orders.reduce((sum, order) => {
            return sum + Number(order.coursePrice || 0)
        }, 0)

        res.status(200).json({
            success: true,
            data: {
                orders,
                totalRevenue,
                orderCount: orders.length
            }
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

module.exports = {
    createOrder,
    capturePaymentAndFinalizeOrder,
    getInstructorOrders
}
