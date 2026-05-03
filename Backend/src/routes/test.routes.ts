import { Router } from "express";
import { sendWelcomeEmail } from "../utils/email";

const router = Router();

router.get("/test-email", async (req, res) => {
  console.log("🔥 TEST ROUTE HIT");

  await sendWelcomeEmail("ajaynegi910@gmail.com", "Abhishek");

  res.send("DONE");
});

export default router;