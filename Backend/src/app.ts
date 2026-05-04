import testRoutes from './routes/test.routes';
import cors from 'cors';
import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { logger } from './config/logger';
import communityRoutes from './routes/community.routes';
import authRoutes from './routes/auth.routes';
import searchRoutes from './routes/search.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from "./routes/admin.routes";
import { errorHandler, notFound } from './middleware/error.middleware';
import eventRoutes from "./routes/event.routes";
import productRoutes from "./routes/product.routes";
import exploreRoutes from "./routes/explore.routes";
import bookingRoutes from "./routes/booking.routes";
import stateRoutes from "./routes/state.routes";
import orderRoutes from "./routes/order.routes";
import cartRoutes from "./routes/cart.routes";
import postRoutes from "./routes/post.routes";

const app: Application = express();

// ✅ Trust proxy — Render ke liye zaroori
app.set('trust proxy', 1);

const PREFIX = process.env.API_PREFIX || '/api/v1';


app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://localhost:5173",
      "https://cultural-connect-india.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[];

    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /^https:\/\/cultural-connect-india(-[a-z0-9]+)*\.vercel\.app$/.test(origin)
    ) {
      callback(null, true);
    } else {
      const err = new Error(`CORS blocked for origin: ${origin}`);
      logger.error(err);
      callback(err);
    }
  },
  credentials: true,
}));

// ✅ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ✅ Compression
app.use(compression());

// ✅ Logger
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) }
}));

// ✅ Rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
}));

// ✅ Routes
app.use(`${PREFIX}/auth`, authRoutes);
app.use(`${PREFIX}/user`, userRoutes);
app.use(`${PREFIX}/admin`, adminRoutes);
app.use(`${PREFIX}`, searchRoutes);
app.use(`${PREFIX}/community`, communityRoutes);
app.use(`${PREFIX}`, testRoutes);
app.use(`${PREFIX}/events`, eventRoutes);
app.use(`${PREFIX}/products`, productRoutes);
app.use(`${PREFIX}/explore`, exploreRoutes);
app.use(`${PREFIX}/bookings`, bookingRoutes);
app.use(`${PREFIX}/states`, stateRoutes);
app.use(`${PREFIX}/orders`, orderRoutes);
app.use(`${PREFIX}/user/cart`, cartRoutes);
app.use(`${PREFIX}/posts`, postRoutes);

// ✅ Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get(PREFIX, (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Cultural Connect India API is running 🚀'
  });
});

// ✅ Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;