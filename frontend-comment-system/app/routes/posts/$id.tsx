import React, {type JSX, useEffect, useState, useRef, useCallback} from "react";
import {useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {io, Socket} from "socket.io-client";
import type {RootState} from "~/store"; // Adjust to your store path

import {
    fetchPostAndCommentsStart,
    socketAddComment,
    socketUpdateComment,
    socketDeleteComment,
    socketUpdateReaction,
    updateReactionOptimistic,
    createCommentStart,
    editCommentStart,
    deleteCommentStart,
    toggleReactionStart,
} from "~/store/posts/postSlice";

import type {Comment, Post} from "~/store/posts/postSlice";
import Header from "~/components/Header";

const normalizeComment = (c: any): Comment => ({
    ...c,
    favorites: Array.isArray(c.favorites) ? c.favorites : [],
    dislikes: Array.isArray(c.dislikes) ? c.dislikes : [],
    favoritesCount: Number(c.favoritesCount) || 0,
    dislikesCount: Number(c.dislikesCount) || 0,
    children: Array.isArray(c.children) ? c.children.map(normalizeComment) : [],
});

const addCommentToTree = (comments: Comment[], newComment: Comment): Comment[] => {
    if (!newComment.parent) return [newComment, ...comments];
    return comments.map((c) => {
        if (c._id === newComment.parent) {
            return {...c, children: [...(c.children || []), newComment]};
        }
        if (c.children?.length) {
            return {...c, children: addCommentToTree(c.children, newComment)};
        }
        return c;
    });
};

const updateCommentInTree = (
    comments: Comment[],
    commentId: string,
    updater: (c: Comment) => Comment
): Comment[] =>
    comments.map((c) => {
        if (c._id === commentId) return updater(c);
        if (c.children?.length) {
            return {...c, children: updateCommentInTree(c.children, commentId, updater)};
        }
        return c;
    });

const removeCommentFromTree = (comments: Comment[], commentId: string): Comment[] =>
    comments
        .filter((c) => c._id !== commentId)
        .map((c) => ({
            ...c,
            children: c.children ? removeCommentFromTree(c.children, commentId) : [],
        }));

export default function PostDetail() {
    const {id} = useParams<{ id: string }>();
    const dispatch = useDispatch();

    const {singlePost: post, comments, commentsLoading, currentUserId} = useSelector(
        (state: RootState) => state.posts
    );

    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [pendingReactions, setPendingReactions] = useState<Set<string>>(new Set());

    const commentsContainerRef = useRef<HTMLDivElement>(null);
    const scrollPositions = useRef<Map<string, number>>(new Map());

    const [socket, setSocket] = useState<Socket | null>(null);

    // Fetch data + setup socket
    useEffect(() => {
        if (!id) return;

        dispatch(fetchPostAndCommentsStart({postId: id}));

        const newSocket = io(import.meta.env.VITE_API_SOCKET);
        setSocket(newSocket);
        newSocket.emit("joinPost", id);

        newSocket.on("comment:new", (comment: any) => {
            const normalized = normalizeComment(comment);
            dispatch(socketAddComment(normalized));
        });

        newSocket.on("comment:update", (updated: any) => {
            const normalized = normalizeComment(updated);
            dispatch(socketUpdateComment(normalized));
        });

        newSocket.on("comment:delete", ({commentId}: { commentId: string }) => {
            dispatch(socketDeleteComment(commentId));
        });

        newSocket.on("comment:reaction", ({
                                              commentId,
                                              favoritesCount,
                                              dislikesCount,
                                              favorites = [],
                                              dislikes = []
                                          }) => {
            dispatch(socketUpdateReaction({commentId, favorites, dislikes, favoritesCount, dislikesCount}));
        });

        return () => {
            newSocket.disconnect();
        };
    }, [id, dispatch]);

    // Save scroll position before update
    const saveScrollPosition = useCallback(() => {
        if (commentsContainerRef.current) {
            scrollPositions.current.set("comments", commentsContainerRef.current.scrollTop);
        }
    }, []);

    // Restore scroll after update
    const restoreScrollPosition = useCallback(() => {
        if (commentsContainerRef.current) {
            const saved = scrollPositions.current.get("comments");
            if (saved !== undefined) {
                commentsContainerRef.current.scrollTop = saved;
            }
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(restoreScrollPosition, 50);
        return () => clearTimeout(timer);
    }, [comments, restoreScrollPosition]);

    // Submit comment
    const handleSubmit = () => {
        if (!newComment.trim() || !post) return;
        const token = localStorage.getItem("token");
        if (!token) return alert("Please login first");

        saveScrollPosition();

        dispatch(createCommentStart({
            message: newComment,
            postId: post._id,
            parentId: replyTo,
        }));
        setNewComment("");
        setReplyTo(null);
    };

    // Edit
    const handleEdit = (commentId: string) => {
        if (!editText.trim()) return;
        const token = localStorage.getItem("token");
        if (!token) return alert("Please login");

        saveScrollPosition();

        dispatch(editCommentStart({
            commentId,
            message: editText,
        }));
        setEditingId(null);
        setEditText("");
    };

    // Delete
    const handleDelete = (commentId: string) => {
        if (!window.confirm("Delete this comment?")) return;
        const token = localStorage.getItem("token");
        if (!token) return alert("Please login");

        saveScrollPosition();

        dispatch(deleteCommentStart({commentId}));
    };

    const toggleReaction = useCallback(
        (commentId: string, type: "like" | "dislike") => {
            if (!currentUserId) {
                alert("Please login to react");
                return;
            }
            if (pendingReactions.has(commentId)) return;

            setPendingReactions((prev) => new Set([...prev, commentId]));

            saveScrollPosition();

            // Optimistic update
            dispatch(updateReactionOptimistic({commentId, type, userId: currentUserId}));

            // Dispatch to saga for API call
            dispatch(toggleReactionStart({commentId, type}));

            dispatch(fetchPostAndCommentsStart({postId: id}));


        },
        [currentUserId, pendingReactions, saveScrollPosition, dispatch]
    );

    // Cleanup pending after reaction (assuming socket updates it)
    useEffect(() => {
        const timer = setTimeout(() => {
            setPendingReactions(new Set());
        }, 1000); // Arbitrary delay to clear pending
        return () => clearTimeout(timer);
    }, [comments]);

    const renderCommentsFn = (list: Comment[], level = 0): JSX.Element[] => {
        return list.map((comment) => {
            if (!comment?._id) return null as any;

            const isOwn = currentUserId === comment.user?._id;
            const isEditing = editingId === comment._id;
            const indent = level * 24;
            const isPending = pendingReactions.has(comment._id);


            const favorites = Array.isArray(comment.favorites) ? comment.favorites : [];
            const dislikes = Array.isArray(comment.dislikes) ? comment.dislikes : [];

            const hasLiked = favorites.includes(currentUserId ?? "");
            const hasDisliked = dislikes.includes(currentUserId ?? "");


            return (
                <div key={comment._id} style={{marginLeft: `${indent}px`}} className="mt-5">
                    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="font-semibold text-gray-900">
                                        {comment.user?.name || "Anonymous"}
                                    </span>
                                    {isOwn && (
                                        <span
                                            className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
                                            You
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-500">
                                        {comment.createdAt && new Date(comment.createdAt).toLocaleString()}
                                    </span>
                                </div>

                                {isEditing ? (
                                    <div className="mt-3">
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-400"
                                            rows={3}
                                        />
                                        <div className="mt-3 flex gap-3 justify-end">
                                            <button
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setEditText("");
                                                }}
                                                className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleEdit(comment._id)}
                                                className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
                                        {comment.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col items-end gap-3">
                                <div className="flex gap-5 text-sm font-medium">
                                    <button
                                        onClick={() => toggleReaction(comment._id, "like")}
                                        disabled={isPending}
                                        className={`flex items-center gap-1.5 transition-all ${
                                            hasLiked
                                                ? "text-red-600 font-bold scale-110"
                                                : "text-gray-600 hover:text-red-500"
                                        } ${isPending ? "opacity-50 cursor-wait" : ""}`}
                                    >
                                        ♥ {comment.favoritesCount}
                                    </button>

                                    <button
                                        onClick={() => toggleReaction(comment._id, "dislike")}
                                        disabled={isPending}
                                        className={`flex items-center gap-1.5 transition-all ${
                                            hasDisliked
                                                ? "text-blue-600 font-bold scale-110"
                                                : "text-gray-600 hover:text-blue-600"
                                        } ${isPending ? "opacity-50 cursor-wait" : ""}`}
                                    >
                                        👎 {comment.dislikesCount}
                                    </button>
                                </div>

                                <div className="flex gap-4 text-xs text-blue-600">
                                    <button onClick={() => setReplyTo(comment._id)} className="hover:underline">
                                        Reply
                                    </button>

                                    {isOwn && !isEditing && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setEditingId(comment._id);
                                                    setEditText(comment.message);
                                                }}
                                                className="hover:underline text-green-600"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(comment._id)}
                                                className="hover:underline text-red-600"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {replyTo === comment._id && (
                            <div className="mt-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="text-sm text-blue-600 mb-3 font-medium">
                                    Replying to {comment.user?.name || "Anonymous"}
                                </div>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write your reply..."
                                    className="w-full p-3 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-400"
                                    rows={3}
                                />
                                <div className="mt-3 flex gap-3 justify-end">
                                    <button
                                        onClick={() => {
                                            setReplyTo(null);
                                            setNewComment("");
                                        }}
                                        className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!newComment.trim()}
                                        className={`px-5 py-1.5 rounded text-white text-sm transition ${
                                            newComment.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-400 cursor-not-allowed"
                                        }`}
                                    >
                                        Post Reply
                                    </button>
                                </div>
                            </div>
                        )}

                        {comment.children?.length ? (
                            <div className="mt-5">{renderCommentsFn(comment.children, level + 1)}</div>
                        ) : null}
                    </div>
                </div>
            );


        }) as JSX.Element[];
    };


    if (commentsLoading) return <div className="text-center py-20 text-gray-600">Loading...</div>;
    if (!post) return <div className="text-center py-20 text-red-600">Post not found</div>;

    return (
        <>
            <Header/>
            <div className="max-w-4xl mx-auto px-4 py-10">
                {/* Post Header */}
                <div className="bg-white p-7 rounded-2xl shadow-sm mb-10 border border-gray-100">
                    <h1 className="text-3xl font-bold mb-4 text-gray-900">{post.title}</h1>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.description}</p>
                </div>

                {/* Top level comment input */}
                {!replyTo && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm mb-10 border border-gray-100">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700"
                        rows={4}
                    />
                        <div className="mt-4 flex gap-3 justify-end">
                            <button
                                onClick={handleSubmit}
                                disabled={!newComment.trim()}
                                className={`px-6 py-2 rounded-xl text-white transition ${
                                    newComment.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-400 cursor-not-allowed"
                                }`}
                            >
                                Post Comment
                            </button>
                        </div>
                    </div>
                )}

                {/* Comments section */}
                <div
                    ref={commentsContainerRef}
                    className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 max-h-[70vh] overflow-y-auto"
                >
                    <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                        Comments {comments.length > 0 && `(${comments.length})`}
                    </h2>

                    {comments.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">No comments yet • Be the first!</div>
                    ) : (
                        renderCommentsFn(comments)
                    )}
                </div>
            </div>
        </>

    );
}