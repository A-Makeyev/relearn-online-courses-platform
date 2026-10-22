import { Outlet, useLocation } from 'react-router-dom'
import StudentHeader from './header'
import StudentFooter from './footer'


function StudentView() {
    const location = useLocation()
    const isImmersive = location.pathname.includes('/course-progress')

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {!isImmersive && <StudentHeader />}
            <main className="flex-1">
                <Outlet />
            </main>
            {!isImmersive && <StudentFooter />}
        </div>
    )
}

export default StudentView
