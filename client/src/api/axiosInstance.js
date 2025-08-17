import axios from "axios"


const axiosInstance = axios.create({
    baseURL: window.location.hostname.includes('localhost')
        ? 'http://localhost:5000'
        : window.location.origin
})

axiosInstance.interceptors.request.use(config => {
    const accessToken = localStorage.getItem('accessToken')
    // const accessToken = sessionStorage.getItem('accessToken')
    
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
}, (err) => Promise.reject(err))

export default axiosInstance