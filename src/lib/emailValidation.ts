/**
 * Validates that an email address belongs to the exact domain "gokapital.com".
 *
 * Normalizes by trimming whitespace, converting to lowercase, splitting at "@",
 * and checking that the domain portion equals exactly "gokapital.com".
 *
 * This avoids false positives from loose checks like `endsWith("gokapital.com")`
 * which would accept domains like "fakegokapital.com".
 */
export const isGokapitalEmail = (email: string): boolean => {
  const normalized = email.trim().toLowerCase();
  const atIndex = normalized.lastIndexOf("@");
  if (atIndex < 1) return false;
  const username = normalized.slice(0, atIndex);
  const domain = normalized.slice(atIndex + 1);
  if (!username) return false;
  return domain === "gokapital.com";
};

export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();
