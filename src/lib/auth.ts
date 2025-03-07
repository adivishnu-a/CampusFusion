'use client'

export interface AuthToken {
  userId: string
  username: string
  role: string
}

export async function getSession(): Promise<AuthToken | null> {
  try {
    const response = await fetch('/api/auth/session')
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export async function logout() {
  try {
    const response = await fetch('/api/auth/logout', { method: 'POST' })
    if (response.ok) {
      window.location.href = '/sign-in'
    }
  } catch (error) {
    console.error('Logout failed:', error)
  }
}