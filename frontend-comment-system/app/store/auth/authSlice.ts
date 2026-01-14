import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
    loading: boolean;
    user: any;
    error: string | null;
};

const initialState: AuthState = {
    loading: false,
    user: null,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginRequest(state, _action: PayloadAction<{ email: string; password: string }>) {
            state.loading = true;
            state.error = null;
        },
        loginSuccess(state, action: PayloadAction<any>) {
            state.loading = false;
            state.user = action.payload;
        },
        loginFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    loginRequest,
    loginSuccess,
    loginFailure,
} = authSlice.actions;

export default authSlice.reducer;
