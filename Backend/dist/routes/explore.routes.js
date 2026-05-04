"use strict";
// import { Router, Request, Response } from 'express';
// import { ExploreItem } from '../models/ExploreItem.model';
// import { protect, restrictTo } from '../middleware/auth.middleware';
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
// const router = Router();
// // ✅ GET all explore items
// router.get('/', async (req: Request, res: Response) => {
//   try {
//     const { category } = req.query;
//     const filter: any = { isActive: true };
//     if (category) filter.category = category;
//     const items = await ExploreItem.find(filter).sort({ createdAt: -1 });
//     res.json({ success: true, data: items });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });
// // ✅ GET single explore item
// router.get('/:id', async (req: Request, res: Response) => {
//   try {
//     const item = await ExploreItem.findById(req.params.id);
//     if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
//     res.json({ success: true, data: item });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });
// // ✅ CREATE explore item (admin only)
// router.post('/', protect, restrictTo('ADMIN'), async (req: Request, res: Response) => {
//   try {
//     const item = await ExploreItem.create(req.body);
//     res.status(201).json({ success: true, data: item });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });
// // ✅ UPDATE explore item (admin only)
// router.patch('/:id', protect, restrictTo('ADMIN'), async (req: Request, res: Response) => {
//   try {
//     const item = await ExploreItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
//     res.json({ success: true, data: item });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });
// // ✅ DELETE explore item (admin only)
// router.delete('/:id', protect, restrictTo('ADMIN'), async (req: Request, res: Response) => {
//   try {
//     await ExploreItem.findByIdAndUpdate(req.params.id, { isActive: false });
//     res.json({ success: true, message: 'Item deleted' });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });
// export default router;
const express_1 = require("express");
const ExploreItem_model_1 = require("../models/ExploreItem.model");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// ✅ GET all explore items — stateId filter support
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, stateId } = req.query;
        const filter = { isActive: true };
        if (category)
            filter.category = category;
        if (stateId)
            filter.stateId = stateId;
        const items = yield ExploreItem_model_1.ExploreItem.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: items });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield ExploreItem_model_1.ExploreItem.findById(req.params.id);
        if (!item)
            return res.status(404).json({ success: false, message: 'Item not found' });
        res.json({ success: true, data: item });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}));
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield ExploreItem_model_1.ExploreItem.create(req.body);
        res.status(201).json({ success: true, data: item });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}));
router.patch('/:id', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield ExploreItem_model_1.ExploreItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item)
            return res.status(404).json({ success: false, message: 'Item not found' });
        res.json({ success: true, data: item });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}));
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ExploreItem_model_1.ExploreItem.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true, message: 'Item deleted' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}));
exports.default = router;
