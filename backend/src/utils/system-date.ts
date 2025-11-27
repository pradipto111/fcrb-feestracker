/**
 * System Date Manager for Debugging
 * Allows setting a custom "current date" for testing payment scenarios
 */

let systemDate: Date | null = null;

export function getSystemDate(): Date {
  return systemDate || new Date();
}

export function setSystemDate(date: Date | null): void {
  systemDate = date;
}

export function resetSystemDate(): void {
  systemDate = null;
}

export function isSystemDateSet(): boolean {
  return systemDate !== null;
}






