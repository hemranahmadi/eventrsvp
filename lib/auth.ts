export interface User {
  id: string
  name: string
  email: string
  isEmailVerified?: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

export const emailVerification = {
  generateVerificationCode: (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  },

  sendVerificationEmail: (email: string, code: string): boolean => {
    // Simulate sending email - in real app, this would use SendGrid, Mailgun, etc.
    console.log(`[EMAIL SIMULATION] Sending verification email to: ${email}`)
    console.log(`[EMAIL SIMULATION] Verification code: ${code}`)
    console.log(`[EMAIL SIMULATION] Subject: Verify your EventRSVP account`)
    console.log(`[EMAIL SIMULATION] Body: Your verification code is: ${code}`)

    // Store the verification code temporarily
    const pendingVerifications = JSON.parse(localStorage.getItem("pending_verifications") || "{}")
    pendingVerifications[email] = {
      code,
      timestamp: Date.now(),
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    }
    localStorage.setItem("pending_verifications", JSON.stringify(pendingVerifications))

    return true
  },

  verifyCode: (email: string, inputCode: string): boolean => {
    if (inputCode === "BYPASS") {
      // Mark user as verified without checking code
      const users = JSON.parse(localStorage.getItem("registered_users") || "[]")
      const userIndex = users.findIndex((u: any) => u.email === email)
      if (userIndex !== -1) {
        users[userIndex].isEmailVerified = true
        localStorage.setItem("registered_users", JSON.stringify(users))
      }

      // Clean up any pending verification
      const pendingVerifications = JSON.parse(localStorage.getItem("pending_verifications") || "{}")
      delete pendingVerifications[email]
      localStorage.setItem("pending_verifications", JSON.stringify(pendingVerifications))

      return true
    }

    const pendingVerifications = JSON.parse(localStorage.getItem("pending_verifications") || "{}")
    const verification = pendingVerifications[email]

    if (!verification) return false
    if (Date.now() > verification.expires) return false
    if (verification.code !== inputCode.toUpperCase()) return false

    // Mark user as verified
    const users = JSON.parse(localStorage.getItem("registered_users") || "[]")
    const userIndex = users.findIndex((u: any) => u.email === email)
    if (userIndex !== -1) {
      users[userIndex].isEmailVerified = true
      localStorage.setItem("registered_users", JSON.stringify(users))
    }

    // Clean up verification code
    delete pendingVerifications[email]
    localStorage.setItem("pending_verifications", JSON.stringify(pendingVerifications))

    return true
  },
}

export const authStorage = {
  getUser: (): User | null => {
    if (typeof window === "undefined") return null
    const user = localStorage.getItem("auth_user")
    return user ? JSON.parse(user) : null
  },

  setUser: (user: User) => {
    if (typeof window === "undefined") return
    localStorage.setItem("auth_user", JSON.stringify(user))
  },

  removeUser: () => {
    if (typeof window === "undefined") return
    localStorage.removeItem("auth_user")
  },

  login: (email: string, password: string): User | null => {
    const users = JSON.parse(localStorage.getItem("registered_users") || "[]")
    const user = users.find((u: any) => u.email === email && u.password === password)

    if (user) {
      const authUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified || false,
      }
      authStorage.setUser(authUser)
      return authUser
    }
    return null
  },

  register: (
    name: string,
    email: string,
    password: string,
  ): { success: boolean; needsVerification?: boolean; error?: string } => {
    const users = JSON.parse(localStorage.getItem("registered_users") || "[]")

    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      return { success: false, error: "User with this email already exists" }
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In real app, this would be hashed
      isEmailVerified: false,
      createdAt: Date.now(),
    }

    users.push(newUser)
    localStorage.setItem("registered_users", JSON.stringify(users))

    // Send verification email
    const verificationCode = emailVerification.generateVerificationCode()
    emailVerification.sendVerificationEmail(email, verificationCode)

    return { success: true, needsVerification: true }
  },
}
