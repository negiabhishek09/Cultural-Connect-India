import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Notification route working' });
});

export default router;