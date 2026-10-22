import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "/api"

export const getNotes = async (courseId = null) => {
    const params = courseId ? { courseId } : {}
    const response = await axios.get(`${API_URL}/student/notes`, { params })
    return response.data
}

export const createNote = async (data) => {
    const response = await axios.post(`${API_URL}/student/notes`, data)
    return response.data
}

export const updateNote = async (id, content) => {
    const response = await axios.put(`${API_URL}/student/notes/${id}`, { content })
    return response.data
}

export const deleteNote = async (id) => {
    const response = await axios.delete(`${API_URL}/student/notes/${id}`)
    return response.data
}
