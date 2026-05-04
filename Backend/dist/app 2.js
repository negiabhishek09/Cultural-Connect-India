"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_routes_1 = __importDefault(require("./routes/test.routes"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("./config/logger");
const community_routes_1 = __importDefault(require("./routes/community.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const explore_routes_1 = __importDefault(require("./routes/explore.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const state_routes_1 = __importDefault(require("./routes/state.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const app = (0, express_1.default)();
// ✅ Trust proxy — Render ke liye zaroori
app.set('trust proxy', 1);
const PREFIX = process.env.API_PREFIX || '/api/v1';
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        const allowedOrigins = [
            "http://localhost:5173",
            "https://localhost:5173",
            "https://cultural-connect-india.vercel.app",
            process.env.FRONTEND_URL,
        ].filter(Boolean);
        if (!origin ||
            allowedOrigins.includes(origin) ||
            /^https:\/\/cultural-connect-india(-[a-z0-9]+)*\.vercel\.app$/.test(origin)) {
            callback(null, true);
        }
        else {
            const err = new Error(`CORS blocked for origin: ${origin}`);
            logger_1.logger.error(err);
            callback(err);
        }
    },
    credentials: true,
}));
// ✅ Body parser
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ✅ Security
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// ✅ Compression
app.use((0, compression_1.default)());
// ✅ Logger
app.use((0, morgan_1.default)('combined', {
    stream: { write: (msg) => logger_1.logger.http(msg.trim()) }
}));
// ✅ Rate limit
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
}));
// ✅ Routes
app.use(`${PREFIX}/auth`, auth_routes_1.default);
app.use(`${PREFIX}/user`, user_routes_1.default);
app.use(`${PREFIX}/admin`, admin_routes_1.default);
app.use(`${PREFIX}`, search_routes_1.default);
app.use(`${PREFIX}/community`, community_routes_1.default);
app.use(`${PREFIX}`, test_routes_1.default);
app.use(`${PREFIX}/events`, event_routes_1.default);
app.use(`${PREFIX}/products`, product_routes_1.default);
app.use(`${PREFIX}/explore`, explore_routes_1.default);
app.use(`${PREFIX}/bookings`, booking_routes_1.default);
app.use(`${PREFIX}/states`, state_routes_1.default);
app.use(`${PREFIX}/orders`, order_routes_1.default);
app.use(`${PREFIX}/user/cart`, cart_routes_1.default);
app.use(`${PREFIX}/posts`, post_routes_1.default);
// ✅ Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.get(PREFIX, (_req, res) => {
    res.json({
        success: true,
        message: 'Cultural Connect India API is running 🚀'
    });
});
// ✅ Error handlers
app.use(error_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
exports.default = app;
