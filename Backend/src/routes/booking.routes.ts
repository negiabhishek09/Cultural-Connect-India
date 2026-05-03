import { Router, Request, Response } from 'express';

import { sendBookingConfirmationEmail } from '../utils/email'; // 



const router = Router();

// ✅ POST /api/v1/bookings/confirm
router.post('/confirm', async (req: Request, res: Response) => {
    try {
        const { name, email, phone, date, guests, title, price } = req.body;

        if (!name || !email || !title || !price) {
            return res.status(400).json({
                success: false,
                message: 'name, email, title price  are required '
            });
        }

        // ✅ EMAIL SAFE (error aaye toh bhi booking fail na ho)
        try {
            await sendBookingConfirmationEmail(email, name, {
                title,
                price,
                date,
                guests,
                phone,
            });
        } catch (error: any) {
            console.error("❌ Email failed:", error.message);
        }

        // ✅ SUCCESS RESPONSE (yeh try ke andar hi hona chahiye)
        return res.json({
            success: true,
            message: 'Booking confirmed! (email optional)'
        });

    } catch (err: any) {
        console.error('Booking error:', err.message);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

export default router;