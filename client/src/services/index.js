import axiosInstance from "@/api/axiosInstance"

// Auth functions
export async function login(credentials) {
    const { data } = await axiosInstance.post('/auth/login', credentials)
    return data
}
export async function register(formData) {
    const { data } = await axiosInstance.post('/auth/register', formData)
    return data
}
export async function verify() {
    const { data } = await axiosInstance.get('/auth/verify')
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

// Cart functions (client-side storage)
export function getCart() {
    if (typeof window === 'undefined') return []
    try {
        return JSON.parse(localStorage.getItem('cart') || '[]')
    } catch {
        return []
    }
}

export function addToCart(courseId) {
    if (typeof window === 'undefined') return false
    try {
        const cart = getCart()
        if (!cart.includes(courseId)) {
            cart.push(courseId)
            localStorage.setItem('cart', JSON.stringify(cart))
            return true
        }
        return false
    } catch {
        return false
    }
}

export function removeFromCart(courseId) {
    if (typeof window === 'undefined') return false
    try {
        const cart = getCart().filter(id => id !== courseId)
        localStorage.setItem('cart', JSON.stringify(cart))
        return true
    } catch {
        return false
    }
}

export function clearCart() {
    if (typeof window === 'undefined') return
    try {
        localStorage.removeItem('cart')
    } catch { /* ignore */ }
}

export function isInCart(courseId) {
    return getCart().includes(courseId)
}

export function getCartCount() {
    return getCart().length
}

// Instructor orders function
export async function getInstructorOrders() {
    const { data } = await axiosInstance.get('/student/order/instructor/orders')
    return data
}

// Media uploads
export async function uploadMedia(formData) {
    const { data } = await axiosInstance.post('/instructor/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
}
export async function bulkUploadMedia(files) {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    const { data } = await axiosInstance.post('/instructor/media/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
}

// Instructor courses
export async function getInstructorCourses() {
    const { data } = await axiosInstance.get('/instructor/courses')
    return data
}

// Order/payment operations
export async function createPayment(courseId) {
    const { data } = await axiosInstance.post(`/student/order/create-order`, { courseId })
    return data
}
export async function capturePayment(orderId) {
    const { data } = await axiosInstance.post('/student/order/capture-payment', { orderId })
    return data
}export async function capturePaymentAndFinalizeOrder(orderData) {
    const { data } = await axiosInstance.post('/student/order/capture-payment', orderData)
    return data
}// Course CRUD operations
export async function addNewCourse(courseData) {
    const { data } = await axiosInstance.post('/instructor/courses', courseData)
    return data
}export async function getInstructorCourseDetails(courseId) {
    const { data } = await axiosInstance.get(`/instructor/courses/${courseId}`)
    return data
}export async function updateCourse(courseId, courseData) {
    const { data } = await axiosInstance.put(`/instructor/courses/${courseId}`, courseData)
    return data
}

// Course progress operations
export async function getCourseProgress(courseId) {
    const { data } = await axiosInstance.get(`/student/course-progress/${courseId}`)
    return data
}export async function viewLecture(courseId, lectureId) {
    const { data } = await axiosInstance.post(`/student/course-progress/${courseId}/view`, { lectureId })
    return data
}export async function lastViewedLecture(courseId) {
    const { data } = await axiosInstance.get(`/student/course-progress/${courseId}/last-viewed`)
    return data
}export async function resetCourseProgress(courseId) {
    const { data } = await axiosInstance.post(`/student/course-progress/${courseId}/reset`)
    return data
}

// Student course operations
export async function getStudentCourses() {
    const { data } = await axiosInstance.get('/student/courses')
    return data
}export async function getCourseById(courseId) {
    const { data } = await axiosInstance.get(`/student/course/${courseId}`)
    return data
}export async function getStudentCourseDetails(courseId) {
    const { data } = await axiosInstance.get(`/student/course/details/${courseId}`)
    return data
}export async function getCoursePurchaseInfo(courseId, userId) {
    const { data } = await axiosInstance.get(`/student/course/purchase/${courseId}`, { params: { userId } })
    return data
}export async function getCourseReviews(courseId) {
    const { data } = await axiosInstance.get(`/student/course/${courseId}/reviews`)
    return data
}export async function submitCourseReview(courseId, reviewData) {
    const { data } = await axiosInstance.post(`/student/course/${courseId}/review`, reviewData)
    return data
}export async function getStudentCoursesByStatus() {
    const { data } = await axiosInstance.get('/student/courses/status')
    return data
}export async function getAcquiredCourses() {
    const { data } = await axiosInstance.get('/student/acquired-courses')
    return data
}

// Course media management
export async function deleteCourse(courseId) {
    const { data } = await axiosInstance.delete(`/instructor/courses/${courseId}`)
    return data
}
export async function deleteMedia(publicId) {
    const { data } = await axiosInstance.delete('/instructor/media', { data: { publicId } })
    return data
}

// Likes functions (client-side storage)
export function getLikes() {
    if (typeof window === 'undefined') return []
    try {
        return JSON.parse(localStorage.getItem('courseLikes') || '[]')
    } catch {
        return []
    }
}

export function addLike(courseId) {
    if (typeof window === 'undefined') return false
    try {
        const likes = getLikes()
        if (!likes.includes(courseId)) {
            likes.push(courseId)
            localStorage.setItem('courseLikes', JSON.stringify(likes))
            return true
        }
        return false
    } catch {
        return false
    }
}

export function removeLike(courseId) {
    if (typeof window === 'undefined') return false
    try {
        const likes = getLikes().filter(id => id !== courseId)
        localStorage.setItem('courseLikes', JSON.stringify(likes))
        return true
    } catch {
        return false
    }
}

export function isLiked(courseId) {
    return getLikes().includes(courseId)
}

export function getLikeCount() {
    return getLikes().length
}
