export const LOAN_AMOUNT_MIN = 50_000;
export const LOAN_AMOUNT_MAX = 500_000;
export const LOAN_AMOUNT_STEP = 5_000;
export const TENURE_MIN_DAYS = 30;
export const TENURE_MAX_DAYS = 365;
export const INTEREST_RATE_ANNUAL = 12;

export function calculateSimpleInterest(
  principal: number,
  tenureDays: number
): number {
  return Math.round((principal * INTEREST_RATE_ANNUAL * tenureDays) / (365 * 100));
}

export function calculateTotalRepayment(
  principal: number,
  tenureDays: number
): number {
  return principal + calculateSimpleInterest(principal, tenureDays);
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
