/* eslint-disable no-undef */
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Setup environment variables
process.env.BUCKET_NAME = 'test-bucket';
process.env.S3_REGION = 'test-region';
process.env.AWS_ACCESS_KEY = 'test-access-key';
process.env.AWS_SECRET_KEY = 'test-secret-key';
process.env.CLERK_SECRET_KEY = 'test-clerk-key';
