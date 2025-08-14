// Admin configuration - hardcoded admin accounts
export const ADMIN_ACCOUNTS = [
  {
    email: "envostructs@gmail.com",
    password: "ADMIN_TUTORIUM",
    displayName: "Admin User 1",
    isSystemAdmin: true
  },
  {
    email: "lateefedidi4@gmail.com", 
    password: "ADMIN_TUTORIUM",
    displayName: "Admin User 2",
    isSystemAdmin: true
  }
] as const

export const isAdminEmail = (email: string): boolean => {
  return ADMIN_ACCOUNTS.some(admin => admin.email === email)
}

export const getAdminAccountInfo = (email: string) => {
  return ADMIN_ACCOUNTS.find(admin => admin.email === email)
}

export const ADMIN_PASSWORD = "ADMIN_TUTORIUM"
