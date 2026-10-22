import { createContext, useState } from "react";
import { courseCurriculumInitialFormData, courseLandingInitialFormData } from "@/config";


export const InstructorContext = createContext(null)

export default function InstructorProvider({ children }) {
    const [courseLandingFormData, setCourseLandingFormData] = useState(courseLandingInitialFormData)
    const [courseCurriculumFormData, setCourseCurriculumFormData] = useState(courseCurriculumInitialFormData)
    const [mediaUploadProgressPercentage, setMediaUploadProgressPercentage] = useState(0)
    const [mediaUploadProgress, setMediaUploadProgress] = useState(false)
    const [currentEditedCourse, setCurrentEditedCourse] = useState(null)
    const [instructorCourses, setInstructorCourses] = useState([])
    const [instructorOrders, setInstructorOrders] = useState(null)
    const [loading, setLoading] = useState(true)

    return (
        <InstructorContext.Provider value={{
            courseLandingFormData, 
            setCourseLandingFormData,
            courseCurriculumFormData, 
            setCourseCurriculumFormData,
            mediaUploadProgress,
            setMediaUploadProgress,
            mediaUploadProgressPercentage, 
            setMediaUploadProgressPercentage,
            instructorCourses, 
            setInstructorCourses,
            instructorOrders,
            setInstructorOrders,
            currentEditedCourse, 
            setCurrentEditedCourse,
            loading, 
            setLoading
        }}>
            { children }
        </InstructorContext.Provider>
    )
}