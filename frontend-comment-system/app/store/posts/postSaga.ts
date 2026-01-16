import {all, call, put, takeLatest} from "redux-saga/effects";
import api from "../../api/axios";

import {
    fetchPostsRequest,
    fetchPostsSuccess,
    fetchPostsFailure,
    fetchPostRequest,
    fetchPostSuccess,
    fetchPostFailure,
    fetchCommentsRequest,
    fetchCommentsSuccess,
    fetchCommentsFailure,
    fetchPostAndCommentsStart,
    fetchPostAndCommentsSuccess,
    fetchPostAndCommentsFailure,
    createCommentStart,
    editCommentStart,
    deleteCommentStart,
    toggleReactionStart,
} from "./postSlice";

import type {Comment, Post} from "./postSlice";
import type {PayloadAction} from "@reduxjs/toolkit";


function normalizeComment(c: any): Comment {
    return {
        ...c,
        favorites: Array.isArray(c.favorites) ? c.favorites : [],
        dislikes: Array.isArray(c.dislikes) ? c.dislikes : [],
        favoritesCount: Number(c.favoritesCount) || 0,
        dislikesCount: Number(c.dislikesCount) || 0,
        children: Array.isArray(c.children) ? c.children.map(normalizeComment) : [],
    };
}


function* fetchPostsSaga(action: ReturnType<typeof fetchPostsRequest>) {
    try {
        const page = action.payload?.page ?? 1;
        const res = yield call(api.get, `/post/get/all?page=${page}&limit=10`);

        // Better type safety – assuming your API returns consistent shape
        const data = res.data as {
            posts: Post[];
            pagination: { page: number; totalPages: number };
        };

        yield put(
            fetchPostsSuccess({
                posts: data.posts,
                page: data.pagination.page,
                totalPages: data.pagination.totalPages,
            }),
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch posts";
        yield put(fetchPostsFailure(message));
    }
}


function* fetchPostSaga(action: ReturnType<typeof fetchPostRequest>) {
    try {
        const res = yield call(api.get, `/post/${action.payload.id}`);
        const post = res.data.post as Post | undefined;

        if (post) {
            yield put(fetchPostSuccess(post));
        } else {
            yield put(fetchPostFailure("Post not found in response"));
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch post";
        yield put(fetchPostFailure(message));
    }
}

// Fetch comments separately
function* fetchCommentsSaga(action: ReturnType<typeof fetchCommentsRequest>) {
    try {
        const page = action.payload?.page ?? 1;

        const res = yield call(
            api.get,
            `/comment/get/post/${action.payload.postId}?page=${page}&limit=10`,
        );

        const data = res.data as {
            data: Comment[];
            pagination: { page: number; totalPages: number };
        };

        yield put(
            fetchCommentsSuccess({
                comments: data.data,
                page: data.pagination.page,
                totalPages: data.pagination.totalPages,
            }),
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch comments";
        yield put(fetchCommentsFailure(message));
    }
}

// Combined fetch: post + comments + optional current user
function* fetchPostAndCommentsSaga(action: PayloadAction<{ postId: string }>) {
    try {
        const token = localStorage.getItem("token");

        // Only fetch the post
        const postCall = call(api.get, `/post/${action.payload.postId}`);

        let userCall = null;
        if (token) {
            userCall = call(api.get, "/auth/me");
        }

        const results: any[] = yield all([
            postCall,
            userCall ?? Promise.resolve({data: null}),
        ]);

        const postRes = results[0];
        const userRes = results[1];

        // Log for debugging (you can remove later)
        console.log(postRes, "post response");

        const post: Post = postRes.data.post;
        const comments: Comment = postRes.data.comments;

        const currentUserId: string | null = userRes?.data?._id ?? null;

        yield put(
            fetchPostAndCommentsSuccess({
                post,
                comments,           // ← now empty or from post if your API includes them
                currentUserId,
            }),
        );
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to fetch post and comments";
        yield put(fetchPostAndCommentsFailure(message));
    }
}

// Create comment – fire-and-forget (socket handles real update)
function* createCommentSaga(
    action: PayloadAction<{ message: string; postId: string; parentId?: string | null }>,
) {
    try {
        yield call(api.post, "/post/comment/create", action.payload);
        // Socket will dispatch socketAddComment
    } catch (err: unknown) {
        console.error("Failed to create comment:", err);
        // You could dispatch an error action here if you want UI feedback
    }
}

// Edit comment
function* editCommentSaga(
    action: PayloadAction<{ commentId: string; message: string }>,
) {
    try {
        yield call(api.patch, `/post/comment/${action.payload.commentId}`, {
            message: action.payload.message,
        });
        // Socket will dispatch socketUpdateComment
    } catch (err: unknown) {
        console.error("Failed to edit comment:", err);
    }
}

// Delete comment
function* deleteCommentSaga(action: PayloadAction<{ commentId: string }>) {
    try {
        yield call(api.delete, `/post/comment/${action.payload.commentId}`);
    } catch (err: unknown) {
        console.error("Failed to delete comment:", err);
    }
}

function* toggleReactionSaga(
    action: PayloadAction<{ commentId: string; type: "like" | "dislike" }>,
) {
    try {
        yield call(
            api.patch,
            `/post/comment/${action.payload.commentId}/${action.payload.type}`,
        );
    } catch (err: unknown) {
        console.error("Failed to toggle reaction:", err);
    }
}

export default function* postSaga() {
    yield takeLatest(fetchPostsRequest.type, fetchPostsSaga);
    yield takeLatest(fetchPostRequest.type, fetchPostSaga);
    yield takeLatest(fetchCommentsRequest.type, fetchCommentsSaga);
    yield takeLatest(fetchPostAndCommentsStart.type, fetchPostAndCommentsSaga);
    yield takeLatest(createCommentStart.type, createCommentSaga);
    yield takeLatest(editCommentStart.type, editCommentSaga);
    yield takeLatest(deleteCommentStart.type, deleteCommentSaga);
    yield takeLatest(toggleReactionStart.type, toggleReactionSaga);
}