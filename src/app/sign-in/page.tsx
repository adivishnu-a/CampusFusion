'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const roles = [
  { id: 'admin', label: 'Admin' },
  { id: 'teacher', label: 'Teacher' },
  { id: 'student', label: 'Student' },
  { id: 'parent', label: 'Parent' },
]

export default function SignIn() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('admin')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const username = formData.get('username') as string
      const password = formData.get('password') as string

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      })

      const data = await res.json()

      if (data.success) {
        // Force a hard reload to ensure middleware picks up the new cookie
        window.location.href = data.redirect
      } else {
        // Handle error (show error message to user)
        console.error('Login failed:', data.error)
        setError(data.error || 'Invalid credentials')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-16 h-16 mb-4">
            <Image 
              src="/logo.png" 
              alt="CampusFusion Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-campDarwinCobaltBlue to-campDarwinMixedBlue bg-clip-text text-transparent">
            CampusFusion
          </h1>
          <p className="text-gray-500 mt-2 text-center">
            Sign in to your account
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="mb-6">
          <div className="flex rounded-md bg-gray-100 p-1">
            {roles.map((roleOption) => (
              <button
                key={roleOption.id}
                onClick={() => setRole(roleOption.id)}
                className={`
                  flex-1 text-sm font-medium rounded-md py-2 px-3 transition-all duration-200
                  ${role === roleOption.id
                    ? 'bg-white text-campDarwinCobaltBlue shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                {roleOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Username</label>
            <input
              type="text"
              name="username"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm text-center">
              {error}
            </p>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-campDarwinCobaltBlue text-white p-2 rounded-md hover:bg-opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}