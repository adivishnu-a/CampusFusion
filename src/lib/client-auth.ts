import type { AuthToken } from './auth'

export async function getClientSession(): Promise<AuthToken | null> {
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
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/sign-in'
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
