export interface User {
  id: string
  email: string
  name: string
  picture: string
  userType: "student" | "faculty"
  loginMethod: string
  signupTime: string
  section?: string
  department?: string
  password?: string // For manual accounts
}

export interface StoredUser {
  id: string
  email: string
  name: string
  picture: string
  userType: "student" | "faculty"
  loginMethod: string
  signupTime: string
  section?: string
  department?: string
  passwordHash?: string // Hashed password for security
}

// Simple hash function for demo purposes (in production, use bcrypt)
const simpleHash = (password: string): string => {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString()
}

export const userManager = {
  // Get all registered users
  getAllUsers: (): StoredUser[] => {
    return JSON.parse(localStorage.getItem("registered_users") || "[]")
  },

  // Check if user exists by email
  userExists: (email: string): boolean => {
    const users = userManager.getAllUsers()
    return users.some((user) => user.email.toLowerCase() === email.toLowerCase())
  },

  // Register a new user
  registerUser: (userData: User): boolean => {
    const users = userManager.getAllUsers()

    // Check if user already exists
    if (userManager.userExists(userData.email)) {
      return false
    }

    const storedUser: StoredUser = {
      ...userData,
      passwordHash: userData.password ? simpleHash(userData.password) : undefined,
    }

    // Remove password from stored data
    delete (storedUser as any).password

    users.push(storedUser)
    localStorage.setItem("registered_users", JSON.stringify(users))
    return true
  },

  // Authenticate user
  authenticateUser: (email: string, password?: string, loginMethod = "manual"): StoredUser | null => {
    const users = userManager.getAllUsers()
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      return null
    }

    // For manual login, check password
    if (loginMethod === "manual" && password) {
      if (!user.passwordHash || user.passwordHash !== simpleHash(password)) {
        return null
      }
    }

    // For OAuth logins, just check if user exists and login method matches
    if (loginMethod !== "manual" && user.loginMethod !== loginMethod) {
      return null
    }

    return user
  },

  // Get user by ID
  getUserById: (id: string): StoredUser | null => {
    const users = userManager.getAllUsers()
    return users.find((user) => user.id === id) || null
  },

  // Update user data
  updateUser: (userId: string, updates: Partial<StoredUser>): boolean => {
    const users = userManager.getAllUsers()
    const userIndex = users.findIndex((user) => user.id === userId)

    if (userIndex === -1) {
      return false
    }

    users[userIndex] = { ...users[userIndex], ...updates }
    localStorage.setItem("registered_users", JSON.stringify(users))
    return true
  },
}
