import { call, put, select, takeLatest } from 'redux-saga/effects';
import { clearUser, setCurrentUser, updateUser } from '../slices/userSlice';
import axios, { setAuthToken } from '../https';
import { endPoints } from '../constants';

const selectToken = (state) => state?.user?.currentUser?.accessToken;

function* handleLogin(action) {
    setAuthToken(action?.currentUser?.accessToken);
    yield put(setCurrentUser(action?.currentUser));
}

// Re-fetch the profile on app start so stale persisted data is corrected
// and an expired token signs the user out.
function* handleRefresh() {
    const token = yield select(selectToken);
    if (!token) return;
    try {
        setAuthToken(token);
        const { data } = yield call(axios.get, endPoints.me);
        if (data?.data) {
            yield put(updateUser(data.data));
        }
    } catch (error) {
        if (error?.response?.status === 401) {
            setAuthToken(null);
            yield put(clearUser());
        }
    }
}

function* handleLogout() {
    setAuthToken(null);
    yield put(clearUser());
}

function* userSaga() {
    yield takeLatest('user/login', handleLogin);
    yield takeLatest('user/refresh', handleRefresh);
    yield takeLatest('user/logout', handleLogout);
}

export default userSaga;
