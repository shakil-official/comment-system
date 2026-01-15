import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import postsReducer from "./posts/postSlice";

const rootReducer = combineReducers({
    auth: authReducer,
    posts: postsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
