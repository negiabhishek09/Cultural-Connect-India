import dotenv from "dotenv";
dotenv.config();

import express from "express";
import app from "./app";
import { connectDB, disconnectDB } from "./config/database";
import { logger } from "./config/logger";
import searchRoutes from "./routes/search.routes";
import authRoutes from "./routes/auth.routes";
import communityRoutes from "./routes/community.routes";
import testRoutes from "./routes/test.routes";

// ✅ FIX: Ye duplicate routes hata diye - already app.ts mein register hain
// app.use("/api/v1/auth", authRoutes);          // ❌ REMOVE - duplicate
// app.use("/api/v1", searchRoutes);             // ❌ REMOVE - duplicate
// app.use("/api/v1/community", communityRoutes);// ❌ REMOVE - duplicate
// app.use("/api/v1", testRoutes);               // ❌ REMOVE - duplicate

// ✅ Sirf yahi rakha - uploads app.ts mein nahi tha
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 8000;

async function bootstrap() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      // ✅ FIX: [logger.info](http://logger.info) broken syntax fix kiya
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`🚀 Base URL: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  // ✅ FIX: [logger.info](http://logger.info) broken syntax fix kiya
  logger.info("🛑 Shutting down server...");
  await disconnectDB();
  process.exit(0);
});

bootstrap();