import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined')
}

const JWT_SECRET = process.env.JWT_SECRET
const BEARER_PREFIX = process.env.BEARER_PREFIX || 'adivishnucf'

export interface AuthToken {
  userId: string
  username: string
  role: string
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcryptjs.compare(password, hashedPassword)
}

export function createToken(payload: AuthToken): string {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: '24h',
      algorithm: 'HS256'
    })
    const bearerToken = `${BEARER_PREFIX}${token}`
    console.log('Token created with bearer prefix')
    return bearerToken
  } catch (error) {
    console.error('Token creation error:', error)
    throw error
  }
}

export function validateToken(token: string): AuthToken | null {
  try {
    if (!token.startsWith(BEARER_PREFIX)) {
      console.log('Token missing bearer prefix')
      return null
    }

    const actualToken = token.slice(BEARER_PREFIX.length)
    const [header, payload, signature] = actualToken.split('.')
    if (!header || !payload || !signature) return null

    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString())
    
    if (!decodedPayload.userId || !decodedPayload.username || !decodedPayload.role) {
      console.log('Token missing required fields')
      return null
    }

    if (decodedPayload.exp && decodedPayload.exp < Date.now() / 1000) {
      console.log('Token expired')
      return null
    }

    return decodedPayload as AuthToken
  } catch (error) {
    console.error('Token validation error:', error)
    return null
  }
}

export function verifyToken(token: string): AuthToken | null {
  try {
    if (!token.startsWith(BEARER_PREFIX)) {
      console.log('Token missing bearer prefix')
      return null
    }

    const actualToken = token.slice(BEARER_PREFIX.length)
    const decoded = jwt.verify(actualToken, JWT_SECRET) as AuthToken
    return decoded
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}
