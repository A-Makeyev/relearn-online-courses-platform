import axiosInstance from "@/api/axiosInstance"


export async function register(formData) {
    const { data } = await axiosInstance.post('/auth/register', {
        ...formData,
        role: 'student',
    })

    return data
}

export async function login(formData) {
    const { data } = await axiosInstance.post('/auth/login', formData)
    return data
}

export async function verify() {
    const { data } = await axiosInstance.get('/auth/verify')
    // The endpoint nests the user under `data`; normalize so callers can read
    // `data.user` for both login and session-restore flows.
    return data?.data ?? data
}

export async function uploadMedia(formData, onProgressCallback) {
    const { data } = await axiosInstance.post('/media/upload', formData, {
        onUploadProgress: (progressEvent) => {
            const total = progressEvent.total || progressEvent.loaded || 1
            const percentage = Math.min(100, Math.round((progressEvent.loaded * 100) / total))
            onProgressCallback(percentage)
        }
    })
    return data
}

export async function bulkUploadMedia(formData, onProgressCallback) {
    const { data } = await axiosInstance.post('/media/bulk-upload', formData, {
        onUploadProgress: (progressEvent) => {
            const total = progressEvent.total || progressEvent.loaded || 1
            const percentage = Math.min(100, Math.round((progressEvent.loaded * 100) / total))
            onProgressCallback(percentage)
        }
    })
    return data
}

export async function deleteMedia(id, type) {
    if (!['image', 'video'].includes(type)) {
        throw new Error('Invalid media type. Must be "image" or "video"')
    }

    if (Array.isArray(id)) {
        const { data } = await axiosInstance.delete(`/media/delete/${type}`, { data: { public_ids: id } })
        return data
    } else {
        const { data } = await axiosInstance.delete(`/media/delete/${type}/${id}`)
        return data
    }
}

export async function addNewCourse(formData) {
    const { data } = await axiosInstance.post('/instructor/courses/new-course', formData)
    return data
}

export async function updateCourse(id, formData) {
    const { data } = await axiosInstance.put(`/instructor/courses/update-course/${id}`, formData)
    return data
}

export async function deleteCourse(id) {
    const { data } = await axiosInstance.delete(`/instructor/courses/delete/${id}`)
    return data
}

export async function getInstructorCourses() {
    const { data } = await axiosInstance.get('/instructor/courses/all-courses')
    return data
}

export async function getInstructorCourseDetails(id) {
    const { data } = await axiosInstance.get(`/instructor/courses/course-details/${id}`)
    return data
}

export async function getStudentCourses(query) {
    const { data } = query !== undefined
        ? await axiosInstance.get(`/student/courses/all-courses?${query}`)
        : await axiosInstance.get('/student/courses/all-courses')
    return data
}

export async function getStudentCourseDetails(id) {
    const { data } = await axiosInstance.get(`/student/courses/course-details/${id}`)
    return data
}

export async function createPayment(courseId) {
    const { data } = await axiosInstance.post('/student/order/create-order', { courseId })
    return data
}

export async function capturePaymentAndFinalizeOrder(paymentId, payerId, orderId) {
    const { data } = await axiosInstance.post('/student/order/capture-payment', {
        paymentId, payerId, orderId
    })
    return data
}

export async function getAcquiredCourses(studentId) {
    const { data } = await axiosInstance.get(`/student/acquired-courses/${studentId}`)
    return data
}

export async function getCoursePurchaseInfo(id, studentId) {
    const { data } = await axiosInstance.get(`/student/courses/purchase-info/${id}/${studentId}`)
    return data
}

export async function getCourseReviews(courseId) {
    const { data } = await axiosInstance.get(`/student/courses/${courseId}/reviews`)
    return data
}

export async function submitCourseReview(courseId, review) {
    const { data } = await axiosInstance.post(`/student/courses/${courseId}/reviews`, review)
    return data
}

export async function getCourseProgress(userId, courseId) {
    const { data } = await axiosInstance.get(`/student/course-progress/${userId}/${courseId}`)
    return data
}

export async function resetCourseProgress(userId, courseId) {
    const { data } = await axiosInstance.post('/student/course-progress/reset-progress', {
        userId, courseId
    })
    return data
}

export async function lastViewedLecture(userId, courseId, lectureId) {
    const { data } = await axiosInstance.post('/student/course-progress/current-lecture', {
        userId, courseId, lectureId
    })
    return data
}

export async function viewLecture(userId, courseId, lectureId) {
    const { data } = await axiosInstance.post('/student/course-progress/view-lecture', {
        userId, courseId, lectureId
    })
    return data
}

export async function getWishlist() {
    const { data } = await axiosInstance.get('/student/wishlist')
    return data
}

export async function getWishlistIds() {
    const { data } = await axiosInstance.get('/student/wishlist/ids')
    return data
}

export async function addToWishlist(courseId) {
    const { data } = await axiosInstance.post(`/student/wishlist/${courseId}`)
    return data
}

export async function removeFromWishlist(courseId) {
    const { data } = await axiosInstance.delete(`/student/wishlist/${courseId}`)
    return data
}

export async function getMyCertificates() {
    const { data } = await axiosInstance.get('/certificates/mine')
    return data
}

export async function issueCertificate(courseId) {
    const { data } = await axiosInstance.post(`/certificates/${courseId}`)
    return data
}

export async function verifyCertificate(code) {
    const { data } = await axiosInstance.get(`/certificates/verify/${encodeURIComponent(code)}`)
    return data
}

export async function getInstructorOrders() {
    const { data } = await axiosInstance.get('/student/order/instructor/orders')
    return data
}
