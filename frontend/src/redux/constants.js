export const baseURL = (process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8080').replace(/\/$/, '');

export const endPoints = {
    baseURL,
    // auth
    login: '/auth/login',
    guest: '/auth/guest',
    signup: '/auth/signup',
    verifyEmail: '/auth/verify-email',
    verifyOTP: '/auth/verify-otp',
    resetPassword: '/auth/reset-password',
    me: '/auth/me',
    updateProfile: '/auth/update-profile',
    updateEmail: '/auth/update-email',
    confirmEmail: '/auth/confirm-email',
    changePassword: '/auth/change-password',
    deleteUser: '/auth/delete-user',
    sendMessage: '/auth/send-message',
    // ai studio
    analyze: '/ai/analyze',
    designs: '/ai/designs',
    design: (id) => `/ai/designs/${id}`,
    visualize: (id) => `/ai/designs/${id}/visualize`,
};
