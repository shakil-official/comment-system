import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

type User = {
    _id: string;
    name? : string;
    email: string;
    token: string;
};

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

        // Registration
        registerRequest(state, action: PayloadAction<{name : string, email: string; password: string }>) {
            state.loading = true;
            state.error = null;
        },
        registerSuccess(state, action: PayloadAction<User>) {
            state.loading = false;
            state.user = action.payload; // automatically logged in
        },
        registerFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },

        logout(state) {
            state.user = null;
            localStorage.removeItem("token");
        },
    },
});

export const {
    loginRequest,
    loginSuccess,
    loginFailure,
    registerRequest,
    registerSuccess,
    registerFailure,
    logout,
} = authSlice.actions;

export default authSlice.reducer;
