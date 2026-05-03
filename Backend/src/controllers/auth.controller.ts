import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { sendSuccess, sendError } from '../utils/response.utils';
import { AppError } from '../middleware/error.middleware';
import { sendWelcomeEmail, sendOTPEmail } from '../utils/email';

// POST /api/v1/auth/register
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, location } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      sendError(res, 'An account with this email already exists.', 409);
      return;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      location,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const payload = { id: user._id.toString(), email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 8);

    await User.findByIdAndUpdate(user._id, {
      otp,
      otpExpires: new Date(Date.now() + 5 * 60 * 1000),
      refreshToken: hashedRefreshToken,
    });

    // ✅ FIX: Arguments sahi order mein — sendWelcomeEmail(name, email)
    await sendWelcomeEmail(user.name, user.email);
    await sendOTPEmail(user.email, otp);

    const safeUser = await User.findById(user._id);

    sendSuccess(
      res,
      { user: safeUser, accessToken, refreshToken },
      'Account created successfully.',
      201
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select('+password +refreshToken');

    if (!user) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    if (!user.isActive) {
      sendError(res, 'Your account has been deactivated.', 403);
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    const payload = { id: user._id.toString(), email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await User.findByIdAndUpdate(user._id, {
      refreshToken: await bcrypt.hash(refreshToken, 8),
    });

    const safeUser = await User.findById(user._id);

    sendSuccess(res, { user: safeUser, accessToken, refreshToken }, 'Login successful.');
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/refresh
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) { sendError(res, 'Refresh token is required.', 400); return; }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user?.refreshToken) { sendError(res, 'Invalid refresh token.', 401); return; }

    const isValid = await bcrypt.compare(token, user.refreshToken);
    if (!isValid) { sendError(res, 'Invalid refresh token.', 401); return; }

    const payload = { id: user._id.toString(), email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await User.findByIdAndUpdate(user._id, {
      refreshToken: await bcrypt.hash(newRefreshToken, 8),
    });

    sendSuccess(res, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Token refreshed.');
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/logout
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await User.findByIdAndUpdate(req.user!.id, { $unset: { refreshToken: 1 } });
    sendSuccess(res, null, 'Logged out successfully.');
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/auth/me
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) throw new AppError('User not found.', 404);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/auth/update-profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, bio, location, avatar } = req.body;
    const updateData: any = { name, bio, location };

    if (avatar) updateData.avatar = avatar;
    if (req.file) updateData.avatar = req.file.path;

    const user = await User.findByIdAndUpdate(req.user!.id, updateData, { new: true });
    if (!user) throw new AppError('User not found.', 404);

    sendSuccess(res, { user }, 'Profile updated successfully.');
  } catch (error) {
    next(error);
  }
};