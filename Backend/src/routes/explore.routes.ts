// import { Router, Request, Response } from 'express';
// import { ExploreItem } from '../models/ExploreItem.model';
// import { protect, restrictTo } from '../middleware/auth.middleware';

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


import { Router, Request, Response } from 'express';
import { ExploreItem } from '../models/ExploreItem.model';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// ✅ GET all explore items — stateId filter support
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, stateId } = req.query;
    const filter: any = { isActive: true };
    if (category) filter.category = category;
    if (stateId) filter.stateId = stateId;
    const items = await ExploreItem.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await ExploreItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, restrictTo('ADMIN'), async (req: Request, res: Response) => {
  try {
    const item = await ExploreItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id', protect, restrictTo('ADMIN'), async (req: Request, res: Response) => {
  try {
    const item = await ExploreItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, restrictTo('ADMIN'), async (req: Request, res: Response) => {
  try {
    await ExploreItem.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Item deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;