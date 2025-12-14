import express from 'express';
import { getUser, updateUser, changePassword } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:id', authMiddleware, getUser);
router.put('/:id', authMiddleware, updateUser);
router.post('/:id/change-password', authMiddleware, changePassword);

export default router;
