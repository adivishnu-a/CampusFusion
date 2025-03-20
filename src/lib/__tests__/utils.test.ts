/* eslint-disable no-undef */
import { getLatestMonday, adjustScheduleToCurrentWeek } from '../utils';

describe('getLatestMonday', () => {
  it('should return the most recent Monday when called on any day of the week', () => {
    // Mock current date to a specific Wednesday (2024-01-17)
    const mockDate = new Date(2024, 0, 17);
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    const result = getLatestMonday();
    
    // Should return Monday (2024-01-15)
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);

    jest.useRealTimers();
  });

  it('should return same date when current date is Monday', () => {
    const mockDate = new Date(2024, 0, 15); // A Monday
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    const result = getLatestMonday();
    expect(result.getDate()).toBe(15);

    jest.useRealTimers();
  });

  it('should handle year/month transitions correctly', () => {
    const mockDate = new Date(2024, 0, 2); // Tuesday in new year
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    const result = getLatestMonday();
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(1);

    jest.useRealTimers();
  });
});

describe('adjustScheduleToCurrentWeek', () => {
  beforeEach(() => {
    // Mock current date to Monday (2024-01-15)
    const mockDate = new Date(2024, 0, 15);
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should adjust schedule to current week correctly', () => {
    const mockSubjects = [
      {
        title: 'Math',
        start: new Date(2024, 0, 1, 9, 0), // 9:00 AM
        end: new Date(2024, 0, 1, 10, 0),  // 10:00 AM
        day: 'WEDNESDAY'
      }
    ];

    const result = adjustScheduleToCurrentWeek(mockSubjects);

    // Should be adjusted to Wednesday (2024-01-17)
    expect(result[0].start.getFullYear()).toBe(2024);
    expect(result[0].start.getMonth()).toBe(0);
    expect(result[0].start.getDate()).toBe(17);
    expect(result[0].start.getHours()).toBe(9);
    expect(result[0].start.getMinutes()).toBe(0);

    expect(result[0].end.getFullYear()).toBe(2024);
    expect(result[0].end.getMonth()).toBe(0);
    expect(result[0].end.getDate()).toBe(17);
    expect(result[0].end.getHours()).toBe(10);
    expect(result[0].end.getMinutes()).toBe(0);
  });

  it('should return original subject if day is not provided', () => {
    const mockSubjects = [
      {
        title: 'Math',
        start: new Date(2024, 0, 1, 9, 0),
        end: new Date(2024, 0, 1, 10, 0)
      }
    ];

    const result = adjustScheduleToCurrentWeek(mockSubjects);
    expect(result[0]).toEqual(mockSubjects[0]);
  });

  it('should return original subject if day is invalid', () => {
    const mockSubjects = [
      {
        title: 'Math',
        start: new Date(2024, 0, 1, 9, 0),
        end: new Date(2024, 0, 1, 10, 0),
        day: 'INVALID_DAY'
      }
    ];

    const result = adjustScheduleToCurrentWeek(mockSubjects);
    expect(result[0].start).toEqual(mockSubjects[0].start);
    expect(result[0].end).toEqual(mockSubjects[0].end);
  });

  it('should handle multiple subjects correctly', () => {
    const mockDate = new Date(2024, 0, 15); // Monday
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    const mockSubjects = [
      {
        title: 'Math',
        start: new Date(2024, 0, 1, 9, 0),
        end: new Date(2024, 0, 1, 10, 0),
        day: 'WEDNESDAY'
      },
      {
        title: 'Physics',
        start: new Date(2024, 0, 1, 11, 0),
        end: new Date(2024, 0, 1, 12, 0),
        day: 'FRIDAY'
      }
    ];

    const result = adjustScheduleToCurrentWeek(mockSubjects);

    expect(result[0].start.getDate()).toBe(17); // Wednesday
    expect(result[1].start.getDate()).toBe(19); // Friday

    jest.useRealTimers();
  });

  it('should preserve time portions when adjusting dates', () => {
    const mockDate = new Date(2024, 0, 15);
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    const mockSubjects = [{
      title: 'Math',
      start: new Date(2024, 0, 1, 14, 30), // 2:30 PM
      end: new Date(2024, 0, 1, 15, 45),   // 3:45 PM
      day: 'THURSDAY'
    }];

    const result = adjustScheduleToCurrentWeek(mockSubjects);

    expect(result[0].start.getHours()).toBe(14);
    expect(result[0].start.getMinutes()).toBe(30);
    expect(result[0].end.getHours()).toBe(15);
    expect(result[0].end.getMinutes()).toBe(45);

    jest.useRealTimers();
  });
});