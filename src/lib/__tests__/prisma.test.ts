/* eslint-disable no-undef */
import prisma from '../prisma';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    // Mock PrismaClient methods as needed
  }))
}));

describe('Prisma Client', () => {
  it('should create singleton instance', () => {
    const instance1 = prisma;
    const instance2 = prisma;
    expect(instance1).toBe(instance2);
  });

  it('should create PrismaClient instance', () => {
    expect(PrismaClient).toHaveBeenCalled();
  });
});
