import { Fragment } from "react"
import { useLocation, Navigate } from "react-router-dom"


function RouteGuard({ isAuthenticated, user, element }) {
    const location = useLocation()
    const isAuthPage = location.pathname.startsWith('/auth')
    const isInstructorArea = location.pathname.startsWith('/instructor')

    if (!isAuthenticated) {
        // The sign-in screen itself must stay reachable, otherwise redirecting
        // to /auth would loop on the same route and render nothing.
        return isAuthPage ? <Fragment>{element}</Fragment> : <Navigate to="/auth" replace />
    }

    // Signed-in users should never see the sign-in screen.
    if (isAuthPage) {
        return <Navigate to={user?.role === 'instructor' ? '/instructor' : '/home'} replace />
    }

    // Students cannot enter the instructor studio.
    if (isInstructorArea && user?.role !== 'instructor') {
        return <Navigate to="/home" replace />
    }

    // Instructors share the same account and can also browse, learn, save
    // courses and earn certificates. Only the studio is instructor-only.
    return <Fragment>{element}</Fragment>
}

export default RouteGuard
