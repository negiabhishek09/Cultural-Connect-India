import { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import mongoose from 'mongoose';
import { Product } from '../models/Product.model';
import { User } from '../models/User.model';
import { Business } from '../models/Business.model';
import { sendSuccess, sendPaginated, parsePagination } from '../utils/response.utils';
import { AppError } from '../middleware/error.middleware';

// GET /api/v1/products
export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const { categoryId, businessId, featured, search, minPrice, maxPrice, sortBy } = req.query;

    const filter: Record<string, unknown> = { isActive: true };
    if (categoryId) filter.categoryId = categoryId;
    if (businessId) filter.businessId = businessId;
    if (featured === 'true') filter.isFeatured = true;
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {
        ...(minPrice ? { $gte: Number(minPrice) } : {}),
        ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
      };
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      popular: { soldCount: -1 },
    };
    const sort = sortMap[sortBy as string] ?? { isFeatured: -1, soldCount: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('businessId', 'name slug isVerified location')
        .populate('categoryId', 'name slug'),
      Product.countDocuments(filter),
    ]);

    let wishlistIds: string[] = [];
    if (req.user) {
      const user = await User.findById(req.user.id).select('wishlist');
      if (user && Array.isArray((user as any).wishlist)) {
        wishlistIds = (user as any).wishlist;
      }
    }

    const enriched = products.map((p) => ({
      ...p.toJSON(),
      isWishlisted: Array.isArray(wishlistIds)
        ? wishlistIds.includes(p._id.toString())
        : false,
    }));

    sendPaginated(res, enriched, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/products/:slug
export const getProductBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('businessId', 'name slug isVerified location rating reviewCount')
      .populate('categoryId');

    if (!product) throw new AppError('Product not found.', 404);
    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/products
export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user!.role !== 'ADMIN') {
      const business = await Business.findById(req.body.businessId);
      if (!business || business.ownerId.toString() !== req.user!.id) {
        throw new AppError('You can only add products to your own business.', 403);
      }
    }

    // ✅ Price sanitize
    if (req.body.price !== undefined) {
      req.body.price = parseFloat(String(req.body.price).replace(/[^\d.]/g, ''));
    }

    const slug = `${slugify(req.body.name, { lower: true, strict: true })}-${Date.now()}`;
    const product = await Product.create({ ...req.body, slug });
    sendSuccess(res, product, 'Product created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/products/:id
export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate('businessId', 'ownerId');
    if (!product) throw new AppError('Product not found.', 404);

    const business = product.businessId as unknown as { ownerId: mongoose.Types.ObjectId };
    if (req.user!.role !== 'ADMIN' && business.ownerId.toString() !== req.user!.id) {
      throw new AppError('You can only update your own products.', 403);
    }

    delete req.body.slug;
    delete req.body.businessId;

    // ✅ Price sanitize
    if (req.body.price !== undefined) {
      req.body.price = parseFloat(String(req.body.price).replace(/[^\d.]/g, ''));
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after', // ✅ deprecation fix
      // runValidators: true,
    });

    sendSuccess(res, updated, 'Product updated.');
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/products/:id/wishlist
export const toggleWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) throw new AppError('Product not found.', 404);

    const user = await User.findById(req.user!.id).select('+wishlist');
    const wishlist: string[] = (user as Record<string, unknown>)?.wishlist as string[] ?? [];

    const isWishlisted = wishlist.includes(productId);

    if (isWishlisted) {
      await User.findByIdAndUpdate(req.user!.id, { $pull: { wishlist: productId } });
      sendSuccess(res, { wishlisted: false }, 'Removed from wishlist.');
    } else {
      await User.findByIdAndUpdate(req.user!.id, { $addToSet: { wishlist: productId } });
      sendSuccess(res, { wishlisted: true }, 'Added to wishlist.');
    }
  } catch (error) {
    next(error);
  }
};