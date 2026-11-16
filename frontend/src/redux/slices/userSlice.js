import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentUser: null, // { id, username, email, profileImage, emailVerified, createdAt, accessToken }
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload;
        },
        updateUser: (state, action) => {
            if (state.currentUser) {
                state.currentUser = { ...state.currentUser, ...action.payload };
            }
        },
        clearUser: (state) => {
            state.currentUser = null;
        },
    },
});

export const { setCurrentUser, updateUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
