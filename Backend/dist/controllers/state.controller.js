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
exports.updateState = exports.createState = exports.getStateBySlug = exports.getStates = void 0;
const slugify_1 = __importDefault(require("slugify"));
const State_model_1 = require("../models/State.model");
const Event_model_1 = require("../models/Event.model");
const Business_model_1 = require("../models/Business.model");
const response_utils_1 = require("../utils/response.utils");
const error_middleware_1 = require("../middleware/error.middleware");
// GET /api/v1/states
const getStates = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, response_utils_1.parsePagination)(req.query);
        const { featured, region, search } = req.query;
        const filter = { isActive: true };
        if (featured === 'true')
            filter.isFeatured = true;
        if (region)
            filter.region = region;
        if (search)
            filter.name = { $regex: search, $options: 'i' };
        const [states, total] = yield Promise.all([
            State_model_1.State.find(filter)
                .sort({ isFeatured: -1, name: 1 })
                .skip(skip)
                .limit(limit),
            State_model_1.State.countDocuments(filter),
        ]);
        (0, response_utils_1.sendPaginated)(res, states, { page, limit, total, totalPages: Math.ceil(total / limit) });
    }
    catch (error) {
        next(error);
    }
});
exports.getStates = getStates;
// GET /api/v1/states/:slug
const getStateBySlug = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const state = yield State_model_1.State.findOne({ slug: req.params.slug, isActive: true });
        if (!state)
            throw new error_middleware_1.AppError('State not found.', 404);
        // Fetch related events and businesses in parallel
        const [events, businesses] = yield Promise.all([
            Event_model_1.Event.find({ stateId: state._id, isActive: true })
                .sort({ startDate: 1 })
                .limit(5)
                .populate('categoryId', 'name'),
            Business_model_1.Business.find({ stateId: state._id, isActive: true })
                .sort({ rating: -1 })
                .limit(6)
                .select('-reviews'),
        ]);
        (0, response_utils_1.sendSuccess)(res, Object.assign(Object.assign({}, state.toJSON()), { events, businesses }));
    }
    catch (error) {
        next(error);
    }
});
exports.getStateBySlug = getStateBySlug;
// POST /api/v1/states — admin only
const createState = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = (0, slugify_1.default)(req.body.name, { lower: true, strict: true });
        const state = yield State_model_1.State.create(Object.assign(Object.assign({}, req.body), { slug }));
        (0, response_utils_1.sendSuccess)(res, state, 'State created.', 201);
    }
    catch (error) {
        next(error);
    }
});
exports.createState = createState;
// PATCH /api/v1/states/:id — admin only
const updateState = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const state = yield State_model_1.State.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!state)
            throw new error_middleware_1.AppError('State not found.', 404);
        (0, response_utils_1.sendSuccess)(res, state, 'State updated.');
    }
    catch (error) {
        next(error);
    }
});
exports.updateState = updateState;
