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
exports.getStats = exports.blockUser = exports.deleteUser = exports.getAllUsers = void 0;
const User_model_1 = require("../models/User.model");
const Product_model_1 = require("../models/Product.model");
const Event_model_1 = require("../models/Event.model");
const ExploreItem_model_1 = require("../models/ExploreItem.model");
const Post_model_1 = require("../models/Post.model");
// ✅ Get all users
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User_model_1.User.find();
    res.json({ users });
});
exports.getAllUsers = getAllUsers;
// ✅ Delete user
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield User_model_1.User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
});
exports.deleteUser = deleteUser;
// ✅ Block user
const blockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield User_model_1.User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "User blocked" });
});
exports.blockUser = blockUser;
// ✅ Get stats
const getStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [totalUsers, totalProducts, totalEvents, totalExploreItems, totalPosts, recentUsers,] = yield Promise.all([
            User_model_1.User.countDocuments(),
            Product_model_1.Product.countDocuments({ isActive: true }),
            Event_model_1.Event.countDocuments({ isActive: true }),
            ExploreItem_model_1.ExploreItem.countDocuments({ isActive: true }),
            Post_model_1.Post.countDocuments(),
            User_model_1.User.find().sort({ createdAt: -1 }).limit(5).select('name email avatar createdAt role'),
        ]);
        res.json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalEvents,
                totalExploreItems,
                totalPosts,
                recentUsers,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.getStats = getStats;
