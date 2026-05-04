// event.controller.ts — COMPLETE FILE (replace existing)

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import slugify from 'slugify';
import { Event } from '../models/Event.model';
import { sendEventRegistrationEmail } from '../utils/email';
import { sendSuccess, sendError } from '../utils/response.utils';

// ─────────────────────────────────────────────────────────────
// GET /api/v1/events
// ─────────────────────────────────────────────────────────────
export const getEvents = async (req: Request, res: Response) => {
  try {
    const { stateId, featured, page = '1', limit = '10' } = req.query;

    const filter: any = { isActive: true };

    if (stateId) filter.stateId = new mongoose.Types.ObjectId(stateId as string);
    if (featured) filter.isFeatured = featured === 'true';

    const pageNum  = Number(page);
    const limitNum = Number(limit);
    const skip     = (pageNum - 1) * limitNum;

    const events = await Event.find(filter)
      .populate('stateId',    'name')
      .populate('categoryId', 'name')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limitNum)
      .select('-registrations'); // registrations list public mein expose mat karo

    return res.status(200).json({
      success: true,
      results: events.length,
      page: pageNum,
      data: events,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/v1/events/:slug
// ─────────────────────────────────────────────────────────────
export const getEventBySlug = async (req: Request, res: Response) => {
  const event = await Event.findOneAndUpdate(
    { slug: req.params.slug, isActive: true },
    { $inc: { viewCount: 1 } },
    { new: true }
  )
    .populate('stateId',    'name')
    .populate('categoryId', 'name')
    .select('-registrations');

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  return res.status(200).json({ success: true, data: event });
};

// ─────────────────────────────────────────────────────────────
// POST /api/v1/events
// ─────────────────────────────────────────────────────────────
export const createEvent = async (req: Request, res: Response) => {
  const { name, description, image, tag, startDate, endDate, location, venue, stateId, categoryId, isFeatured } = req.body;

  const slug  = slugify(name, { lower: true }) + '-' + Date.now();
  const event = await Event.create({ name, slug, description, image, tag, startDate, endDate, location, venue, stateId, categoryId, isFeatured });

  return res.status(201).json({ success: true, data: event });
};

// ─────────────────────────────────────────────────────────────
// PUT /api/v1/events/:id
// ─────────────────────────────────────────────────────────────
export const updateEvent = async (req: Request, res: Response) => {
  if (req.body.name) {
    req.body.slug = slugify(req.body.name, { lower: true }) + '-' + Date.now();
  }

  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  return res.status(200).json({ success: true, data: event });
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/events/:id  (soft delete)
// ─────────────────────────────────────────────────────────────
export const deleteEvent = async (req: Request, res: Response) => {
  const event = await Event.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  return res.status(200).json({ success: true, message: 'Event deactivated' });
};

// ─────────────────────────────────────────────────────────────
// POST /api/v1/events/register
// Public registration — email bhi jaati hai
// ─────────────────────────────────────────────────────────────
export const registerForEvent = async (req: Request, res: Response) => {
  try {
    const { eventId, name, email } = req.body;

    if (!eventId || !name || !email) {
      return res.status(400).json({ success: false, message: 'eventId, name aur email required hain' });
    }

    const event = await Event.findById(eventId);

    if (!event || !event.isActive) {
      return res.status(404).json({ success: false, message: 'Event not found or inactive' });
    }

    // Duplicate check — same email dobara register na kare
    const alreadyRegistered = event.registrations.some((r) => r.email === email);
    if (alreadyRegistered) {
      return res.status(409).json({ success: false, message: 'You are already registered for this event.' });
    }

    // Logged-in user hai toh userId bhi store karo
    const userId = (req as any).user?.id
      ? new mongoose.Types.ObjectId((req as any).user.id)
      : undefined;

    await Event.findByIdAndUpdate(eventId, {
      $push: {
        registrations: {
          ...(userId && { user: userId }),
          name,
          email,
          registeredAt: new Date(),
        },
      },
    });

    await sendEventRegistrationEmail(email, name, {
      name:      event.name,
      startDate: event.startDate,
      endDate:   event.endDate,
      location:  event.location,
      venue:     event.venue,
      tag:       event.tag,
    });

    return res.status(200).json({ success: true, message: 'Successfully registered! Email bhi bhej di gayi hai.' });
  } catch (error) {
    console.error('❌ Error in registerForEvent:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/v1/events/my-registrations
// Logged-in user ke saare registered events
// ─────────────────────────────────────────────────────────────
export const getMyRegistrations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    const events = await Event.find({
      'registrations.user': new mongoose.Types.ObjectId(userId),
      isActive: true,
    })
      .sort({ startDate: 1 })
      .populate('stateId',    'name')
      .populate('categoryId', 'name')
      .select('name slug image tag startDate endDate location venue registrations');

    const now = new Date();

    // Sirf us user ki registration entry attach karo (baaki users ki nahi)
    const result = events.map((e) => {
      const myReg = e.registrations.find((r) => r.user?.toString() === userId);
      return {
        ...e.toJSON(),
        registrations: undefined,          // full list expose mat karo
        myRegistration: myReg,             // sirf apni entry
        isUpcoming: e.startDate >= now,
      };
    });

    sendSuccess(res, { registrations: result, total: result.length });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/events/:id/cancel-registration
// Logged-in user apni registration cancel kare
// ─────────────────────────────────────────────────────────────
export const cancelRegistration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId  = req.user!.id;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);

    if (!event) {
      sendError(res, 'Event not found.', 404);
      return;
    }

    if (event.startDate < new Date()) {
      sendError(res, 'Cannot cancel registration for a past event.', 400);
      return;
    }

    const wasRegistered = event.registrations.some(
      (r) => r.user?.toString() === userId
    );

    if (!wasRegistered) {
      sendError(res, 'You are not registered for this event.', 400);
      return;
    }

    await Event.findByIdAndUpdate(eventId, {
      $pull: { registrations: { user: new mongoose.Types.ObjectId(userId) } },
    });

    sendSuccess(res, null, 'Registration cancelled successfully.');
  } catch (error) {
    next(error);
  }
};