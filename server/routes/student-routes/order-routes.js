const { createOrder, capturePaymentAndFinalizeOrder, getInstructorOrders } = require('../../controllers/student/order-controller')
const { authenticate } = require('../../middleware/auth-middleware')
const express = require('express')


const router = express.Router()

router.use(authenticate)

router.post('/create-order', createOrder)
router.post('/capture-payment', capturePaymentAndFinalizeOrder)
router.get('/instructor/orders', getInstructorOrders)

module.exports = router
