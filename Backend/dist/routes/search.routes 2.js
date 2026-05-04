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
const express_1 = __importDefault(require("express"));
const search_controller_1 = require("../controllers/search.controller");
const Place_model_1 = __importDefault(require("../models/Place.model"));
const router = express_1.default.Router();
/**
 * 🔍 SEARCH ROUTE
 * GET /api/v1/search?q=keyword
 */
router.get("/search", (req, res, next) => {
    const { q } = req.query;
    if (!q || typeof q !== "string" || q.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Search query (q) is required",
        });
    }
    next();
}, search_controller_1.searchController);
/**
 * 🧪 TEMP ROUTE (DATA INSERT)
 * GET /api/v1/add
 */
router.get("/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield Place_model_1.default.create({
            name: "Taj Mahal",
            description: "Famous monument in India",
        });
        res.status(201).json({
            success: true,
            data,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Insert failed",
        });
    }
}));
exports.default = router;
