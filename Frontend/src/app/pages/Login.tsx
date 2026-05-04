import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../../imports/AZ1HylrRIHU2bgVKHbaC2A-AZ1HylrSZmM6JSLqFu-l_w.jpg';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { API } from '../api/axios';
import { GoogleLogin } from '@react-oauth/google';

// ─── Types ────────────────────────────────────────────────────────────────────
type MainView = 'login' | 'forgot';
type ForgotStep = 'email' | 'otp' | 'newpass' | 'done';

// ─── Forgot Password Component ────────────────────────────────────────────────
function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<ForgotStep>('email');
  const [fpEmail, setFpEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const stepIndex = { email: 0, otp: 1, newpass: 2, done: 2 }[step];
  const otpString = otp.join('');

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!fpEmail) return toast.error('Email daalo pehle!');
    setIsLoading(true);
    try {
      await API.post('/auth/forgot-password', { email: fpEmail });
      toast.success('OTP sent! Check your email.');
      setResendTimer(60);
      setStep('otp');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Kuch galat hua, try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── OTP input handlers ────────────────────────────────────────────────────
  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const updated = [...otp];
    updated[idx] = val;
    setOtp(updated);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otpString.length < 6) return toast.error('Poora 6-digit OTP daalo!');
    setIsLoading(true);
    try {
      await API.post('/auth/verify-otp', { email: fpEmail, otp: otpString });
      toast.success('OTP verified!');
      setStep('newpass');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP.');
      // Clear boxes on wrong OTP
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      await API.post('/auth/forgot-password', { email: fpEmail });
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      setResendTimer(60);
      toast.success('New OTP sent!');
    } catch {
      toast.error('Resend failed, try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 3: Reset Password ─────────────────────────────────────────────────
  // Sends { email, otp, newPassword } — backend re-validates OTP as second guard
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) return toast.error('Dono fields bharo!');
    if (newPassword.length < 8) return toast.error('Password kam se kam 8 characters ka hona chahiye!');
    if (newPassword !== confirmPassword) return toast.error('Passwords match nahi ho rahe!');
    setIsLoading(true);
    try {
      await API.post('/auth/reset-password', {
        email: fpEmail,
        otp: otpString,
        newPassword,
      });
      setStep('done');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Reset failed, try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Password strength ─────────────────────────────────────────────────────
  const passwordStrength =
    (newPassword.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(newPassword) ? 1 : 0) +
    (/\d/.test(newPassword) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(newPassword) ? 1 : 0);

  const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <motion.div
      key="forgot"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      {/* Back button */}
      {step !== 'done' && (
        <motion.button
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
          whileHover={{ x: -5 }}
          onClick={
            step === 'email'
              ? onBack
              : () => setStep(step === 'otp' ? 'email' : 'otp')
          }
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{step === 'email' ? 'Back to Login' : 'Back'}</span>
        </motion.button>
      )}

      <motion.div
        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-100"
        whileHover={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
      >
        {/* Progress bar */}
        {step !== 'done' && (
          <div className="flex gap-2 mb-6">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-all duration-500"
                style={{ background: i <= stepIndex ? '#f97316' : '#e5e7eb' }}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── Step 1: Email ── */}
          {step === 'email' && (
            <motion.div
              key="fp-email"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password?</h2>
                <p className="text-gray-500 text-sm">
                  Registered email daalo — hum OTP bhejenge.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={fpEmail}
                      onChange={e => setFpEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <motion.button
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP →'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <motion.div
              key="fp-otp"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-7 h-7 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Enter OTP</h2>
                <p className="text-gray-500 text-sm">
                  6-digit code bheja gaya{' '}
                  <span className="font-semibold text-gray-700">{fpEmail}</span> pe
                </p>
              </div>

              <div className="flex gap-2 justify-center mb-4" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(e.target.value, idx)}
                    onKeyDown={e => handleOtpKeyDown(e, idx)}
                    className={`w-11 h-12 text-center text-xl font-bold bg-gray-50 border-2 rounded-xl focus:outline-none transition-all
                      ${digit
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 focus:border-orange-400'
                      }`}
                  />
                ))}
              </div>

              <p className="text-center text-sm text-gray-500 mb-5">
                Code nahi aaya?{' '}
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0 || isLoading}
                  className={`font-semibold transition-colors ${
                    resendTimer > 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-orange-600 hover:text-orange-700'
                  }`}
                >
                  Resend OTP
                </button>
                {resendTimer > 0 && (
                  <span className="text-gray-400"> ({resendTimer}s)</span>
                )}
              </p>

              <motion.button
                onClick={handleVerifyOtp}
                disabled={isLoading || otpString.length < 6}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP →'}
              </motion.button>
            </motion.div>
          )}

          {/* ── Step 3: New Password ── */}
          {step === 'newpass' && (
            <motion.div
              key="fp-newpass"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-7 h-7 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">New Password</h2>
                <p className="text-gray-500 text-sm">Ek strong naya password choose karo.</p>
              </div>

              <div className="space-y-4">
                {/* New password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i < passwordStrength
                                ? strengthColors[passwordStrength - 1]
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      {passwordStrength > 0 && (
                        <p className={`text-xs mt-1 ml-1 ${
                          passwordStrength <= 1 ? 'text-red-500' :
                          passwordStrength === 2 ? 'text-orange-500' :
                          passwordStrength === 3 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {strengthLabels[passwordStrength]}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                      placeholder="Repeat password"
                      className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none transition-all focus:bg-white ${
                        confirmPassword && newPassword !== confirmPassword
                          ? 'border-red-400 focus:border-red-400'
                          : confirmPassword && newPassword === confirmPassword
                          ? 'border-green-400 focus:border-green-400'
                          : 'border-gray-200 focus:border-orange-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1 ml-1">Passwords match nahi ho rahe</p>
                  )}
                </div>

                <motion.button
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Done ── */}
          {step === 'done' && (
            <motion.div
              key="fp-done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="text-center py-4"
            >
              <motion.div
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              >
                <svg
                  className="w-10 h-10 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
              <p className="text-gray-500 text-sm mb-8">
                Tumhara password successfully reset ho gaya. Ab naye password se login karo!
              </p>
              <motion.button
                onClick={onBack}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Back to Login
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Login Component ─────────────────────────────────────────────────────
export function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [view, setView] = useState<MainView>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');

    setIsLoading(true);
    API.post('/auth/login', { email, password })
      .then(res => {
        const data = res.data.data || res.data;
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        login(data.user);
        navigate('/profile');
      })
      .catch(err => {
        console.log(err.response?.data);
        toast.error('Invalid email or password');
      })
      .finally(() => setIsLoading(false));
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await API.post('/auth/google', { credential: credentialResponse.credential });
      const data = res.data.data;
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      login(data.user);
      toast.success('Google login successful!');
      navigate('/profile');
    } catch {
      toast.error('Google login failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
        transition={{ duration: 25, repeat: Infinity }}
      />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <AnimatePresence mode="wait">

          {view === 'forgot' && (
            <ForgotPassword key="forgot" onBack={() => setView('login')} />
          )}

          {view === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <motion.button
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
                whileHover={{ x: -5 }}
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </motion.button>

              <motion.div
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-100"
                whileHover={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
              >
                <div className="text-center mb-8">
                  <motion.img
                    src={logoImg}
                    alt="Cultural Connect India"
                    className="w-20 h-20 mx-auto rounded-2xl shadow-lg mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  />
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
                  <p className="text-gray-600">Login to explore India's culture</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-sm text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </motion.button>
                </form>

                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-sm text-gray-500">OR</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google login failed.')}
                    useOneTap={false}
                    shape="rectangular"
                    size="large"
                    width="100%"
                    text="continue_with"
                  />
                </div>

                <p className="text-center mt-6 text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate('/signup')}
                    className="text-orange-600 hover:text-orange-700 font-bold"
                  >
                    Sign Up
                  </button>
                </p>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}