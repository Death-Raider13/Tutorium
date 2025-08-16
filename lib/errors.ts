export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export const getErrorMessage = (error: any): string => {
  if (error instanceof AppError) {
    return error.message
  }

  // Firebase Auth errors
  switch (error?.code) {
    case "auth/user-not-found":
      return "No account found with this email address."
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password."
    case "auth/email-already-in-use":
      return "An account with this email already exists."
    case "auth/weak-password":
      return "Password is too weak. Please choose a stronger password."
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later."
    case "auth/user-disabled":
      return "This account has been disabled."
    case "auth/invalid-email":
      return "Invalid email address."
    case "auth/popup-closed-by-user":
      return "Sign-in cancelled."
    case "auth/popup-blocked":
      return "Popup blocked. Please allow popups and try again."
    case "auth/network-request-failed":
      return "Network error. Please check your connection."
    default:
      return error?.message || "An unexpected error occurred. Please try again."
  }
}
