import express from "express";
import authRoute from "./authRoute.js";
import userRoute from "./userRoute.js";
import postRoute from "./postRoute.js";
import adminRoute from "./adminRoute.js";
import categoryRoute from "./categoryRoute.js";
import { redirectShare } from '../controllers/shareController.js';

const router = express.Router();

router.use("/auth", authRoute); // localhost:8800/api/auth/...
router.use("/users", userRoute);
router.use("/posts", postRoute);
// Short redirectable share link: /r/:id -> logs share then redirects to frontend
router.get('/r/:id', redirectShare);
router.use("/admin", adminRoute);
router.use("/categories", categoryRoute);

export default router;

