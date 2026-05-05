"use strict";
// Event.model.ts — COMPLETE FILE (replace existing)
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const RegistrationSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    registeredAt: { type: Date, default: Date.now },
}, { _id: false });
const EventSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    tag: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true },
    venue: { type: String },
    stateId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'State', required: true },
    categoryId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    registrations: { type: [RegistrationSchema], default: [] }, // ✅ NEW
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            delete ret.__v;
            return ret;
        },
    },
});
EventSchema.index({ stateId: 1 });
EventSchema.index({ categoryId: 1 });
EventSchema.index({ isFeatured: -1, startDate: 1 });
EventSchema.index({ startDate: 1, isActive: 1 });
EventSchema.index({ 'registrations.user': 1 }); // ✅ NEW — my-registrations query fast
exports.Event = mongoose_1.default.models.Event || mongoose_1.default.model('Event', EventSchema);
