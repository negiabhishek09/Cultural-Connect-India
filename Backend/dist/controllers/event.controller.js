"use strict";
// event.controller.ts — COMPLETE FILE (replace existing)
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
exports.cancelRegistration = exports.getMyRegistrations = exports.registerForEvent = exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEventBySlug = exports.getEvents = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const Event_model_1 = require("../models/Event.model");
const email_1 = require("../utils/email");
const response_utils_1 = require("../utils/response.utils");
// ─────────────────────────────────────────────────────────────
// GET /api/v1/events
// ─────────────────────────────────────────────────────────────
const getEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stateId, featured, page = '1', limit = '10' } = req.query;
        const filter = { isActive: true };
        if (stateId)
            filter.stateId = new mongoose_1.default.Types.ObjectId(stateId);
        if (featured)
            filter.isFeatured = featured === 'true';
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;
        const events = yield Event_model_1.Event.find(filter)
            .populate('stateId', 'name')
            .populate('categoryId', 'name')
            .sort({ startDate: 1 })
            .skip(skip)
            .limit(limitNum)
            .select('-registrations'); // registrations list public mein expose mat karo
        return res.status(200).json({
            success: true,
            results: events.length,
            page: pageNum,
            data: events,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});
exports.getEvents = getEvents;
// ─────────────────────────────────────────────────────────────
// GET /api/v1/events/:slug
// ─────────────────────────────────────────────────────────────
const getEventBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield Event_model_1.Event.findOneAndUpdate({ slug: req.params.slug, isActive: true }, { $inc: { viewCount: 1 } }, { new: true })
        .populate('stateId', 'name')
        .populate('categoryId', 'name')
        .select('-registrations');
    if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
    }
    return res.status(200).json({ success: true, data: event });
});
exports.getEventBySlug = getEventBySlug;
// ─────────────────────────────────────────────────────────────
// POST /api/v1/events
// ─────────────────────────────────────────────────────────────
const createEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, image, tag, startDate, endDate, location, venue, stateId, categoryId, isFeatured } = req.body;
    const slug = (0, slugify_1.default)(name, { lower: true }) + '-' + Date.now();
    const event = yield Event_model_1.Event.create({ name, slug, description, image, tag, startDate, endDate, location, venue, stateId, categoryId, isFeatured });
    return res.status(201).json({ success: true, data: event });
});
exports.createEvent = createEvent;
// ─────────────────────────────────────────────────────────────
// PUT /api/v1/events/:id
// ─────────────────────────────────────────────────────────────
const updateEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.name) {
        req.body.slug = (0, slugify_1.default)(req.body.name, { lower: true }) + '-' + Date.now();
    }
    const event = yield Event_model_1.Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event)
        return res.status(404).json({ success: false, message: 'Event not found' });
    return res.status(200).json({ success: true, data: event });
});
exports.updateEvent = updateEvent;
// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/events/:id  (soft delete)
// ─────────────────────────────────────────────────────────────
const deleteEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield Event_model_1.Event.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!event)
        return res.status(404).json({ success: false, message: 'Event not found' });
    return res.status(200).json({ success: true, message: 'Event deactivated' });
});
exports.deleteEvent = deleteEvent;
// ─────────────────────────────────────────────────────────────
// POST /api/v1/events/register
// Public registration — email bhi jaati hai
// ─────────────────────────────────────────────────────────────
const registerForEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { eventId, name, email } = req.body;
        if (!eventId || !name || !email) {
            return res.status(400).json({ success: false, message: 'eventId, name aur email required hain' });
        }
        const event = yield Event_model_1.Event.findById(eventId);
        if (!event || !event.isActive) {
            return res.status(404).json({ success: false, message: 'Event not found or inactive' });
        }
        // Duplicate check — same email dobara register na kare
        const alreadyRegistered = event.registrations.some((r) => r.email === email);
        if (alreadyRegistered) {
            return res.status(409).json({ success: false, message: 'You are already registered for this event.' });
        }
        // Logged-in user hai toh userId bhi store karo
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)
            ? new mongoose_1.default.Types.ObjectId(req.user.id)
            : undefined;
        yield Event_model_1.Event.findByIdAndUpdate(eventId, {
            $push: {
                registrations: Object.assign(Object.assign({}, (userId && { user: userId })), { name,
                    email, registeredAt: new Date() }),
            },
        });
        yield (0, email_1.sendEventRegistrationEmail)(email, name, {
            name: event.name,
            startDate: event.startDate,
            endDate: event.endDate,
            location: event.location,
            venue: event.venue,
            tag: event.tag,
        });
        return res.status(200).json({ success: true, message: 'Successfully registered! Email bhi bhej di gayi hai.' });
    }
    catch (error) {
        console.error('❌ Error in registerForEvent:', error);
        return res.status(500).json({ success: false, message: 'Something went wrong' });
    }
});
exports.registerForEvent = registerForEvent;
// ─────────────────────────────────────────────────────────────
// GET /api/v1/events/my-registrations
// Logged-in user ke saare registered events
// ─────────────────────────────────────────────────────────────
const getMyRegistrations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const events = yield Event_model_1.Event.find({
            'registrations.user': new mongoose_1.default.Types.ObjectId(userId),
            isActive: true,
        })
            .sort({ startDate: 1 })
            .populate('stateId', 'name')
            .populate('categoryId', 'name')
            .select('name slug image tag startDate endDate location venue registrations');
        const now = new Date();
        // Sirf us user ki registration entry attach karo (baaki users ki nahi)
        const result = events.map((e) => {
            const myReg = e.registrations.find((r) => { var _a; return ((_a = r.user) === null || _a === void 0 ? void 0 : _a.toString()) === userId; });
            return Object.assign(Object.assign({}, e.toJSON()), { registrations: undefined, myRegistration: myReg, isUpcoming: e.startDate >= now });
        });
        (0, response_utils_1.sendSuccess)(res, { registrations: result, total: result.length });
    }
    catch (error) {
        next(error);
    }
});
exports.getMyRegistrations = getMyRegistrations;
// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/events/:id/cancel-registration
// Logged-in user apni registration cancel kare
// ─────────────────────────────────────────────────────────────
const cancelRegistration = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const eventId = req.params.id;
        const event = yield Event_model_1.Event.findById(eventId);
        if (!event) {
            (0, response_utils_1.sendError)(res, 'Event not found.', 404);
            return;
        }
        if (event.startDate < new Date()) {
            (0, response_utils_1.sendError)(res, 'Cannot cancel registration for a past event.', 400);
            return;
        }
        const wasRegistered = event.registrations.some((r) => { var _a; return ((_a = r.user) === null || _a === void 0 ? void 0 : _a.toString()) === userId; });
        if (!wasRegistered) {
            (0, response_utils_1.sendError)(res, 'You are not registered for this event.', 400);
            return;
        }
        yield Event_model_1.Event.findByIdAndUpdate(eventId, {
            $pull: { registrations: { user: new mongoose_1.default.Types.ObjectId(userId) } },
        });
        (0, response_utils_1.sendSuccess)(res, null, 'Registration cancelled successfully.');
    }
    catch (error) {
        next(error);
    }
});
exports.cancelRegistration = cancelRegistration;
