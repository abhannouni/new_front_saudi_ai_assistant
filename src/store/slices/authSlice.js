import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get API URL from environment variable or use default
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Axios instance with interceptors
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token to headers
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If token expired and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/auth/refresh`, {
                        refreshToken
                    });

                    const { token } = response.data.data;
                    localStorage.setItem('token', token);

                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, clear auth data
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Async thunks
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            const { token, refreshToken, user } = response.data.data;

            // Store tokens and user data
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            return { token, refreshToken, user };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.error?.details ||
                'Login failed'
            );
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/auth/register', userData);
            const { token, refreshToken, user } = response.data.data;

            // Store tokens and user data
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            return { token, refreshToken, user };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.error?.details ||
                'Registration failed'
            );
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            // Call backend logout endpoint (optional)
            await apiClient.post('/auth/logout');

            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            return true;
        } catch (error) {
            // Even if API call fails, clear local data
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            return rejectWithValue(
                error.response?.data?.message || 'Logout failed'
            );
        }
    }
);

export const verifyToken = createAsyncThunk(
    'auth/verifyToken',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await apiClient.get('/auth/verify');
            return response.data.data.user;
        } catch (error) {
            // Clear invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            return rejectWithValue(
                error.response?.data?.message ||
                'Token verification failed'
            );
        }
    }
);

export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (refreshTokenValue, { rejectWithValue }) => {
        try {
            const tokenToUse = refreshTokenValue || localStorage.getItem('refreshToken');

            if (!tokenToUse) {
                throw new Error('No refresh token available');
            }

            const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken: tokenToUse
            });

            const { token, refreshToken: newRefreshToken } = response.data.data;

            // Store new tokens
            localStorage.setItem('token', token);
            if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
            }

            return { token, refreshToken: newRefreshToken || tokenToUse };
        } catch (error) {
            // Clear tokens on refresh failure
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            return rejectWithValue(
                error.response?.data?.message ||
                'Token refresh failed'
            );
        }
    }
);

export const getUserProfile = createAsyncThunk(
    'auth/getUserProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/user/profile');
            return response.data.data.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Failed to fetch profile'
            );
        }
    }
);

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,
    isAuthModalOpen: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        setAuthModalOpen: (state, action) => {
            state.isAuthModalOpen = action.payload;
        },
        loadUserFromStorage: (state) => {
            const user = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');

            if (user && token) {
                state.user = JSON.parse(user);
                state.token = token;
                state.refreshToken = refreshToken;
                state.isAuthenticated = true;
            }
        },
        clearAuth: (state) => {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = null;
            state.isLoading = false;
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            localStorage.setItem('user', JSON.stringify(state.user));
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.error = action.payload;
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.error = action.payload;
            })
            // Logout
            .addCase(logoutUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.isLoading = false;
                // Still clear auth data even on error
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.error = action.payload;
            })
            // Verify Token
            .addCase(verifyToken.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(verifyToken.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                localStorage.setItem('user', JSON.stringify(action.payload));
            })
            .addCase(verifyToken.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.error = action.payload;
            })
            // Refresh Token
            .addCase(refreshToken.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.isLoading = false;
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken;
                state.error = null;
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.error = action.payload;
            })
            // Get Profile
            .addCase(getUserProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                localStorage.setItem('user', JSON.stringify(action.payload));
            })
            .addCase(getUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    logout,
    clearError,
    setAuthModalOpen,
    loadUserFromStorage,
    clearAuth,
    updateUser
} = authSlice.actions;

export default authSlice.reducer;
