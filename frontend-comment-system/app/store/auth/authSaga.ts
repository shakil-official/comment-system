import { call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";
import { loginFailure, loginRequest, loginSuccess } from "./authSlice";

type LoginPayload = {
    email: string;
    password: string;
};

function* loginWorker(action: ReturnType<typeof loginRequest>) {
    try {

        const response: { data: any } = yield call(api.post, "/login", action.payload as LoginPayload);

        yield put(loginSuccess(response.data));
    } catch (error: any) {
        yield put(loginFailure(error.message || "Login failed"));
    }
}

export default function* authSaga() {
    yield takeLatest(loginRequest.type, loginWorker);
}

