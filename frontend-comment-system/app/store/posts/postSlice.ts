import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import {
    addCommentToTree,
    removeCommentFromTree,
    updateCommentInTree,
} from "~/store/posts/utils/commentTreeHelpers";

export interface User {
    _id: string;
    name: string;
    email: string;
}

export interface Comment {
    _id: string;
    message: string;
    user?: User;
    post: string;
    parent?: string | null;
    favorites: string[];
    dislikes: string[];
    favoritesCount: number;
    dislikesCount: number;
    createdAt?: string;
    updatedAt?: string;
    children?: Comment[];
}

export interface Post {
    _id: string;
    title: string;
    description: string;
    user?: User;
    status?: "active" | "inactive";
    date?: string;
}

interface PostsState {
    posts: Post[];
    postsLoading: boolean;
    postsError: string | null;
    postsPage: number;
    postsTotalPages: number;
    singlePost: Post | null;
    comments: Comment[];
    commentsLoading: boolean;
    commentsError: string | null;
    currentUserId: string | null;
    commentsPage: number;
    commentsTotalPages: number;
}

const initialState: PostsState = {
    posts: [],
    postsLoading: false,
    postsError: null,
    postsPage: 1,
    postsTotalPages: 1,

    singlePost: null,
    comments: [],
    commentsLoading: false,
    commentsError: null,
    currentUserId: null,
    commentsPage: 1,
    commentsTotalPages: 1,
};

const postSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {

        fetchPostsRequest(state, action: PayloadAction<{ page?: number } | undefined>) {
            state.postsLoading = true;
            state.postsError = null;
        },
        fetchPostsSuccess(
            state,
            action: PayloadAction<{ posts: Post[]; page: number; totalPages: number }>,
        ) {
            console.log(action.payload.posts, "here ?");
            state.postsLoading = false;
            state.posts = action.payload.posts;
            state.postsPage = action.payload.page;
            state.postsTotalPages = action.payload.totalPages;
        },
        fetchPostsFailure(state, action: PayloadAction<string>) {
            state.postsLoading = false;
            state.postsError = action.payload;
        },


        fetchPostRequest(state, action: PayloadAction<{ id: string }>) {
            state.singlePost = null;
            state.commentsError = null;
        },
        fetchPostSuccess(state, action: PayloadAction<Post>) {
            state.singlePost = action.payload;
        },
        fetchPostFailure(state, action: PayloadAction<string>) {
            state.singlePost = null;
            state.commentsError = action.payload;
        },


        fetchCommentsRequest(state, action: PayloadAction<{ postId: string; page?: number }>) {
            state.commentsLoading = true;
            state.commentsError = null;
        },
        fetchCommentsSuccess(
            state,
            action: PayloadAction<{ comments: Comment[]; page: number; totalPages: number }>,
        ) {
            state.commentsLoading = false;
            state.comments = action.payload.comments;
            state.commentsPage = action.payload.page;
            state.commentsTotalPages = action.payload.totalPages;
        },
        fetchCommentsFailure(state, action: PayloadAction<string>) {
            state.commentsLoading = false;
            state.commentsError = action.payload;
        },

        // ── Combined single post + comments fetch (most common for detail page)
        fetchPostAndCommentsStart(state, action: PayloadAction<{ postId: string }>) {
            state.commentsLoading = true;
            state.commentsError = null;
            state.singlePost = null;
            state.comments = [];
        },
        fetchPostAndCommentsSuccess(
            state,
            action: PayloadAction<{ post: Post; comments: Comment[]; currentUserId?: string }>,
        ) {
            state.commentsLoading = false;
            state.singlePost = action.payload.post;
            state.comments = action.payload.comments;
            state.currentUserId = action.payload.currentUserId ?? null;
        },
        fetchPostAndCommentsFailure(state, action: PayloadAction<string>) {
            state.commentsLoading = false;
            state.commentsError = action.payload;
        },

        socketAddComment(state, action: PayloadAction<Comment>) {
            state.comments = addCommentToTree(state.comments, action.payload);
        },
        socketUpdateComment(state, action: PayloadAction<Comment>) {
            state.comments = updateCommentInTree(state.comments, action.payload._id, () => action.payload);
        },
        socketDeleteComment(state, action: PayloadAction<string>) {
            state.comments = removeCommentFromTree(state.comments, action.payload);
        },
        socketUpdateReaction(
            state,
            action: PayloadAction<{
                commentId: string;
                favorites: string[];
                dislikes: string[];
                favoritesCount: number;
                dislikesCount: number;
            }>,
        ) {
            state.comments = updateCommentInTree(state.comments, action.payload.commentId, (c) => ({
                ...c,
                favorites: action.payload.favorites,
                dislikes: action.payload.dislikes,
                favoritesCount: action.payload.favoritesCount,
                dislikesCount: action.payload.dislikesCount,
            }));
        },

        updateReactionOptimistic(
            state,
            action: PayloadAction<{ commentId: string; type: "like" | "dislike"; userId: string }>,
        ) {
            state.comments = updateCommentInTree(state.comments, action.payload.commentId, (c) => {
                let favorites = [...c.favorites];
                let dislikes = [...c.dislikes];
                let favoritesCount = c.favoritesCount;
                let dislikesCount = c.dislikesCount;

                const hasLiked = favorites.includes(action.payload.userId);
                const hasDisliked = dislikes.includes(action.payload.userId);

                if (action.payload.type === "like") {
                    if (hasLiked) {
                        favorites = favorites.filter((id) => id !== action.payload.userId);
                        favoritesCount = Math.max(0, favoritesCount - 1);
                    } else {
                        favorites.push(action.payload.userId);
                        favoritesCount += 1;
                        if (hasDisliked) {
                            dislikes = dislikes.filter((id) => id !== action.payload.userId);
                            dislikesCount = Math.max(0, dislikesCount - 1);
                        }
                    }
                } else {
                    // dislike
                    if (hasDisliked) {
                        dislikes = dislikes.filter((id) => id !== action.payload.userId);
                        dislikesCount = Math.max(0, dislikesCount - 1);
                    } else {
                        dislikes.push(action.payload.userId);
                        dislikesCount += 1;
                        if (hasLiked) {
                            favorites = favorites.filter((id) => id !== action.payload.userId);
                            favoritesCount = Math.max(0, favoritesCount - 1);
                        }
                    }
                }

                return {...c, favorites, dislikes, favoritesCount, dislikesCount};
            });
        },


        createCommentStart(
            _state,
            _action: PayloadAction<{ message: string; postId: string; parentId?: string | null }>,
        ) {
        },
        editCommentStart(
            _state,
            _action: PayloadAction<{ commentId: string; message: string }>,
        ) {
            // no state change
        },
        deleteCommentStart(_state, _action: PayloadAction<{ commentId: string }>) {
            // no state change
        },
        toggleReactionStart(
            _state,
            _action: PayloadAction<{ commentId: string; type: "like" | "dislike" }>,
        ) {
            // no state change
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

    fetchPostAndCommentsStart,
    fetchPostAndCommentsSuccess,
    fetchPostAndCommentsFailure,

    socketAddComment,
    socketUpdateComment,
    socketDeleteComment,
    socketUpdateReaction,

    updateReactionOptimistic,

    createCommentStart,
    editCommentStart,
    deleteCommentStart,
    toggleReactionStart,
} = postSlice.actions;

export default postSlice.reducer;