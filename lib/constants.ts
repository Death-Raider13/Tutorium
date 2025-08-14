export const USER_ROLES = {
  ADMIN: "admin",
  LECTURER: "lecturer",
  STUDENT: "student",
  PENDING: "pending",
} as const

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  STUDENT_DASHBOARD: "/student/dashboard",
  LECTURER_DASHBOARD: "/lecturer/dashboard",
  ADMIN_DASHBOARD: "/admin",
  PROFILE: "/profile",
  LESSONS: "/lessons",
  QUESTIONS: "/questions",
  ASK: "/ask",
  STUDY_GROUPS: "/study-groups",
  ACHIEVEMENTS: "/achievements",
  VERIFY_EMAIL: "/verify-email",
  LECTURER: {
    QUESTIONS: "/lecturer/questions",
    UPLOAD: "/lecturer/upload",
    STUDENTS: "/lecturer/students",
    ANALYTICS: "/lecturer/analytics",
    LIVESTREAM: "/lecturer/livestream",
  },
  STUDENT: {
    LECTURERS: "/student/lecturers",
  },
  ADMIN: "/admin",
} as const

export const ROLE_REDIRECTS = {
  [USER_ROLES.STUDENT]: ROUTES.STUDENT_DASHBOARD,
  [USER_ROLES.LECTURER]: ROUTES.LECTURER_DASHBOARD,
  [USER_ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
  [USER_ROLES.PENDING]: ROUTES.DASHBOARD,
} as const

// Nigerian Engineering Subjects/Departments
export const SUBJECTS = [
  "Civil Engineering",
  "Mechanical Engineering",
  "Electrical/Electronics Engineering",
  "Chemical Engineering",
  "Computer Engineering",
  "Petroleum Engineering",
  "Agricultural Engineering",
  "Biomedical Engineering",
  "Industrial Engineering",
  "Materials and Metallurgical Engineering",
  "Marine Engineering",
  "Aerospace Engineering",
  "Environmental Engineering",
  "Food Engineering",
  "Mining Engineering",
  "Nuclear Engineering",
  "Systems Engineering",
  "Structural Engineering",
  "Geotechnical Engineering",
  "Water Resources Engineering",
]

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
  "Bells University of Technology",
  "Rivers State University",
  "University of Port Harcourt (UNIPORT)",
  "Federal University of Petroleum Resources (FUPRE)",
  "Nnamdi Azikiwe University (UNIZIK)",
  "University of Ilorin (UNILORIN)",
  "Bayero University Kano (BUK)",
  "University of Jos (UNIJOS)",
  "Federal University Lokoja (FULOKOJA)",
  "Michael Okpara University of Agriculture (MOUAU)",
  "Federal University of Agriculture, Abeokuta (FUNAAB)",
  "Modibbo Adama University of Technology (MAUTECH)",
]

export const NAVIGATION_CONFIG = {
  student: [
    { href: "/dashboard", label: "Dashboard", icon: "Home" },
    { href: "/lessons", label: "Lessons", icon: "BookOpen" },
    { href: "/questions", label: "Questions", icon: "HelpCircle" },
    { href: "/ask", label: "Ask Question", icon: "MessageSquareReply" },
    { href: "/study-groups", label: "Study Groups", icon: "Users" },
    { href: "/student/lecturers", label: "Find Lecturers", icon: "GraduationCap" },
    { href: "/achievements", label: "Achievements", icon: "Trophy" },
  ],
  lecturer: [
    { href: "/dashboard", label: "Dashboard", icon: "Home" },
    { href: "/lecturer/questions", label: "Answer Questions", icon: "MessageSquareReply" },
    { href: "/lecturer/upload", label: "Upload Content", icon: "Upload" },
    { href: "/lecturer/students", label: "My Students", icon: "GraduationCap" },
    { href: "/lecturer/analytics", label: "Analytics", icon: "BarChart3" },
    { href: "/lecturer/livestream", label: "Live Stream", icon: "Video" },
    { href: "/study-groups", label: "Study Groups", icon: "Users" },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: "Home" },
    { href: "/admin", label: "Admin Panel", icon: "Shield" },
    { href: "/lessons", label: "All Lessons", icon: "BookOpen" },
    { href: "/questions", label: "All Questions", icon: "HelpCircle" },
    { href: "/study-groups", label: "Study Groups", icon: "Users" },
  ],
}

export const DASHBOARD_CONFIG = {
  student: {
    title: "Student Dashboard",
    description: "Track your engineering learning progress and achievements",
    quickActions: [
      { title: "Ask a Question", href: "/ask", icon: "HelpCircle", color: "text-blue-600" },
      { title: "Browse Lessons", href: "/lessons", icon: "BookOpen", color: "text-green-600" },
      { title: "Join Study Groups", href: "/study-groups", icon: "Users", color: "text-purple-600" },
      { title: "Find Lecturers", href: "/student/lecturers", icon: "GraduationCap", color: "text-indigo-600" },
      { title: "View Achievements", href: "/achievements", icon: "Trophy", color: "text-yellow-600" },
    ],
  },
  lecturer: {
    title: "Lecturer Dashboard",
    description: "Manage your engineering content and help students learn",
    quickActions: [
      { title: "Answer Questions", href: "/lecturer/questions", icon: "MessageSquareReply", color: "text-blue-600" },
      { title: "Upload Content", href: "/lecturer/upload", icon: "Upload", color: "text-green-600" },
      { title: "View Students", href: "/lecturer/students", icon: "GraduationCap", color: "text-purple-600" },
      { title: "Analytics", href: "/lecturer/analytics", icon: "BarChart3", color: "text-indigo-600" },
      { title: "Live Stream", href: "/lecturer/livestream", icon: "Video", color: "text-red-600" },
    ],
  },
  admin: {
    title: "Admin Dashboard",
    description: "Manage the engineering education platform and monitor activity",
    quickActions: [
      { title: "User Management", href: "/admin/users", icon: "Users", color: "text-blue-600" },
      { title: "Content Moderation", href: "/admin/content", icon: "Shield", color: "text-red-600" },
      { title: "System Analytics", href: "/admin/analytics", icon: "BarChart3", color: "text-green-600" },
      { title: "Settings", href: "/admin/settings", icon: "Settings", color: "text-gray-600" },
    ],
  },
}

export const ACHIEVEMENT_TYPES = {
  FIRST_QUESTION: "first_question",
  FIRST_ANSWER: "first_answer",
  QUESTION_STREAK: "question_streak",
  HELPFUL_ANSWERS: "helpful_answers",
  LESSON_WATCHER: "lesson_watcher",
  STUDY_GROUP_MEMBER: "study_group_member",
  POINTS_MILESTONE: "points_milestone",
}

export const NOTIFICATION_TYPES = {
  LIVESTREAM: "livestream",
  QUESTION: "question",
  ACHIEVEMENT: "achievement",
  STUDY_GROUP: "study_group",
  SYSTEM: "system",
  SUBSCRIPTION: "subscription",
  ASSIGNMENT: "assignment",
}

// Nigerian States for location
export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
]
