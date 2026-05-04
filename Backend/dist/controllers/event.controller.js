"use strict";
// import { Request, Response } from "express";
// import slugify from "slugify";
// import { Event } from "../models/event.model";
// import { sendWelcomeEmail, sendEventRegistrationEmail } from "../utils/Email"; 
// import { State } from "../models/State.model";       
// import { Category } from "../models/Category.model";
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
exports.registerForEvent = exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEventBySlug = exports.getEvents = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const event_model_1 = require("../models/event.model");
const email_1 = require("../utils/email");
// ✅ GET all events — stateId + featured + pagination
const getEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stateId, featured, page = "1", limit = "10" } = req.query;
        const filter = { isActive: true };
        // ✅ state filter (FIXED)
        if (stateId) {
            filter.stateId = new mongoose_1.default.Types.ObjectId(stateId);
        }
        // ✅ featured filter (optional)
        if (featured) {
            filter.isFeatured = featured === "true";
        }
        // ✅ pagination
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;
        const events = yield event_model_1.Event.find(filter)
            .populate("stateId", "name")
            .populate("categoryId", "name")
            .sort({ startDate: 1 })
            .skip(skip)
            .limit(limitNum);
        return res.status(200).json({
            success: true,
            results: events.length,
            page: pageNum,
            data: events,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});
exports.getEvents = getEvents;
// ✅ GET event by slug
const getEventBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield event_model_1.Event.findOneAndUpdate({ slug: req.params.slug, isActive: true }, { $inc: { viewCount: 1 } }, { new: true })
        .populate("stateId", "name")
        .populate("categoryId", "name");
    if (!event) {
        return res.status(404).json({
            success: false,
            message: "Event not found",
        });
    }
    return res.status(200).json({
        success: true,
        data: event,
    });
});
exports.getEventBySlug = getEventBySlug;
// ✅ CREATE event
const createEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, image, tag, startDate, endDate, location, venue, stateId, categoryId, isFeatured, } = req.body;
    const slug = (0, slugify_1.default)(name, { lower: true }) + "-" + Date.now();
    const event = yield event_model_1.Event.create({
        name,
        slug,
        description,
        image,
        tag,
        startDate,
        endDate,
        location,
        venue,
        stateId,
        categoryId,
        isFeatured,
    });
    return res.status(201).json({
        success: true,
        data: event,
    });
});
exports.createEvent = createEvent;
// ✅ UPDATE event
const updateEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.name) {
        req.body.slug =
            (0, slugify_1.default)(req.body.name, { lower: true }) + "-" + Date.now();
    }
    const event = yield event_model_1.Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) {
        return res.status(404).json({
            success: false,
            message: "Event not found",
        });
    }
    return res.status(200).json({
        success: true,
        data: event,
    });
});
exports.updateEvent = updateEvent;
// ✅ DELETE event (soft delete)
const deleteEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield event_model_1.Event.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!event) {
        return res.status(404).json({
            success: false,
            message: "Event not found",
        });
    }
    return res.status(200).json({
        success: true,
        message: "Event deactivated",
    });
});
exports.deleteEvent = deleteEvent;
// ✅ REGISTER for event
const registerForEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId, name, email } = req.body;
        if (!eventId || !name || !email) {
            return res.status(400).json({
                success: false,
                message: "eventId, name aur email required hain",
            });
        }
        const event = yield event_model_1.Event.findById(eventId);
        if (!event || !event.isActive) {
            return res.status(404).json({
                success: false,
                message: "Event not found or inactive",
            });
        }
        yield (0, email_1.sendEventRegistrationEmail)(email, name, {
            name: event.name,
            startDate: event.startDate,
            endDate: event.endDate,
            location: event.location,
            venue: event.venue,
            tag: event.tag,
        });
        return res.status(200).json({
            success: true,
            message: "Successfully registered! Email bhi bhej di gayi hai.",
        });
    }
    catch (error) {
        console.error("❌ Error in registerForEvent:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
});
exports.registerForEvent = registerForEvent;
