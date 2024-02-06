import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
	// Configure one or more authentication providers
	providers: [
		GoogleProvider({
			clientId: process.env.NEXT_PUBLIC_GOOGLE_ID || '',
			clientSecret: process.env.NEXT_PUBLIC_GOOGLE_SECRET || '',
		}),
	],
	debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export default handler
