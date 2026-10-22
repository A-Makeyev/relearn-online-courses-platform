import axiosInstance from "@/api/axiosInstance"

export const getCourseQuizzes = async (courseId) => {
    const { data } = await axiosInstance.get(`/student/quiz/${courseId}`)
    return data
}

export const submitQuizAnswer = async (quizId, answer) => {
    const { data } = await axiosInstance.post(`/student/quiz/${quizId}/submit`, { answer })
    return data
}
