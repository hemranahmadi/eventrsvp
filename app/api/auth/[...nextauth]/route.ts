import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const nextAuthSecret = process.env.NEXTAUTH_SECRET

const handler = NextAuth({
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  secret: nextAuthSecret || "development-secret-change-in-production",
  debug: process.env.NODE_ENV === "development",
})

export { handler as GET, handler as POST }
