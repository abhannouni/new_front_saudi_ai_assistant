import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import {
    loginUser,
    registerUser,
    logoutUser,
    verifyToken,
    refreshToken,
    getUserProfile,
    clearError,
    setAuthModalOpen,
    loadUserFromStorage,
    clearAuth,
} from '../store/slices/authSlice.js';

/**
 * Custom hook for authentication
 * Provides easy access to auth state and actions
 */
export const useAuth = () => {
    const dispatch = useDispatch();
    const auth = useSelector((state) => state.auth);

    // Load user from storage on mount
    useEffect(() => {
        dispatch(loadUserFromStorage());
    }, [dispatch]);

    // Auto-verify token on mount if token exists
    useEffect(() => {
        if (auth.token && !auth.user) {
            dispatch(verifyToken());
        }
    }, [auth.token, auth.user, dispatch]);

    return {
        // State
        user: auth.user,
        token: auth.token,
        refreshToken: auth.refreshToken,
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading,
        error: auth.error,
        isAuthModalOpen: auth.isAuthModalOpen,

        // Actions
        login: (credentials) => dispatch(loginUser(credentials)),
        register: (userData) => dispatch(registerUser(userData)),
        logout: () => dispatch(logoutUser()),
        verifyToken: () => dispatch(verifyToken()),
        refreshToken: (token) => dispatch(refreshToken(token)),
        getProfile: () => dispatch(getUserProfile()),
        clearError: () => dispatch(clearError()),
        setAuthModalOpen: (isOpen) => dispatch(setAuthModalOpen(isOpen)),
        clearAuth: () => dispatch(clearAuth()),
    };
};

export default useAuth;
