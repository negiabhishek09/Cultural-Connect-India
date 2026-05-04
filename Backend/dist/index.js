"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const logger_1 = require("./config/logger");
// ✅ FIX: Ye duplicate routes hata diye - already app.ts mein register hain
// app.use("/api/v1/auth", authRoutes);          // ❌ REMOVE - duplicate
// app.use("/api/v1", searchRoutes);             // ❌ REMOVE - duplicate
// app.use("/api/v1/community", communityRoutes);// ❌ REMOVE - duplicate
// app.use("/api/v1", testRoutes);               // ❌ REMOVE - duplicate
// ✅ Sirf yahi rakha - uploads app.ts mein nahi tha
app_1.default.use("/uploads", express_1.default.static("uploads"));
const PORT = process.env.PORT || 8000;
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, database_1.connectDB)();
            app_1.default.listen(PORT, () => {
                // ✅ FIX: [logger.info](http://logger.info) broken syntax fix kiya
                logger_1.logger.info(`✅ Server running on port ${PORT}`);
                logger_1.logger.info(`🚀 Base URL: http://localhost:${PORT}/api/v1`);
            });
        }
        catch (error) {
            logger_1.logger.error("❌ Failed to start server:", error);
            process.exit(1);
        }
    });
}
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    // ✅ FIX: [logger.info](http://logger.info) broken syntax fix kiya
    logger_1.logger.info("🛑 Shutting down server...");
    yield (0, database_1.disconnectDB)();
    process.exit(0);
}));
bootstrap();
