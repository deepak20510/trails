import express from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
} from "./posts.controller.js";

import { validate } from "../../middleware/validate.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  createPostSchema,
  updatePostSchema,
  getPostsSchema,
} from "./posts.schema.js";

const router = express.Router();

// Public routes
router.get("/", validate(getPostsSchema, "query"), getPosts);
router.get("/:postId", getPostById);

// Protected routes - trainers and institutions only
router.post(
  "/",
  authMiddleware(["TRAINER", "INSTITUTION"]),
  validate(createPostSchema, "body"),
  createPost,
);
router.put(
  "/:postId",
  authMiddleware,
  validate(updatePostSchema, "body"),
  updatePost,
);
router.delete("/:postId", authMiddleware, deletePost);
router.post("/:postId/like", authMiddleware, likePost);
router.delete("/:postId/like", authMiddleware, unlikePost);

export default router;
