import express from "express";
import dotenv from "dotenv";
dotenv.config();
import "dotenv/config";
import app from "./app";
import { connectDB, disconnectDB } from "./config/database";
import { logger } from "./config/logger";
import searchRoutes from "./routes/search.routes";
import authRoutes from "./routes/auth.routes";
import communityRoutes from "./routes/community.routes";
import testRoutes from "./routes/test.routes";





app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", searchRoutes);
app.use("/uploads", express.static("uploads"));

app.use("/api/v1/community", communityRoutes);
app.use("/api/v1", testRoutes);


const PORT = process.env.PORT || 8000;

async function bootstrap() {
  try {
   
    await connectDB();

    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Base URL: http://localhost:${PORT}/api/v1`);
    });

  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}


process.on("SIGINT", async () => {
  logger.info("Shutting down server...");
  await disconnectDB();
  process.exit(0);
});

bootstrap();