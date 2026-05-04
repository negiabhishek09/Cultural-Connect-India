"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = exports.sendError = exports.sendPaginated = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => res.status(statusCode).json({ status: 'success', message, data });
exports.sendSuccess = sendSuccess;
const sendPaginated = (res, data, meta, message = 'Success') => res.status(200).json({ status: 'success', message, data, meta });
exports.sendPaginated = sendPaginated;
const sendError = (res, message, statusCode = 400, errors) => res.status(statusCode).json(Object.assign({ status: 'error', message }, (errors && { errors })));
exports.sendError = sendError;
const parsePagination = (query) => {
    const page = Math.max(1, parseInt(String(query.page || '1')));
    const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '10'))));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
exports.parsePagination = parsePagination;
