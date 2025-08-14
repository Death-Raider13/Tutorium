// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  LECTURER: "lecturer",
  STUDENT: "student",
  PENDING: "pending",
} as const

// Navigation configuration
export const NAVIGATION_CONFIG = {
  admin: [
    { href: "/admin", label: "Admin Dashboard", icon: "Shield" },
    { href: "/profile", label: "Profile", icon: "User" },
  ],
  lecturer: [
    { href: "/lecturer/dashboard", label: "Dashboard", icon: "BarChart3" },
    { href: "/lecturer/upload", label: "Upload Content", icon: "Upload" },
    { href: "/lecturer/questions", label: "Answer Questions", icon: "MessageSquareReply" },
    { href: "/lecturer/students", label: "My Students", icon: "Users" },
    { href: "/lecturer/analytics", label: "Analytics", icon: "BarChart3" },
    { href: "/profile", label: "Profile", icon: "User" },
  ],
  student: [
    { href: "/student/dashboard", label: "Dashboard", icon: "BarChart3" },
    { href: "/student/lecturers", label: "Find Lecturers", icon: "Users" },
    { href: "/achievements", label: "Achievements", icon: "Trophy" },
    { href: "/profile", label: "Profile", icon: "User" },
  ],
  pending: [{ href: "/profile", label: "Profile", icon: "User" }],
} as const

// Nigerian Universities
export const NIGERIAN_UNIVERSITIES = [
  "University of Lagos (UNILAG)",
  "University of Ibadan (UI)",
  "Obafemi Awolowo University (OAU)",
  "University of Nigeria, Nsukka (UNN)",
  "Ahmadu Bello University (ABU)",
  "University of Benin (UNIBEN)",
  "Federal University of Technology, Akure (FUTA)",
  "Federal University of Technology, Owerri (FUTO)",
  "Federal University of Technology, Minna (FUTMINNA)",
  "Lagos State University (LASU)",
  "Covenant University",
  "Babcock University",
  "Landmark University",
  "Redeemer's University",
  "Bells University of Technology",
  "Crawford University",
  "Elizade University",
  "Fountain University",
  "Igbinedion University",
  "Joseph Ayo Babalola University",
  "Kings University",
  "Lead City University",
  "Madonna University",
  "Nile University of Nigeria",
  "Pan-Atlantic University",
  "Renaissance University",
  "Salem University",
  "Southwestern University",
  "Summit University",
  "Veritas University",
  "Wesley University",
  "Adeleke University",
  "Afe Babalola University",
  "Al-Hikmah University",
  "American University of Nigeria",
  "Ajayi Crowther University",
  "Bowen University",
  "Caleb University",
  "Caritas University",
  "Christopher University",
  "Crescent University",
] as const

// Engineering Subjects
export const ENGINEERING_SUBJECTS = [
  "Civil Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Chemical Engineering",
  "Computer Engineering",
  "Petroleum Engineering",
  "Agricultural Engineering",
  "Biomedical Engineering",
  "Environmental Engineering",
  "Industrial Engineering",
  "Materials Engineering",
  "Mining Engineering",
  "Nuclear Engineering",
  "Ocean Engineering",
  "Systems Engineering",
  "Aerospace Engineering",
  "Automotive Engineering",
  "Structural Engineering",
  "Geotechnical Engineering",
  "Transportation Engineering",
  "Water Resources Engineering",
  "Power Systems Engineering",
  "Electronics Engineering",
  "Telecommunications Engineering",
  "Control Systems Engineering",
  "Instrumentation Engineering",
  "Process Engineering",
  "Biochemical Engineering",
  "Food Engineering",
  "Pharmaceutical Engineering",
  "Engineering Mathematics",
  "Engineering Physics",
  "Engineering Drawing",
  "Thermodynamics",
  "Fluid Mechanics",
  "Strength of Materials",
  "Engineering Mechanics",
  "Engineering Economics",
  "Project Management",
  "Quality Control",
  "Safety Engineering",
  "Engineering Ethics",
  "Renewable Energy Systems",
  "Robotics Engineering",
  "Artificial Intelligence",
  "Machine Learning",
  "Data Engineering",
  "Software Engineering",
  "Network Engineering",
  "Cybersecurity Engineering",
] as const

// Academic Levels (Nigerian System)
export const ACADEMIC_LEVELS = [
  "100 Level",
  "200 Level",
  "300 Level",
  "400 Level",
  "500 Level",
  "Postgraduate",
  "Masters",
  "PhD",
] as const

// Difficulty Levels
export const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"] as const

// Question Status
export const QUESTION_STATUS = ["open", "answered", "closed"] as const

// Content Types
export const CONTENT_TYPES = ["video", "document", "audio", "image", "interactive"] as const

// Sort Options
export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "alphabetical", label: "A-Z" },
] as const

// System Settings
export const SYSTEM_SETTINGS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_FILE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/webm",
    "audio/mp3",
    "audio/wav",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  POINTS_SYSTEM: {
    QUESTION_ASKED: 5,
    QUESTION_ANSWERED: 10,
    ANSWER_UPVOTED: 2,
    LESSON_COMPLETED: 15,
    PROFILE_COMPLETED: 25,
  },
  LEVEL_THRESHOLDS: [0, 100, 250, 500, 1000, 2000, 5000, 10000],
} as const

// Default Values
export const DEFAULT_VALUES = {
  AVATAR_URL: "/placeholder-user.jpg",
  PLACEHOLDER_IMAGE: "/placeholder.jpg",
  ITEMS_PER_PAGE: 12,
  SEARCH_DEBOUNCE: 300,
} as const
