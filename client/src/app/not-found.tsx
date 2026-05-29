import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <p className="text-6xl font-bold text-gray-300">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-gray-600">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Go to login
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
