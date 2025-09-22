export interface User {
  id: string
  name: string
  email: string
  image?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

export const authStorage = {
  getUser: (): User | null => {
    // NextAuth.js handles session management automatically
    return null
  },

  setUser: (user: User) => {
    // NextAuth.js handles session management automatically
  },

  removeUser: () => {
    // NextAuth.js handles session management automatically
  },
}
