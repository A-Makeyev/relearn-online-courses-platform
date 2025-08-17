import { createContext, useEffect, useState } from "react"
import { initialLoginFormData, initialRegisterFormData } from "@/config"
import { login, register, verify } from '@/services'
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"


export const AuthContext = createContext(null)

export default function AuthProvider({ children }) {
    const [loginFormData, setLoginFormData] = useState(initialLoginFormData)
    const [registerFormData, setRegisterFormData] = useState(initialRegisterFormData)
    const [auth, setAuth] = useState({ user: null, isAuthenticated: false })
    const [activeTab, setActiveTab] = useState('login')
    const [loading, setLoading] = useState(true)

    function greeting() {
        const hours = new Date().getHours()
        if (hours < 12) return 'Good morning'
        if (hours < 18) return 'Good afternoon'
        return 'Good evening'
    }

    async function handleRegister(event) {
        event.preventDefault()

        try {
            const data = await register(registerFormData)

            if (data?.success) {
                toast.success(data?.message, { position: 'top-center' })
                setRegisterFormData(initialRegisterFormData)
                setLoginFormData(initialLoginFormData)
                setActiveTab('login')
            }
        } catch(err) {
            toast.error(err?.response?.data?.message || 'Something went wrong', { position: 'top-center' })
        }
    }
    
    async function handleLogin(event) {
        event.preventDefault()
        
        try {
            const { data } = await login(loginFormData)

            if (data.user && data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken)
    
                setAuth({
                    user: data.user,
                    isAuthenticated: true
                })
                setLoading(false)
            } else {
                setAuth({
                    user: null,
                    isAuthenticated: false
                })
                setLoading(false)
            }

            toast.success(`${greeting()} ${data?.user?.username}`, { position: 'top-center' })
        } catch(err) {
            toast.error(err?.response?.data?.message || 'Something went wrong', { position: 'top-center' })
        }
    }

    async function authenticateUser() {
        try {
            const { data } = await verify()

            if (data.user) {
                setAuth({
                    user: data.user,
                    isAuthenticated: true
                })
                setLoading(false)
            } else {
                setAuth({
                    user: null,
                    isAuthenticated: false
                })
                setLoading(false)
            }
        } catch (err) {
            if (!err?.response?.data?.success) {
                setAuth({
                    user: null,
                    isAuthenticated: false
                })
                setLoading(false)
            }
        }
    }

    function logout() {
        setAuth({
            user: null,
            isAuthenticated: false
        })
        localStorage.clear()
    }

    useEffect(() => {
        authenticateUser()
    }, [])

    return (
        <AuthContext.Provider
            value={{
                loginFormData,
                setLoginFormData,
                registerFormData,
                setRegisterFormData,
                handleRegister,
                handleLogin,
                activeTab, 
                setActiveTab,
                auth,
                logout
            }}
        >
            { loading ? <Skeleton /> : children }
        </AuthContext.Provider>
    )
}
