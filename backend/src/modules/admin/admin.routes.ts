import { Router } from "express";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const router = Router();

// Keep admin namespace protected, even with no active routes.
router.use(authRequired);
router.use(requireRole("ADMIN"));

export default router;
