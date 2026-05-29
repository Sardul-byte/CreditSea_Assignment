export {
  User,
  userSchema,
  USER_ROLES,
  EMPLOYMENT_MODES,
  type IUser,
  type UserRole,
  type EmploymentMode,
} from "./User";

export {
  LoanApplication,
  loanApplicationSchema,
  LOAN_STATUSES,
  LOAN_AMOUNT_MIN,
  LOAN_AMOUNT_MAX,
  TENURE_MIN_DAYS,
  TENURE_MAX_DAYS,
  FIXED_INTEREST_RATE,
  type ILoanApplication,
  type LoanStatus,
} from "./LoanApplication";

export {
  Payment,
  paymentSchema,
  type IPayment,
} from "./Payment";
