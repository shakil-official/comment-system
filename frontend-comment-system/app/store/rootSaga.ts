import {all} from "redux-saga/effects";
import authSaga from "./auth/authSaga";
import postSaga from "./posts/postSaga";

export default function* rootSaga() {
    yield all([authSaga(), postSaga()]);
}
