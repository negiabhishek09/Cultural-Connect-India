import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { sendSuccess, sendError } from '../utils/response.utils';
import { AppError } from '../middleware/error.middleware';
import { sendWelcomeEmail, sendOTPEmail } from '../services/email.service';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    // ✅ FIX: Fire & forget — await nahi, background mein jayengi
    sendWelcomeEmail(user.name, user.email).catch((e) => console.error('Welcome email failed:', e));
    sendOTPEmail(user.email, otp).catch((e) => console.error('OTP email failed:', e));

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

// POST /api/v1/auth/google
export const googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { credential } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) { sendError(res, 'Invalid Google token.', 401); return; }

    const { email, name, picture } = payload;

    let user = await User.findOne({ email: email!.toLowerCase() });

    if (!user) {
      user = await User.create({
        name,
        email: email!.toLowerCase(),
        password: Math.random().toString(36),
        avatar: picture,
        isVerified: true,
      });
      sendWelcomeEmail(user.name, user.email).catch((e) => console.error('Welcome email failed:', e));
    }

    const tokenPayload = { id: user._id.toString(), email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await User.findByIdAndUpdate(user._id, {
      refreshToken: await bcrypt.hash(refreshToken, 8),
    });

    const safeUser = await User.findById(user._id);
    sendSuccess(res, { user: safeUser, accessToken, refreshToken }, 'Google login successful.');
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      sendSuccess(res, null, 'If this email exists, an OTP has been sent.');
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await User.findByIdAndUpdate(user._id, {
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOTPEmail(user.email, otp);

    sendSuccess(res, null, 'OTP sent to your email.');
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/verify-otp
export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      sendError(res, 'Email and OTP are required.', 400);
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpires');

    if (!user) {
      sendError(res, 'No account found with this email.', 404);
      return;
    }

    if (!user.otp || !user.otpExpires) {
      sendError(res, 'OTP not requested. Please request a new one.', 400);
      return;
    }

    if (user.otp !== otp) {
      sendError(res, 'Invalid OTP.', 400);
      return;
    }

    if (user.otpExpires < new Date()) {
      sendError(res, 'OTP has expired. Please request a new one.', 400);
      return;
    }

    await User.findByIdAndUpdate(user._id, {
      otpExpires: new Date(Date.now() + 15 * 60 * 1000),
    });

    sendSuccess(res, { otpVerified: true }, 'OTP verified successfully.');
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/reset-password
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      sendError(res, 'Email, OTP, and new password are required.', 400);
      return;
    }

    if (newPassword.length < 8) {
      sendError(res, 'Password must be at least 8 characters.', 400);
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpires +password');

    if (!user) {
      sendError(res, 'No account found with this email.', 404);
      return;
    }

    if (!user.otp || !user.otpExpires) {
      sendError(res, 'OTP session expired. Please start over.', 400);
      return;
    }

    if (user.otp !== otp) {
      sendError(res, 'Invalid OTP.', 400);
      return;
    }

    if (user.otpExpires < new Date()) {
      sendError(res, 'Session expired. Please request a new OTP.', 400);
      return;
    }

    user.password = newPassword;
    await user.save();

    await User.findByIdAndUpdate(user._id, {
      $unset: { otp: 1, otpExpires: 1 },
    });

    sendSuccess(res, null, 'Password reset successfully.');
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/verify-email
export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      sendError(res, 'Email and OTP are required.', 400);
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpires');

    if (!user) {
      sendError(res, 'No account found with this email.', 404);
      return;
    }

    if (user.isVerified) {
      sendSuccess(res, null, 'Email is already verified.');
      return;
    }

    if (!user.otp || !user.otpExpires) {
      sendError(res, 'No OTP found. Please request a new one.', 400);
      return;
    }

    if (user.otp !== otp) {
      sendError(res, 'Invalid OTP.', 400);
      return;
    }

    if (user.otpExpires < new Date()) {
      sendError(res, 'OTP has expired. Please request a new one.', 400);
      return;
    }

    await User.findByIdAndUpdate(user._id, {
      isVerified: true,
      $unset: { otp: 1, otpExpires: 1 },
    });

    sendSuccess(res, null, 'Email verified successfully.');
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/resend-verification-otp
export const resendVerificationOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      sendError(res, 'Email is required.', 400);
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      sendSuccess(res, null, 'If this account exists, an OTP has been sent.');
      return;
    }

    if (user.isVerified) {
      sendSuccess(res, null, 'Email is already verified.');
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await User.findByIdAndUpdate(user._id, {
      otp,
      otpExpires: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOTPEmail(user.email, otp);

    sendSuccess(res, null, 'OTP sent to your email.');
  } catch (error) {
    next(error);
  }
};