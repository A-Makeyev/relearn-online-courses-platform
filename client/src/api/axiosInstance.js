import axios from "axios"


const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL
        || (isLocalhost ? 'http://localhost:5000' : window.location.origin)
})

axiosInstance.interceptors.request.use(config => {
    const accessToken = localStorage.getItem('accessToken')

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
}, (err) => Promise.reject(err))

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        const status = error?.response?.status

        if (status === 401 && localStorage.getItem('accessToken')) {
            localStorage.removeItem('accessToken')

            if (!window.location.pathname.includes('/auth')) {
                window.location.assign('/auth')
            }
        }

        return Promise.reject(error)
    }
)

export default axiosInstance
