export const registerFormControls = [
  {
    name: 'email',
    label: 'Email',
    placeholder: 'you@example.com',
    componentType: 'input',
    type: 'email'
  },
  {
    name: 'username',
    label: 'Username',
    placeholder: 'How should we call you?',
    componentType: 'input',
    type: 'text'
  },
  {
    name: 'password',
    label: 'Password',
    placeholder: 'At least 6 characters',
    componentType: 'input',
    type: 'password'
  },
]

export const loginFormControls = [
  {
    name: 'email',
    label: 'Email',
    placeholder: 'you@example.com',
    componentType: 'input',
    type: 'email'
  },
  {
    name: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    componentType: 'input',
    type: 'password'
  },
]

export const initialLoginFormData = {
  email: '',
  password: '',
}

export const initialRegisterFormData = {
  email: '',
  username: '',
  password: '',
}

export const languageOptions = [
  { id: 'hebrew', label: 'Hebrew' },
  { id: 'english', label: 'English' }
]

export const courseLevelOptions = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' }
]

export const courseCategories = [
  { id: 'marketing', label: 'Marketing' },
  { id: 'design', label: 'Design' },
  { id: 'web-development', label: 'Web Development' },
  { id: 'backend-development', label: 'Backend Development' },
  { id: 'data-science', label: 'Data Science' },
  { id: 'machine-learning', label: 'Machine Learning' },
  { id: 'artificial-intelligence', label: 'Artificial Intelligence' },
  { id: 'cyber-security', label: 'Cyber Security' },
  { id: 'mobile-development', label: 'Mobile Development' },
  { id: 'game-development', label: 'Game Development' },
  { id: 'software-engineering', label: 'Software Engineering' }
]

export const courseLandingPageFormControls = [
  {
    name: 'title',
    label: 'Title',
    componentType: 'input',
    type: 'text',
    placeholder: 'Enter course title',
  },
  {
    name: 'category',
    label: 'Category',
    componentType: 'select',
    type: 'text',
    placeholder: 'Choose Category',
    options: courseCategories,
  },
  {
    name: 'level',
    label: 'Level',
    componentType: 'select',
    type: 'text',
    placeholder: 'Choose Level',
    options: courseLevelOptions,
  },
  {
    name: 'language',
    label: 'Language',
    componentType: 'select',
    type: 'text',
    placeholder: 'Choose Language',
    options: languageOptions,
  },
  {
    name: 'subtitle',
    label: 'Subtitle',
    componentType: 'input',
    type: 'text',
    placeholder: 'A short, compelling one-liner',
  },
  {
    name: 'description',
    label: 'Description',
    componentType: 'textarea',
    type: 'text',
    placeholder: 'What will students get from this course?',
  },
  {
    name: 'price',
    label: 'Price',
    componentType: 'input',
    type: 'number',
    placeholder: 'Enter course price',
  },
  {
    name: 'objectives',
    label: 'Objectives',
    componentType: 'textarea',
    type: 'text',
    placeholder: 'Separate each learning objective with a comma',
  },
  {
    name: 'welcomeMessage',
    label: 'Welcome Message',
    componentType: 'textarea',
    placeholder: 'Welcome message for students',
  },
]

export const courseLandingInitialFormData = {
  title: '',
  category: '',
  level: '',
  language: '',
  subtitle: '',
  description: '',
  price: '',
  objectives: '',
  welcomeMessage: '',
  image_url: '',
  public_id: '',
}

export const courseCurriculumInitialFormData = [
  {
    title: '',
    video_url: '',
    public_id: '',
    preview: false,
  },
]

export const sortOptions = [
  { id: 'newest', label: 'Newest' },
  { id: 'most-reviewed', label: 'Most reviewed' },
  { id: 'highest-rated', label: 'Highest rated' },
  { id: 'price-low-high', label: 'Price: Low to High' },
  { id: 'price-high-low', label: 'Price: High to Low' },
  { id: 'title-a-z', label: 'Title: A to Z' },
  { id: 'title-z-a', label: 'Title: Z to A' },
]

export const filterOptions = {
  category: courseCategories,
  level: courseLevelOptions,
  language: languageOptions,
}
