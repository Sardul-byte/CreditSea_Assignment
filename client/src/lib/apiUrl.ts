export function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined" ? "" : "http://localhost:5000")
  );
}

export function getUploadUrl(path: string | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = getApiBaseUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
