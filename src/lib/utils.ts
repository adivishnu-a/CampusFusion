const getLatestMonday = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const latestMonday = today;
  latestMonday.setDate(today.getDate() - daysSinceMonday);
  return latestMonday;
};

export const adjustScheduleToCurrentWeek = (
  subjects: { title: string; start: Date; end: Date }[]
): { title: string; start: Date; end: Date }[] => {
  const latestMonday = getLatestMonday();

  return subjects.map((subject) => {
    const subjectDayOfWeek = subject.start.getDay();

    const daysFromMonday = subjectDayOfWeek === 0 ? 6 : subjectDayOfWeek - 1;

    const adjustedStartDate = new Date(latestMonday);

    adjustedStartDate.setDate(latestMonday.getDate() + daysFromMonday);
    adjustedStartDate.setHours(
      subject.start.getHours(),
      subject.start.getMinutes(),
      subject.start.getSeconds()
    );
    const adjustedEndDate = new Date(adjustedStartDate);
    adjustedEndDate.setHours(
      subject.end.getHours(),
      subject.end.getMinutes(),
      subject.end.getSeconds()
    );

    return {
      title: subject.title,
      start: adjustedStartDate,
      end: adjustedEndDate,
    };
  });
};
