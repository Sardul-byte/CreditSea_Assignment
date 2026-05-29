const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const MIN_AGE = 23;
const MAX_AGE = 50;
const MIN_MONTHLY_INCOME = 25_000;

export interface BreInput {
  dob: Date;
  monthlyIncome: number;
  pan: string;
  employmentMode: string;
}

export interface BreResult {
  passed: boolean;
  reason?: string;
}

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age;
}

export function runBRE(data: BreInput): BreResult {
  const age = calculateAge(data.dob);

  if (age < MIN_AGE || age > MAX_AGE) {
    return {
      passed: false,
      reason: `Age must be between ${MIN_AGE} and ${MAX_AGE} years`,
    };
  }

  if (data.monthlyIncome < MIN_MONTHLY_INCOME) {
    return {
      passed: false,
      reason: `Monthly income must be at least ${MIN_MONTHLY_INCOME}`,
    };
  }

  const pan = data.pan.trim().toUpperCase();
  if (!PAN_REGEX.test(pan)) {
    return {
      passed: false,
      reason: "Invalid PAN format",
    };
  }

  if (data.employmentMode === "unemployed") {
    return {
      passed: false,
      reason: "Unemployed applicants are not eligible",
    };
  }

  return { passed: true };
}
