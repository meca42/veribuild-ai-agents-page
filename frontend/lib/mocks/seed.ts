import { faker } from '@faker-js/faker';

faker.seed(42);

export const generateId = (prefix: string) => `${prefix}-${faker.string.alphanumeric(12)}`;

export const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const randomElements = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

export const randomPastDate = (days: number): Date => {
  return new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000);
};

export const randomFutureDate = (days: number): Date => {
  return new Date(Date.now() + Math.random() * days * 24 * 60 * 60 * 1000);
};

export { faker };
