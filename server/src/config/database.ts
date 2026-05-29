import dns from "dns";
import mongoose from "mongoose";

// Solves querySrv ECONNREFUSED error on Windows/certain network environments when resolving Atlas SRV records
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  console.warn("Failed to set DNS servers, proceeding with default resolution:", err);
}

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not defined");
  }

  const censoredUri = uri.replace(/:([^:@]+)@/, ":****@");
  console.log(`Connecting to: ${censoredUri}`);

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}

