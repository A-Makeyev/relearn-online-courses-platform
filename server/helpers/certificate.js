const crypto = require('crypto')
const Certificate = require('../models/Certificate')


// Ambiguous characters (0/O, 1/I) are left out so codes are easy to read
// aloud or type from a printed certificate.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const generateCode = () => {
    const bytes = crypto.randomBytes(8)
    let characters = ''

    for (let index = 0; index < bytes.length; index += 1) {
        characters += CODE_ALPHABET[bytes[index] % CODE_ALPHABET.length]
    }

    return `EP-${characters.slice(0, 4)}-${characters.slice(4)}`
}

/**
 * Issue (or return) the certificate for a user/course pair.
 * Safe to call repeatedly: the user+course pair is unique.
 */
const issueCertificateFor = async ({ userId, studentName, course, lectureCount }) => {
    if (!userId || !course?._id) return null

    const courseId = String(course._id)
    const normalizedUserId = String(userId)

    const existing = await Certificate.findOne({ userId: normalizedUserId, courseId })
    if (existing) return existing

    const payload = {
        userId: normalizedUserId,
        studentName: studentName || 'Easy Programming learner',
        courseId,
        courseTitle: course.title,
        courseCategory: course.category || '',
        instructorName: course.instructorName || '',
        lectureCount: Number.isFinite(lectureCount)
            ? lectureCount
            : (course.curriculum?.length || 0)
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
            return await Certificate.create({ ...payload, code: generateCode() })
        } catch (err) {
            if (err?.code !== 11000) throw err
        }
    }

    // Another request may have created the same user+course certificate while
    // we were generating codes; fall back to reading it.
    return Certificate.findOne({ userId: normalizedUserId, courseId })
}

module.exports = { issueCertificateFor, generateCode }
