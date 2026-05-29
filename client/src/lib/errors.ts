import axios from "axios";

interface ApiErrorBody {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data as ApiErrorBody | undefined;
  if (data?.message) return data.message;

  if (data?.errors) {
    const first = Object.values(data.errors).flat()[0];
    if (first) return first;
  }

  return fallback;
}

export { getApiErrorMessage };
