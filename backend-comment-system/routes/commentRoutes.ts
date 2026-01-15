import {Router} from "express";
import {
    createComment, createPost,
    getAllPosts,
    getPost,
    toggleFavorite,
} from "../controllers/commentController";
import {protect} from "../middleware/authMiddleware";

const router = Router();

router.post('/create', protect, createPost)
router.get("/get/all", getAllPosts);
router.post("/comment/create", protect, createComment);
router.get("/:postId", getPost);
router.patch("/:commentId/favorite", protect, toggleFavorite);

export default router;
