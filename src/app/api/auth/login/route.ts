import { NextResponse } from 'next/server'
import { comparePasswords, createToken } from '@/lib/server-auth'
import prisma from '@/lib/prisma'
import type { AuthToken } from '@/lib/server-auth'

export async function POST(req: Request) {
  try {
    const { username, password, role } = await req.json()
    console.log('Login attempt:', { username, role })

    let user = null
    switch (role) {
      case 'admin':
        user = await prisma.admin.findUnique({ where: { username } })
        break
      case 'teacher':
        user = await prisma.teacher.findUnique({ where: { username } })
        break
      case 'student':
        user = await prisma.student.findUnique({ where: { username } })
        break
      case 'parent':
        user = await prisma.parent.findUnique({ where: { username } })
        break
      default:
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    if (!user) {
      console.log('User not found:', { username, role })
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    const isValid = await comparePasswords(password, user.password)
    if (!isValid) {
      console.log('Invalid password for user:', username)
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const tokenPayload: AuthToken = {
      userId: user.id,
      username: user.username,
      role: role
    }

    const token = createToken(tokenPayload)
    console.log('Login successful, token created for:', { username, role })

    const response = NextResponse.json({ 
      success: true,
      redirect: `/${role}`
    })

    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
