// Registration stays open until the end of the deadline day in New Zealand (12:00 UTC).
export const isRegistrationClosed = (registrationDeadline: string) => {
  const [year, month, day] = registrationDeadline.split('-').map(Number);
  return Date.now() > Date.UTC(year, month - 1, day, 12, 0, 0, 0);
};
