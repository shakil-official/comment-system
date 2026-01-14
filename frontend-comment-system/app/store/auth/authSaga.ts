import {call, put, takeLatest} from "redux-saga/effects";
import api from "../../api/axios";
import {loginFailure, loginRequest, loginSuccess, registerFailure, registerRequest, registerSuccess} from "./authSlice";
import {toast} from "react-hot-toast";

type LoginPayload = {
    email: string;
    password: string;
};

function* loginWorker(action: ReturnType<typeof loginRequest>) {
    try {
        const response: { data: { _id: string; email: string; token: string } } = yield call(api.post, "/auth/login",
            action.payload as LoginPayload
        );

        localStorage.setItem("token", response.data.token);

        yield put(loginSuccess(response.data));

        toast.success("Login successful!");
    } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Login failed";
        yield put(loginFailure(message));
        toast.error(message);
    }
}

type AuthPayload = {
    name?: string;
    email: string;
    password: string;
};

function* registerWorker(action: ReturnType<typeof registerRequest>) {
    try {
        const response: { data: any } = yield call(api.post, "/auth/register", action.payload as AuthPayload);

        // Automatically log in after registration
        localStorage.setItem("token", response.data.token);
        yield put(registerSuccess(response.data));
        toast.success("Registration successful!");
    } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Registration failed";
        yield put(registerFailure(message));
        toast.error(message);
    }
}


export default function* authSaga() {
    yield takeLatest(loginRequest.type, loginWorker);
    yield takeLatest(registerRequest.type, registerWorker);
}
