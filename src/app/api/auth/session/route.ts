import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/server-auth'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      console.log('No token found in session request')
      return NextResponse.json(null)
    }

    const session = verifyToken(token)

    if (!session) {
      console.log('Invalid token in session request')
      return NextResponse.json(null)
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(null)
  }
}
