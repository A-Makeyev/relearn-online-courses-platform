const {
    listMyCertificates,
    issueMyCertificate,
    verifyCertificate
} = require('../controllers/student/certificate-controller')
const { authenticate } = require('../middleware/auth-middleware')
const express = require('express')


const router = express.Router()

// Public: anyone holding a certificate link can verify it.
router.get('/verify/:code', verifyCertificate)

router.get('/mine', authenticate, listMyCertificates)
router.post('/:courseId', authenticate, issueMyCertificate)

module.exports = router
