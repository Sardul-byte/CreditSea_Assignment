import cors from "cors";
import express from "express";
import path from "path";
import { connectDatabase } from "./config/database";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import borrowerRoutes from "./routes/borrower";
import collectionRoutes from "./routes/collection";
import disbursementRoutes from "./routes/disbursement";
import salesRoutes from "./routes/sales";
import sanctionRoutes from "./routes/sanction";

const app = express();
const PORT = process.env.PORT ?? 5000;

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/borrower", borrowerRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/sanction", sanctionRoutes);
app.use("/api/disbursement", disbursementRoutes);
app.use("/api/collection", collectionRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start(): Promise<void> {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
