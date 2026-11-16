// Saga-triggering actions (handled in sagas/userSaga.js)
export const loginUser = (currentUser) => ({
    type: 'user/login',
    currentUser,
});

export const refreshUser = () => ({
    type: 'user/refresh',
});

export const logout = () => ({
    type: 'user/logout',
});
