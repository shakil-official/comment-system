import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";

// -----------------------------
// Types
// -----------------------------
interface User {
    _id: string;
    name: string;
    email: string;
}

interface Comment {
    _id: string;
    message: string;
    user?: User;
    parent?: string | null;
    favorites?: string[];
    createdAt?: string;
    updatedAt?: string;
    children?: Comment[];
}

interface Post {
    _id: string;
    title: string;
    description: string;
    user?: User;
    status?: "active" | "inactive";
    date?: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// -----------------------------
// Component
// -----------------------------
export default function PostDetail() {
    const {id} = useParams<{ id: string }>();

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });
    const [loadingPost, setLoadingPost] = useState(true);
    const [loadingComments, setLoadingComments] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState<string | null>(null);

    // -----------------------------
    // Fetch post + comments
    // -----------------------------
    const fetchPost = async (page = 1) => {
        try {
            setLoadingPost(true);
            setLoadingComments(true);

            const res = await axios.get(
                `http://localhost:5000/api/post/${id}?page=${page}&limit=100`
            );
            setPost(res.data.post);
            setComments(res.data.comments);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingPost(false);
            setLoadingComments(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [id]);

    // -----------------------------
    // Pagination
    // -----------------------------
    const loadCommentsPage = (page: number) => {
        fetchPost(page);
    };

    // -----------------------------
    // Post a new comment / reply
    // -----------------------------
    const handleSubmitComment = async () => {
        if (!newComment.trim() || !post) return;

        const token = localStorage.getItem("token"); // JWT

        try {
            await axios.post(
                "http://localhost:5000/api/post/comment/create",
                {
                    message: newComment,
                    postId: post._id,
                    parentId: replyTo,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setNewComment("");
            setReplyTo(null);
            loadCommentsPage(pagination.page);
        } catch (err) {
            console.error(err);
        }
    };

    // -----------------------------
    // Toggle favorite
    // -----------------------------
    const toggleFavorite = async (commentId: string) => {
        try {
            await axios.patch(
                `http://localhost:5000/api/post/favorite/${commentId}`,
                {},
                {
                    headers: {Authorization: `Bearer ${localStorage.getItem("token")}`},
                }
            );
            loadCommentsPage(pagination.page);
        } catch (err) {
            console.error(err);
        }
    };

    // -----------------------------
    // Render nested comments recursively
    // -----------------------------
    const renderComments = (commentsList: Comment[], level = 0) => {
        return commentsList.map((comment) => (
            <div
                key={comment._id}
                className="mt-4"
                style={{marginLeft: `${level * 20}px`}} // dynamic indentation
            >
                <div className="flex flex-col p-3 border border-gray-200 rounded-lg bg-white">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div
                            className="shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                            {comment.user?.name?.charAt(0).toUpperCase() || "A"}
                        </div>

                        {/* User info */}
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">
                              {comment.user?.name || "Anonymous"}
                            </span>
                            <span className="text-xs text-gray-500">{comment.user?.email}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold">{comment.user?.name || "Anonymous"}</p>
                            <p className="text-gray-700 mt-1 break-all">{comment.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {comment.createdAt && new Date(comment.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <button
                            className={`text-sm ${
                                comment.favorites?.length ? "text-red-500" : "text-gray-400"
                            }`}
                            onClick={() => toggleFavorite(comment._id)}
                        >
                            ♥ {comment.favorites?.length || 0}
                        </button>
                    </div>

                    {/* Reply button */}
                    <button
                        className="text-xs text-blue-600 mt-2"
                        onClick={() => setReplyTo(comment._id)}
                    >
                        Reply
                    </button>
                </div>

                {/* Recursively render children */}
                {comment.children && comment.children.length > 0 &&
                    renderComments(comment.children, level + 1)}
            </div>
        ));
    };

    // -----------------------------
    // Loading skeleton
    // -----------------------------
    if (loadingPost) {
        return (
            <div className="container mx-auto p-4 max-w-2xl animate-pulse">
                <div className="h-6 bg-gray-300 w-3/4 mb-3 rounded"></div>
                <div className="h-4 bg-gray-300 w-full mb-2 rounded"></div>
                <div className="h-4 bg-gray-300 w-full mb-2 rounded"></div>
            </div>
        );
    }

    if (!post) return <p className="text-center mt-10 text-red-500">Post not found</p>;

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            {/* Post */}
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            <p className="text-gray-700 leading-relaxed mb-6">{post.description}</p>

            {/* New comment input */}
            <div className="flex flex-col mb-4">
        <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyTo ? "Reply..." : "Add a comment..."}
            className="border border-gray-300 rounded p-2 mb-2 resize-none"
        />
                <div className="flex gap-2">
                    {replyTo && (
                        <button
                            onClick={() => setReplyTo(null)}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Cancel Reply
                        </button>
                    )}
                    <button
                        onClick={handleSubmitComment}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Post
                    </button>
                </div>
            </div>

            {/* Comments */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-3">Comments</h2>

                {loadingComments ? (
                    <div className="animate-pulse space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                ) : comments.length ? (
                    renderComments(comments)
                ) : (
                    <p className="text-gray-500">No comments yet.</p>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-4 mt-4">
                        <button
                            disabled={pagination.page === 1 || loadingComments}
                            onClick={() => loadCommentsPage(pagination.page - 1)}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                            ← Previous
                        </button>
                        <span className="px-2 py-2 text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
                        <button
                            disabled={pagination.page === pagination.totalPages || loadingComments}
                            onClick={() => loadCommentsPage(pagination.page + 1)}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
