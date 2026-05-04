"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = exports.AppError = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../config/logger");
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const notFound = (req, res) => {
    res.status(404).json({ status: 'error', message: `Route ${req.originalUrl} not found` });
};
exports.notFound = notFound;
const errorHandler = (err, _req, res, _next) => {
    var _a, _b;
    logger_1.logger.error(err.message, { stack: err.stack });
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ status: 'error', message: err.message });
        return;
    }
    if (err.code === '11000') {
        // ✅ Fix: unknown pehle, phir Record<string, unknown>
        const field = (_b = Object.keys((_a = err.keyValue) !== null && _a !== void 0 ? _a : {})[0]) !== null && _b !== void 0 ? _b : 'field';
        res.status(409).json({ status: 'error', message: `A record with this ${field} already exists.` });
        return;
    }
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        const messages = Object.values(err.errors).map((e) => e.message);
        res.status(422).json({ status: 'error', message: 'Validation failed.', errors: messages });
        return;
    }
    if (err instanceof mongoose_1.default.Error.CastError) {
        res.status(400).json({ status: 'error', message: `Invalid ${err.path}: ${err.value}` });
        return;
    }
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({ status: 'error', message: 'Invalid token.' });
        return;
    }
    if (err.name === 'TokenExpiredError') {
        res.status(401).json({ status: 'error', message: 'Token expired. Please login again.' });
        return;
    }
    res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production' ? 'An internal server error occurred.' : err.message,
    });
};
exports.errorHandler = errorHandler;
