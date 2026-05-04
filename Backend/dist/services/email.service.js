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
exports.sendBookingConfirmationEmail = exports.sendEventRegistrationEmail = exports.sendOrderConfirmationEmail = exports.sendOTPEmail = exports.sendWelcomeEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("../config/logger");
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'true', // ✅ Fixed
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield transporter.sendMail(Object.assign({ from: `"Cultural Connect India" <${process.env.EMAIL_FROM}>` }, options));
        logger_1.logger.info(`Email sent → ${options.to}: ${options.subject}`);
    }
    catch (error) {
        logger_1.logger.error('Email send failed:', error);
    }
});
exports.sendEmail = sendEmail;
// ✅ Welcome email
const sendWelcomeEmail = (name, email) => (0, exports.sendEmail)({
    to: email,
    subject: 'Welcome to Cultural Connect India 🇮🇳',
    html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:32px;border-radius:12px 12px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:26px;">Cultural Connect India</h1>
            <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;">Connecting India's Culture & Heritage</p>
          </div>
          <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
            <h2 style="color:#111827;">Namaste, ${name}! 🙏</h2>
            <p style="color:#4b5563;line-height:1.7;">
              Thank you for joining Cultural Connect India — a platform dedicated to celebrating
              and preserving India's incredible cultural heritage.
            </p>
            <a href="${process.env.CLIENT_URL}/explore"
              style="display:inline-block;background:#f97316;color:#fff;padding:13px 30px;border-radius:50px;text-decoration:none;font-weight:600;margin-top:16px;">
              Start Exploring →
            </a>
          </div>
        </div>`,
});
exports.sendWelcomeEmail = sendWelcomeEmail;
// ✅ OTP email
const sendOTPEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.sendEmail)({
        to: email,
        subject: 'Your OTP Code — Culture Connect India',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ea580c;">Your OTP Code</h2>
          <div style="background: #fff7ed; border-radius: 8px; padding: 20px; text-align: center;">
            <p style="font-size: 36px; font-weight: bold; color: #ea580c; letter-spacing: 8px;">${otp}</p>
          </div>
          <p style="color: #6b7280;">Yeh OTP 5 minutes mein expire ho jayega.</p>
        </div>
      `,
    });
});
exports.sendOTPEmail = sendOTPEmail;
// ✅ Order confirmation email
const sendOrderConfirmationEmail = (name, email, orderId, totalAmount) => (0, exports.sendEmail)({
    to: email,
    subject: `Order Confirmed #${orderId.slice(-8).toUpperCase()} 🎊`,
    html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:32px;border-radius:12px 12px 0 0;">
            <h1 style="color:#fff;margin:0;">Order Confirmed! 🎊</h1>
          </div>
          <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
            <p style="color:#111827;font-size:16px;">Hi ${name},</p>
            <div style="background:#fff7ed;padding:18px;border-radius:10px;border-left:4px solid #f97316;margin:20px 0;">
              <p style="margin:0;color:#111827;"><strong>Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</p>
              <p style="margin:10px 0 0;color:#111827;"><strong>Total:</strong> ₹${totalAmount.toLocaleString('en-IN')}</p>
            </div>
            <a href="${process.env.CLIENT_URL}/orders/${orderId}"
              style="display:inline-block;background:#f97316;color:#fff;padding:13px 30px;border-radius:50px;text-decoration:none;font-weight:600;margin-top:8px;">
              Track Your Order →
            </a>
          </div>
        </div>`,
});
exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;
// ✅ Event registration email
const sendEventRegistrationEmail = (email, name, event) => __awaiter(void 0, void 0, void 0, function* () {
    const startDate = new Date(event.startDate).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const endDate = new Date(event.endDate).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    yield (0, exports.sendEmail)({
        to: email,
        subject: `✅ Event Registration Confirmed — ${event.name}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Culture Connect India</h1>
            <p style="color: #fed7aa; margin: 5px 0 0;">Event Registration Confirmed 🎉</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #1f2937;">Namaste, ${name}! 🙏</h2>
            <div style="background: #fff7ed; border-left: 4px solid #ea580c; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #ea580c; margin: 0 0 15px;">${event.name}</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; width: 40%;">📅 Start Date</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${startDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">📅 End Date</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${endDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">📍 Location</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">
                    <a href="https://www.google.com/maps/search/${encodeURIComponent(event.location)}" target="_blank" style="color: #ea580c;">
                      ${event.location} 📍
                    </a>
                  </td>
                </tr>
                ${event.venue ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">🏛️ Venue</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${event.venue}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">🏷️ Category</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${event.tag}</td>
                </tr>
              </table>
            </div>
            <div style="background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <p style="color: #16a34a; font-weight: bold; font-size: 18px; margin: 0;">🎟️ Your Ticket</p>
              <p style="color: #6b7280; margin: 8px 0 0;">Registered as: <strong>${name}</strong></p>
              <p style="color: #6b7280; margin: 4px 0 0;">Email: <strong>${email}</strong></p>
            </div>
          </div>
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Culture Connect India 🇮🇳</p>
          </div>
        </div>
      `,
    });
});
exports.sendEventRegistrationEmail = sendEventRegistrationEmail;
// ✅ Booking confirmation email
const sendBookingConfirmationEmail = (email, name, booking) => __awaiter(void 0, void 0, void 0, function* () {
    const bookingDate = booking.date
        ? new Date(booking.date).toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })
        : 'Date TBD';
    yield (0, exports.sendEmail)({
        to: email,
        subject: `✅ Booking Confirmed — ${booking.title}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Culture Connect India</h1>
            <p style="color: #fed7aa; margin: 5px 0 0;">Booking Confirmed 🎉</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #1f2937;">Namaste, ${name}! 🙏</h2>
            <div style="background: #fff7ed; border-left: 4px solid #ea580c; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #ea580c; margin: 0 0 15px;">${booking.title}</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; width: 40%;">📅 Date</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${bookingDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">👥 Guests</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${booking.guests || 1} Person(s)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">💰 Total Price</td>
                  <td style="padding: 8px 0; color: #ea580c; font-weight: bold; font-size: 18px;">${booking.price}</td>
                </tr>
                ${booking.phone ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">📱 Phone</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${booking.phone}</td>
                </tr>` : ''}
              </table>
            </div>
            <div style="background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <p style="color: #16a34a; font-weight: bold; font-size: 18px; margin: 0;">🎟️ Booking Confirmed</p>
              <p style="color: #6b7280; margin: 8px 0 0;">Name: <strong>${name}</strong></p>
              <p style="color: #6b7280; margin: 4px 0 0;">Email: <strong>${email}</strong></p>
            </div>
          </div>
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Culture Connect India 🇮🇳</p>
          </div>
        </div>
      `,
    });
});
exports.sendBookingConfirmationEmail = sendBookingConfirmationEmail;
