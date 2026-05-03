import { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import { Business } from '../models/Business.model';
import { sendSuccess, sendPaginated, parsePagination } from '../utils/response.utils';
import { AppError } from '../middleware/error.middleware';

// GET /api/v1/businesses
export const getBusinesses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const { stateId, categoryId, verified, featured, search } = req.query;

    const filter: Record<string, unknown> = { isActive: true };
    if (stateId)           filter.stateId = stateId;
    if (categoryId)        filter.categoryId = categoryId;
    if (verified === 'true')  filter.isVerified = true;
    if (featured === 'true')  filter.isFeatured = true;
    if (search)            filter.name = { $regex: search, $options: 'i' };

    const [businesses, total] = await Promise.all([
      Business.find(filter)
        .sort({ isFeatured: -1, rating: -1 })
        .skip(skip)
        .limit(limit)
        .populate('stateId', 'name slug')
        .populate('categoryId', 'name slug')
        .populate('ownerId', 'name avatar')
        .select('-reviews'),           // don't ship full reviews array on list
      Business.countDocuments(filter),
    ]);

    sendPaginated(res, businesses, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/businesses/:slug
export const getBusinessBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const business = await Business.findOne({ slug: req.params.slug, isActive: true })
      .populate('stateId')
      .populate('categoryId')
      .populate('ownerId', 'name avatar')
      .populate('reviews.userId', 'name avatar');

    if (!business) throw new AppError('Business not found.', 404);
    sendSuccess(res, business);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/businesses
export const createBusiness = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slug = slugify(req.body.name, { lower: true, strict: true }) + `-${Date.now()}`;

    const business = await Business.create({
      ...req.body,
      slug,
      ownerId: req.user!.id,
    });

    sendSuccess(res, business, 'Business registered successfully.', 201);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/businesses/:id
export const updateBusiness = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) throw new AppError('Business not found.', 404);

    if (req.user!.role !== 'ADMIN' && business.ownerId.toString() !== req.user!.id) {
      throw new AppError('You can only update your own business.', 403);
    }

    // Prevent overwriting protected fields
    delete req.body.ownerId;
    delete req.body.slug;
    delete req.body.reviews;

    const updated = await Business.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    sendSuccess(res, updated, 'Business updated.');
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/businesses/:id/reviews
export const addReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user!.id;

    const business = await Business.findById(req.params.id);
    if (!business) throw new AppError('Business not found.', 404);

    // Upsert review (one review per user)
    const existingIndex = business.reviews.findIndex(
      (r) => r.userId.toString() === userId
    );

    if (existingIndex > -1) {
      business.reviews[existingIndex].rating  = rating;
      business.reviews[existingIndex].comment = comment;
    } else {
      business.reviews.push({ userId, rating, comment, createdAt: new Date() } as never);
    }

    // Recalculate average rating
    const total = business.reviews.reduce((sum, r) => sum + r.rating, 0);
    business.rating      = Math.round((total / business.reviews.length) * 10) / 10;
    business.reviewCount = business.reviews.length;

    await business.save();
    await business.populate('reviews.userId', 'name avatar');

    sendSuccess(res, { rating: business.rating, reviewCount: business.reviewCount }, 'Review submitted.');
  } catch (error) {
    next(error);
  }
};