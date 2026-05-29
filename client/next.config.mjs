import path from "path";
import { fileURLToPath } from "url";
// import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dotenv.config({ path: path.join(__dirname, "../.env") });

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
