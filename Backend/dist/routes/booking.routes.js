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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const email_1 = require("../utils/email"); // 
const router = (0, express_1.Router)();
// ✅ POST /api/v1/bookings/confirm
router.post('/confirm', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            yield (0, email_1.sendBookingConfirmationEmail)(email, name, {
                title,
                price,
                date,
                guests,
                phone,
            });
        }
        catch (error) {
            console.error("❌ Email failed:", error.message);
        }
        // ✅ SUCCESS RESPONSE (yeh try ke andar hi hona chahiye)
        return res.json({
            success: true,
            message: 'Booking confirmed! (email optional)'
        });
    }
    catch (err) {
        console.error('Booking error:', err.message);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}));
exports.default = router;
