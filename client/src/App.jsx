import { lazy, Suspense, useContext } from "react"
import { Route, Routes } from "react-router-dom"
import { AuthContext } from "./context/auth"
import GamificationProvider from "./context/gamification"
import CartProvider from "./context/cart"
import LikesProvider from "./context/likes"
import ThemeProvider from "./context/theme"
import RouteGuard from "./components/route-guard"
import { LoadingSpinner } from "./components/ui/loading-spinner"
import ScrollToTop from "./components/scroll-to-top"


const AuthPage = lazy(() => import("./pages/auth"))
const InstructorView = lazy(() => import("./pages/instructor"))
const CreateNewCourse = lazy(() => import("./pages/instructor/crerate-new-course"))
const CoursePreview = lazy(() => import("./pages/instructor/course-preview"))
const StudentView = lazy(() => import("./components/student-view/common-layout"))
const StudentHomePage = lazy(() => import("./pages/student/home"))
const StudentCoursesPage = lazy(() => import("./pages/student/courses"))
const StudentCoursesDetailsPage = lazy(() => import("./pages/student/course-details"))
const PaymentReturnPage = lazy(() => import("./pages/student/payment-return"))
const PaymentCancelPage = lazy(() => import("./pages/student/payment-cancel"))
const AcquiredCoursesPage = lazy(() => import("./pages/student/acquired-courses"))
const CourseProgressPage = lazy(() => import("./pages/student/course-progress"))
const WishlistPage = lazy(() => import("./pages/student/wishlist"))
const MyCertificatesPage = lazy(() => import("./pages/student/certificates"))
const CertificatePage = lazy(() => import("./pages/certificate"))
const CartPage = lazy(() => import("./pages/student/cart"))
const NotesPage = lazy(() => import("./pages/student/notes"))
const ProgressDashboardPage = lazy(() => import("./pages/student/progress-dashboard"))
const NotFound = lazy(() => import("./pages/not-found"))


function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <LoadingSpinner className="h-8 w-8 text-primary" />
    </div>
  )
}

const App = () => {
  const { auth } = useContext(AuthContext)

  return (
    <LikesProvider>
      <CartProvider>
        <GamificationProvider>
          <ThemeProvider>
            <ScrollToTop />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route
                  path="/auth"
                  element={
                    <RouteGuard
                      element={<AuthPage />}
                      isAuthenticated={auth?.isAuthenticated}
                      user={auth?.user}
                    />
                  }
                />
                <Route
                  path="/instructor"
                  element={
                    <RouteGuard
                      element={<InstructorView />}
                      isAuthenticated={auth?.isAuthenticated}
                      user={auth?.user}
                    />
                  }
                />
                <Route
                  path="/instructor/create-new-course"
                  element={
                    <RouteGuard
                      element={<CreateNewCourse />}
                      isAuthenticated={auth?.isAuthenticated}
                      user={auth?.user}
                    />
                  }
                />
                <Route
                  path="/instructor/edit-course/:courseId"
                  element={
                    <RouteGuard
                      element={<CreateNewCourse />}
                      isAuthenticated={auth?.isAuthenticated}
                      user={auth?.user}
                    />
                  }
                />
                <Route
                  path="/instructor/course-preview/:courseId"
                  element={
                    <RouteGuard
                      element={<CoursePreview />}
                      isAuthenticated={auth?.isAuthenticated}
                      user={auth?.user}
                    />
                  }
                />
                <Route
                  path="/"
                  element={
                    <RouteGuard
                      element={<StudentView />}
                      isAuthenticated={auth?.isAuthenticated}
                      user={auth?.user}
                    />
                  }
                >
                  <Route path="" element={<StudentHomePage />} />
                  <Route path="home" element={<StudentHomePage />} />
                  <Route path="courses" element={<StudentCoursesPage />} />
                  <Route path="course/details/:id" element={<StudentCoursesDetailsPage />} />
                  <Route path="payment-return" element={<PaymentReturnPage />} />
                  <Route path="payment-cancel" element={<PaymentCancelPage />} />
                  <Route path="acquired-courses" element={<AcquiredCoursesPage />} />
                  <Route path="course-progress/:id" element={<CourseProgressPage />} />
                  <Route path="wishlist" element={<WishlistPage />} />
                  <Route path="certificates" element={<MyCertificatesPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="course/:id/notes" element={<NotesPage />} />
                  <Route path="student/dashboard" element={<ProgressDashboardPage />} />
                  <Route path="progress-dashboard" element={<ProgressDashboardPage />} />
                </Route>
                {/* Public: certificates must be verifiable by anyone, including instructors. */}
                <Route path="/certificate/:code" element={<CertificatePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ThemeProvider>
        </GamificationProvider>
      </CartProvider>
    </LikesProvider>
  )
}

export default App;
