import { jwtDecode } from 'jwt-decode';

export interface ClientToken {
    userId: string;
    username: string;
    role: string;
}

export async function getClientToken(): Promise<ClientToken | null> {
    try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) {
            return null;
        }

        const session = await response.json();
        if (!session) {
            return null;
        }

        return {
            userId: session.userId,
            username: session.username,
            role: session.role
        };
    } catch (error) {
        console.error('Token processing error:', error);
        return null;
    }
}