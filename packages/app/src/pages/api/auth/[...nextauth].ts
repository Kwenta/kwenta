import { PrismaAdapter } from '@next-auth/prisma-adapter'
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

import prismaClient from 'utils/prismadb'

export const authOptions = {
	adapter: PrismaAdapter(prismaClient),
	// Configure one or more authentication providers
	providers: [
		GoogleProvider({
			clientId: process.env.NEXT_PUBLIC_GOOGLE_ID || '',
			clientSecret: process.env.NEXT_PUBLIC_GOOGLE_SECRET || '',
		}),
	],
	strategy: 'database',
}

const handler = NextAuth(authOptions)

export default handler
