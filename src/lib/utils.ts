export const getLatestMonday = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const latestMonday = new Date(today);
  latestMonday.setDate(today.getDate() - daysSinceMonday);
  latestMonday.setHours(0, 0, 0, 0);
  return latestMonday;
};

// Utility function to check if we're running in a test environment
export const isTestEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
};

// Custom logger that suppresses logs during tests
export const logger = {
  error: (message: string, error?: any) => {
    if (!isTestEnvironment()) {
      console.error(message, error);
    }
  }
};

const dayToNumber = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 0,
} as const;

export const adjustScheduleToCurrentWeek = (
  subjects: { title: string; start: Date; end: Date; day?: string }[]
): { title: string; start: Date; end: Date }[] => {
  const latestMonday = getLatestMonday();

  return subjects.map((subject) => {
    if (!subject.day) return subject;

    // Get the numeric day (1 for Monday, etc.)
    const dayNum = dayToNumber[subject.day as keyof typeof dayToNumber];
    if (dayNum === undefined) return subject;

    // Calculate days to add from Monday (0 for Monday, 1 for Tuesday, etc.)
    const daysToAdd = dayNum - 1;

    // Create new date objects for start and end times
    const subjectStart = new Date(subject.start);
    const subjectEnd = new Date(subject.end);

    // Create the adjusted dates by adding days to Monday
    const adjustedStart = new Date(latestMonday);
    adjustedStart.setDate(latestMonday.getDate() + daysToAdd);
    adjustedStart.setHours(
      subjectStart.getHours(),
      subjectStart.getMinutes(),
      0,
      0
    );

    const adjustedEnd = new Date(latestMonday);
    adjustedEnd.setDate(latestMonday.getDate() + daysToAdd);
    adjustedEnd.setHours(
      subjectEnd.getHours(),
      subjectEnd.getMinutes(),
      0,
      0
    );

    return {
      title: subject.title,
      start: adjustedStart,
      end: adjustedEnd,
    };
  });
};
