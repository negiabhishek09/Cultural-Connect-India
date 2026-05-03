import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order.model';
import { Cart } from '../models/Cart.model';
import { Product } from '../models/Product.model';
import { User } from '../models/User.model';
import { sendSuccess, sendPaginated, sendError, parsePagination } from '../utils/response.utils';
import { AppError } from '../middleware/error.middleware';
// ✅ FIX: ../services/email.service → ../utils/email (sahi path)
import { sendOrderConfirmationEmail } from '../utils/email';

// POST /api/v1/orders
export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { address, phone, notes } = req.body;
    const userId = req.user!.id;

    const cart = await Cart.findOne({ userId }).populate<{
      items: { productId: InstanceType<typeof Product>; quantity: number }[];
    }>('items.productId');

    if (!cart || cart.items.length === 0) {
      sendError(res, 'Your cart is empty.', 400);
      return;
    }

    // Stock validate karo
    for (const item of cart.items) {
      const product = item.productId as InstanceType<typeof Product>;
      if (!product || !product.isActive) {
        sendError(res, `Product "${product?.name}" is no longer available.`, 400);
        return;
      }
      if (product.stock < item.quantity) {
        sendError(res, `Insufficient stock for "${product.name}". Available: ${product.stock}`, 400);
        return;
      }
    }

    const orderItems = cart.items.map((item) => {
      const product = item.productId as InstanceType<typeof Product>;
      return {
        productId: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      };
    });

    const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
      address,
      phone,
      notes,
    });

    // Stock decrement karo
    await Promise.all(
      cart.items.map((item) => {
        const product = item.productId as InstanceType<typeof Product>;
        return Product.findByIdAndUpdate(product._id, {
          $inc: { stock: -item.quantity, soldCount: item.quantity },
        });
      })
    );

    // Cart clear karo
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

    sendSuccess(res, order, 'Order placed successfully.', 201);

    // ✅ Email bhejo — sahi import path se
    const user = await User.findById(userId).select('name email');
    if (user) sendOrderConfirmationEmail(user.name, user.email, order._id.toString(), totalAmount);

  } catch (error) {
    next(error);
  }
};

// GET /api/v1/orders
export const getMyOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);

    const [orders, total] = await Promise.all([
      Order.find({ userId: req.user!.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ userId: req.user!.id }),
    ]);

    sendPaginated(res, orders, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/orders/:id
export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (!order) throw new AppError('Order not found.', 404);

    if (order.userId._id.toString() !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('Access denied.', 403);
    }

    sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/orders/:id/status — admin only
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!order) throw new AppError('Order not found.', 404);
    sendSuccess(res, order, `Order status updated to ${order.status}.`);
  } catch (error) {
    next(error);
  }
};