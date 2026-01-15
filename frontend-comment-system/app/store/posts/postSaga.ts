import {call, put, takeLatest, type CallEffect, type PutEffect} from "redux-saga/effects";
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
} from "./postSlice";
import type {Post, Comment} from "./types";

function* fetchPostsSaga(
    action: ReturnType<typeof fetchPostsRequest>
): Generator<CallEffect | PutEffect, void, any> {
    try {
        const page = action.payload?.page || 1;
        const response = yield call(api.get, `/post/get/all?page=${page}&limit=10`);
        const data = response.data;

        yield put(
            fetchPostsSuccess({
                posts: data.data as Post[],
                page: data.pagination.page,
                totalPages: data.pagination.totalPages,
            })
        );
    } catch (err: any) {
        yield put(fetchPostsFailure(err.message || "Failed to fetch posts"));
    }
}

// Fetch a single post
function* fetchPostSaga(
    action: ReturnType<typeof fetchPostRequest>
): Generator<CallEffect | PutEffect, void, any> {
    try {
        const response = yield call(api.get, `/post/get/${action.payload.id}`);
        yield put(fetchPostSuccess(response.data as Post));
    } catch (err: any) {
        yield put(fetchPostFailure(err.message || "Failed to fetch post"));
    }
}

// Fetch comments for a post
function* fetchCommentsSaga(
    action: ReturnType<typeof fetchCommentsRequest>
): Generator<CallEffect | PutEffect, void, any> {
    try {
        const page = action.payload?.page || 1;
        const response = yield call(
            api.get,
            `/comment/get/post/${action.payload.postId}?page=${page}&limit=10`
        );
        const data = response.data;

        yield put(
            fetchCommentsSuccess({
                comments: data.data as Comment[],
                page: data.pagination.page,
                totalPages: data.pagination.totalPages,
            })
        );
    } catch (err: any) {
        yield put(fetchCommentsFailure(err.message || "Failed to fetch comments"));
    }
}

export default function* postSaga(): Generator {
    yield takeLatest(fetchPostsRequest.type, fetchPostsSaga);
    yield takeLatest(fetchPostRequest.type, fetchPostSaga);
    yield takeLatest(fetchCommentsRequest.type, fetchCommentsSaga);
}
