import {Request, Response} from "express";
import Post from "../models/Post";
import Comment, {IComment} from "../models/Comment";
import {buildCommentTree} from "../utils/buildCommentTree";

/**
 * Create a comment (post comment or reply)
 */
export const createComment = async (req: Request, res: Response) => {
    const {message, postId, parentId} = req.body;
    const userId = req.user!.id; // assumes auth middleware

    const comment = await Comment.create({
        message,
        post: postId,
        user: userId,
        parent: parentId || null,
    });

    res.status(201).json(comment);
};

/**
 * Get comments for a post (flat list)
 * Nesting will be handled in service or frontend
 */
export const getPost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const page = parseInt((req.query.page as string) || "1");
        const limit = parseInt((req.query.limit as string) || "100");

        // 1️⃣ Fetch the post
        const post = await Post.findById(postId)
            .populate("user", "name email")
            .lean();

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // 2️⃣ Count total comments for pagination
        const totalComments = await Comment.countDocuments({ post: postId });

        // 3️⃣ Fetch comments for this page
        const comments = await Comment.find({ post: postId })
            .populate("user", "name email")
            .sort({ date: -1 }) // latest first
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // 4️⃣ Build nested comment tree
        const nestedComments = buildCommentTree(comments as IComment[]);

        // 5️⃣ Send response
        res.json({
            post,
            comments: nestedComments,
            pagination: {
                total: totalComments,
                page,
                limit,
                totalPages: Math.ceil(totalComments / limit),
            },
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: err.message || "Server Error" });
    }
};

/**
 * Toggle favorite (like) on a comment
 */
export const toggleFavorite = async (req: Request, res: Response) => {
    const {commentId} = req.params;
    const userId = req.user!.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        return res.status(404).json({message: "Comment not found"});
    }

    const index = comment.favorites.findIndex(
        (id) => id.toString() === userId
    );

    if (index === -1) {
        comment.favorites.push(userId);
    } else {
        comment.favorites.splice(index, 1);
    }

    await comment.save();
    res.json({favoritesCount: comment.favorites.length});
};


export const createPost = async (req: Request, res: Response) => {
    try {
        const {title, description, status} = req.body;

        if (!title || !description) {
            return res.status(400).json({message: "Title and description are required"});
        }

        const userId = req.user!.id; // req.user is added by auth middleware

        const post = await Post.create({
            title,
            description,
            status: status || "active",
            user: userId,
        });

        res.status(201).json(post);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
};

export const getAllPosts = async (req: Request, res: Response) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
        Post.find()
            .populate("user", "name email")
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            .lean(),

        Post.countDocuments(),
    ]);

    res.json({
        data: posts,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
};

