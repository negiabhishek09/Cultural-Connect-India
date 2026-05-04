"use strict";
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
exports.Post = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CommentSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now }, // ✅ broken link fix
}, { _id: true });
const PostSchema = new mongoose_1.Schema({
    caption: { type: String, required: true, trim: true, maxlength: 2200 },
    image: { type: String, required: true },
    location: { type: String, maxlength: 200 },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category' },
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    savedBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    comments: { type: [CommentSchema], default: [] },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
    toJSON: {
        transform: (_d, r) => {
            delete r.__v;
            return r;
        },
    },
});
PostSchema.index({ userId: 1 });
PostSchema.index({ categoryId: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ isActive: 1, createdAt: -1 });
exports.Post = mongoose_1.default.model('Post', PostSchema);
