import { Request, Response, NextFunction } from 'express';
import { Cart } from '../models/Cart.model';
import { Product } from '../models/Product.model';
import { sendSuccess, sendError } from '../utils/response.utils';
import { AppError } from '../middleware/error.middleware';

// GET /api/v1/cart
export const getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await Cart.findOne({ userId: req.user!.id }).populate(
      'items.productId',
      'name slug image price originalPrice stock isActive'
    );

    if (!cart || cart.items.length === 0) {
      sendSuccess(res, { items: [], subtotal: 0, itemCount: 0 });
      return;
    }

    let subtotal = 0;
    let itemCount = 0;

    const items = cart.items.map((item) => {
      const product = item.productId as unknown as {
        price: number; name: string; image: string; isActive: boolean;
      };
      subtotal += product.price * item.quantity;
      itemCount += item.quantity;
      return { product, quantity: item.quantity };
    });

    sendSuccess(res, { items, subtotal, itemCount });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/cart
export const addToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) throw new AppError('Product not found.', 404);

    if (product.stock < quantity) {
      sendError(res, `Only ${product.stock} units available.`, 400);
      return;
    }

    let cart = await Cart.findOne({ userId: req.user!.id });

    if (!cart) {
      // First item — create cart
      cart = await Cart.create({
        userId: req.user!.id,
        items: [{ productId, quantity }],
      });
    } else {
      const existingIndex = cart.items.findIndex(
        (i) => i.productId.toString() === productId
      );

      if (existingIndex > -1) {
        const newQty = cart.items[existingIndex].quantity + quantity;
        if (newQty > product.stock) {
          sendError(res, `Cannot add more. Only ${product.stock} units available.`, 400);
          return;
        }
        cart.items[existingIndex].quantity = newQty;
      } else {
        cart.items.push({ productId, quantity });
      }

      await cart.save();
    }

    await cart.populate('items.productId', 'name slug image price originalPrice stock');
    sendSuccess(res, cart, 'Item added to cart.', 201);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/cart/:productId
export const updateCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (quantity < 1) {
      sendError(res, 'Quantity must be at least 1. Use DELETE to remove.', 400);
      return;
    }

    const product = await Product.findById(productId);
    if (!product) throw new AppError('Product not found.', 404);
    if (quantity > product.stock) {
      sendError(res, `Only ${product.stock} units available.`, 400);
      return;
    }

    const cart = await Cart.findOneAndUpdate(
      { userId: req.user!.id, 'items.productId': productId },
      { $set: { 'items.$.quantity': quantity } },
      { new: true }
    ).populate('items.productId', 'name slug image price originalPrice stock');

    if (!cart) throw new AppError('Item not found in cart.', 404);
    sendSuccess(res, cart, 'Cart updated.');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/cart/:productId
export const removeFromCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user!.id },
      { $pull: { items: { productId: req.params.productId } } },
      { new: true }
    ).populate('items.productId', 'name slug image price originalPrice stock');

    if (!cart) throw new AppError('Cart not found.', 404);
    sendSuccess(res, cart, 'Item removed from cart.');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/cart
export const clearCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Cart.findOneAndUpdate({ userId: req.user!.id }, { $set: { items: [] } });
    sendSuccess(res, null, 'Cart cleared.');
  } catch (error) {
    next(error);
  }
};