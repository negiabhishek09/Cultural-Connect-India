import * as SibApiV3Sdk from '@getbrevo/brevo';
import { logger } from '../config/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

logger.info('✅ Brevo API ready');

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = {
      email: 'aa2625001@smtp-brevo.com',
      name: 'Cultural Connect India',
    };
    sendSmtpEmail.to = [{ email: options.to }];
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.html;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    logger.info(`Email sent → ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error('Email send failed:', error);
  }
};

// ✅ Welcome email
export const sendWelcomeEmail = (name: string, email: string) =>
  sendEmail({
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

// ✅ OTP email
export const sendOTPEmail = async (email: string, otp: string) => {
  await sendEmail({
    to: email,
    subject: 'Your OTP Code — Culture Connect India',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">Your OTP Code</h2>
        <div style="background: #fff7ed; border-radius: 8px; padding: 20px; text-align: center;">
          <p style="font-size: 36px; font-weight: bold; color: #ea580c; letter-spacing: 8px;">${otp}</p>
        </div>
        <p style="color: #6b7280;">Your OTP code is valid for 5 minutes.</p>
      </div>
    `,
  });
};

// ✅ Order confirmation email
export const sendOrderConfirmationEmail = (
  name: string,
  email: string,
  orderId: string,
  totalAmount: number
) =>
  sendEmail({
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

// ✅ Event registration email
export const sendEventRegistrationEmail = async (
  email: string,
  name: string,
  event: {
    name: string;
    startDate: Date;
    endDate: Date;
    location: string;
    venue?: string;
    tag: string;
  }
) => {
  const startDate = new Date(event.startDate).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const endDate = new Date(event.endDate).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  await sendEmail({
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
        </div>
      </div>`,
  });
};

// ✅ Booking confirmation email
export const sendBookingConfirmationEmail = async (
  email: string,
  name: string,
  booking: {
    title: string;
    price: string;
    date?: string;
    guests?: number;
    phone?: string;
  }
) => {
  const bookingDate = booking.date
    ? new Date(booking.date).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'Date TBD';

  await sendEmail({
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
        </div>
      </div>`,
  });
};