// import { Request, Response } from "express";
// import slugify from "slugify";
// import { Event } from "../models/event.model";
// import { sendWelcomeEmail, sendEventRegistrationEmail } from "../utils/Email"; 
// import { State } from "../models/State.model";       
// import { Category } from "../models/Category.model";

// // ✅ GET all events
// export const getEvents = async (req: Request, res: Response) => {
//   const events = await Event.find({ isActive: true })
//     .populate("stateId", "name")
//     .populate("categoryId", "name")
//     .sort({ startDate: 1 });

//   return res.status(200).json({
//     success: true,
//     results: events.length,
//     data: events,
//   });
// };

// // ✅ GET event by slug
// export const getEventBySlug = async (req: Request, res: Response) => {
//   const event = await Event.findOneAndUpdate(
//     { slug: req.params.slug, isActive: true },
//     { $inc: { viewCount: 1 } },
//     { new: true }
//   )
//     .populate("stateId", "name")
//     .populate("categoryId", "name");

//   if (!event) {
//     return res.status(404).json({ success: false, message: "Event not found" });
//   }

//   return res.status(200).json({ success: true, data: event });
// };

// // ✅ CREATE event
// export const createEvent = async (req: Request, res: Response) => {
//   const { name, description, image, tag, startDate, endDate, location, venue, stateId, categoryId, isFeatured } = req.body;

//   const slug = slugify(name, { lower: true });

//   const event = await Event.create({
//     name, slug, description, image, tag,
//     startDate, endDate, location, venue,
//     stateId, categoryId, isFeatured,
//   });

//   return res.status(201).json({ success: true, data: event });
// };

// // ✅ UPDATE event
// export const updateEvent = async (req: Request, res: Response) => {
//   if (req.body.name) {
//     req.body.slug = slugify(req.body.name, { lower: true });
//   }

//   const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!event) {
//     return res.status(404).json({ success: false, message: "Event not found" });
//   }

//   return res.status(200).json({ success: true, data: event });
// };

// // ✅ DELETE event
// export const deleteEvent = async (req: Request, res: Response) => {
//   const event = await Event.findByIdAndUpdate(
//     req.params.id,
//     { isActive: false },
//     { new: true }
//   );

//   if (!event) {
//     return res.status(404).json({ success: false, message: "Event not found" });
//   }

//   return res.status(200).json({ success: true, message: "Event deactivated" });
// };

// // ✅ REGISTER for event — ab event details ke saath email jayegi
// export const registerForEvent = async (req: Request, res: Response) => {
//   try {
//     const { eventId, name, email } = req.body;

//     if (!eventId || !name || !email) {
//       return res.status(400).json({ success: false, message: "eventId, name aur email required hain" });
//     }

//     // Event dhundo
//     const event = await Event.findById(eventId);

//     if (!event || !event.isActive) {
//       return res.status(404).json({ success: false, message: "Event not found or inactive" });
//     }

//     // ✅ Event details ke saath email bhejo
//     await sendEventRegistrationEmail(email, name, {
//       name: event.name,
//       startDate: event.startDate,
//       endDate: event.endDate,
//       location: event.location,
//       venue: event.venue,
//       tag: event.tag,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Successfully registered! Email bhi bhej di gayi hai.",
//     });

//   } catch (error) {
//     console.error("❌ Error in registerForEvent:", error);
//     return res.status(500).json({ success: false, message: "Something went wrong" });
//   }
// };




import { Request, Response } from "express";
import mongoose from "mongoose";
import slugify from "slugify";
import { Event } from "../models/event.model";
import { sendEventRegistrationEmail } from "../utils/email";

// ✅ GET all events — stateId + featured + pagination
export const getEvents = async (req: Request, res: Response) => {
  try {
    const { stateId, featured, page = "1", limit = "10" } = req.query;

    const filter: any = { isActive: true };

    // ✅ state filter (FIXED)
    if (stateId) {
      filter.stateId = new mongoose.Types.ObjectId(stateId as string);
    }

    // ✅ featured filter (optional)
    if (featured) {
      filter.isFeatured = featured === "true";
    }

    // ✅ pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const events = await Event.find(filter)
      .populate("stateId", "name")
      .populate("categoryId", "name")
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      results: events.length,
      page: pageNum,
      data: events,
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ✅ GET event by slug
export const getEventBySlug = async (req: Request, res: Response) => {
  const event = await Event.findOneAndUpdate(
    { slug: req.params.slug, isActive: true },
    { $inc: { viewCount: 1 } },
    { new: true }
  )
    .populate("stateId", "name")
    .populate("categoryId", "name");

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: event,
  });
};

// ✅ CREATE event
export const createEvent = async (req: Request, res: Response) => {
  const {
    name,
    description,
    image,
    tag,
    startDate,
    endDate,
    location,
    venue,
    stateId,
    categoryId,
    isFeatured,
  } = req.body;

  const slug = slugify(name, { lower: true }) + "-" + Date.now();

  const event = await Event.create({
    name,
    slug,
    description,
    image,
    tag,
    startDate,
    endDate,
    location,
    venue,
    stateId,
    categoryId,
    isFeatured,
  });

  return res.status(201).json({
    success: true,
    data: event,
  });
};

// ✅ UPDATE event
export const updateEvent = async (req: Request, res: Response) => {
  if (req.body.name) {
    req.body.slug =
      slugify(req.body.name, { lower: true }) + "-" + Date.now();
  }

  const event = await Event.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: event,
  });
};

// ✅ DELETE event (soft delete)
export const deleteEvent = async (req: Request, res: Response) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Event deactivated",
  });
};

// ✅ REGISTER for event
export const registerForEvent = async (req: Request, res: Response) => {
  try {
    const { eventId, name, email } = req.body;

    if (!eventId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "eventId, name aur email required hain",
      });
    }

    const event = await Event.findById(eventId);

    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: "Event not found or inactive",
      });
    }

    await sendEventRegistrationEmail(email, name, {
      name: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      venue: event.venue,
      tag: event.tag,
    });

    return res.status(200).json({
      success: true,
      message: "Successfully registered! Email bhi bhej di gayi hai.",
    });

  } catch (error) {
    console.error("❌ Error in registerForEvent:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};