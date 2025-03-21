/* eslint-disable no-undef */
import { GET } from '../user/role/route';
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn()
}));
jest.mock('@/lib/prisma');
jest.mock('@clerk/nextjs');
jest.mock('@clerk/nextjs/server');
jest.mock('@/lib/s3');
jest.mock('@aws-sdk/client-s3');

describe('User Role API', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    mockRequest = new NextRequest(
      new Request('http://localhost:3000/api/user/role')
    );
    jest.clearAllMocks();
  });

  it('should return role and userId for authenticated user', async () => {
    const mockAuth = {
      sessionClaims: {
        metadata: {
          role: 'admin',
          userId: '123'
        }
      }
    };

    ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      role: 'admin',
      userId: '123'
    });
  });

  it('should return 401 if user has no role', async () => {
    const mockAuth = {
      sessionClaims: {
        metadata: {}
      }
    };

    ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should handle server errors gracefully', async () => {
    ((auth as unknown) as jest.Mock).mockRejectedValueOnce(new Error('Auth error'));

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch user role' });
  });
});

describe('Server Actions', () => {
});