import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {Post, Comment} from "./types";

interface PostsState {
    posts: Post[];
    postsLoading: boolean;
    postsError: string | null;
    postsPage: number;
    postsTotalPages: number;

    singlePost?: Post;
    comments: Comment[];
    commentsLoading: boolean;
    commentsError: string | null;
    commentsPage: number;
    commentsTotalPages: number;
}

const initialState: PostsState = {
    posts: [],
    postsLoading: false,
    postsError: null,
    postsPage: 1,
    postsTotalPages: 1,

    singlePost: undefined,
    comments: [],
    commentsLoading: false,
    commentsError: null,
    commentsPage: 1,
    commentsTotalPages: 1,
};

const postSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {
        // fetch all posts
        fetchPostsRequest(state, action: PayloadAction<{ page?: number }>) {
            state.postsLoading = true;
            state.postsError = null;
        },
        fetchPostsSuccess(state, action: PayloadAction<{ posts: Post[]; page: number; totalPages: number }>) {
            state.postsLoading = false;
            state.posts = action.payload.posts;
            state.postsPage = action.payload.page;
            state.postsTotalPages = action.payload.totalPages;
        },
        fetchPostsFailure(state, action: PayloadAction<string>) {
            state.postsLoading = false;
            state.postsError = action.payload;
        },

        // fetch single post
        fetchPostRequest(state, action: PayloadAction<{ id: string }>) {
            state.singlePost = undefined;
            state.comments = [];
            state.commentsPage = 1;
            state.commentsTotalPages = 1;
            state.commentsError = null;
        },
        fetchPostSuccess(state, action: PayloadAction<Post>) {
            state.singlePost = action.payload;
        },
        fetchPostFailure(state, action: PayloadAction<string>) {
            state.singlePost = undefined;
            state.commentsError = action.payload;
        },

        // fetch comments for a post
        fetchCommentsRequest(state, action: PayloadAction<{ postId: string; page?: number }>) {
            state.commentsLoading = true;
            state.commentsError = null;
        },
        fetchCommentsSuccess(state, action: PayloadAction<{ comments: Comment[]; page: number; totalPages: number }>) {
            state.commentsLoading = false;
            state.comments = action.payload.comments;
            state.commentsPage = action.payload.page;
            state.commentsTotalPages = action.payload.totalPages;
        },
        fetchCommentsFailure(state, action: PayloadAction<string>) {
            state.commentsLoading = false;
            state.commentsError = action.payload;
        },
    },
});

export const {
    fetchPostsRequest,
    fetchPostsSuccess,
    fetchPostsFailure,
    fetchPostRequest,
    fetchPostSuccess,
    fetchPostFailure,
    fetchCommentsRequest,
    fetchCommentsSuccess,
    fetchCommentsFailure,
} = postSlice.actions;

export default postSlice.reducer;
