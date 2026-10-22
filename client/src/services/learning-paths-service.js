import axiosInstance from "@/api/axiosInstance"

export const getLearningPaths = async () => {
    const { data } = await axiosInstance.get('/student/learning-paths')
    return data
}

export const getLearningPath = async (pathId) => {
    const { data } = await axiosInstance.get(`/student/learning-paths/${pathId}`)
    return data
}

export const enrollInPath = async (pathId) => {
    const { data } = await axiosInstance.post(`/student/learning-paths/${pathId}/enroll`)
    return data
}

export const updatePathProgress = async (pathId, courseId, completed) => {
    const { data } = await axiosInstance.post(`/student/learning-paths/${pathId}/progress`, {
        courseId,
        completed
    })
    return data
}

export const getEnrolledPaths = async () => {
    const { data } = await axiosInstance.get('/student/learning-paths/enrolled')
    return data
}
