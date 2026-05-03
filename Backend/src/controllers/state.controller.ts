import { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import { State } from '../models/State.model';
import { Event } from '../models/Event.model';
import { Business } from '../models/Business.model';
import { sendSuccess, sendPaginated, parsePagination } from '../utils/response.utils';
import { AppError } from '../middleware/error.middleware';

// GET /api/v1/states
export const getStates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const { featured, region, search } = req.query;

    const filter: Record<string, unknown> = { isActive: true };
    if (featured === 'true') filter.isFeatured = true;
    if (region)              filter.region = region;
    if (search)              filter.name = { $regex: search, $options: 'i' };

    const [states, total] = await Promise.all([
      State.find(filter)
        .sort({ isFeatured: -1, name: 1 })
        .skip(skip)
        .limit(limit),
      State.countDocuments(filter),
    ]);

    sendPaginated(res, states, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/states/:slug
export const getStateBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const state = await State.findOne({ slug: req.params.slug, isActive: true });
    if (!state) throw new AppError('State not found.', 404);

    // Fetch related events and businesses in parallel
    const [events, businesses] = await Promise.all([
      Event.find({ stateId: state._id, isActive: true })
        .sort({ startDate: 1 })
        .limit(5)
        .populate('categoryId', 'name'),
      Business.find({ stateId: state._id, isActive: true })
        .sort({ rating: -1 })
        .limit(6)
        .select('-reviews'),
    ]);

    sendSuccess(res, { ...state.toJSON(), events, businesses });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/states — admin only
export const createState = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slug = slugify(req.body.name, { lower: true, strict: true });
    const state = await State.create({ ...req.body, slug });
    sendSuccess(res, state, 'State created.', 201);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/states/:id — admin only
export const updateState = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const state = await State.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!state) throw new AppError('State not found.', 404);
    sendSuccess(res, state, 'State updated.');
  } catch (error) {
    next(error);
  }
};