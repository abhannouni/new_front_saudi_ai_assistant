import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get API URL from environment variable or use default
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Helper function to generate session ID
const generateUniqueSessionId = () => {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('token');

// Async thunks

/**
 * Send a message to the chat API
 * @param {Object} params
 * @param {Object} params.messageData - Message content and metadata
 * @param {string} params.sessionId - Current session identifier
 */
export const sendMessage = createAsyncThunk(
    'chat/sendMessage',
    async ({ messageData, sessionId }, { rejectWithValue, getState }) => {
        try {
            const token = getAuthToken();
            const state = getState().chat;

            const requestData = {
                message: messageData.content, // Backend expects 'message' not 'content'
                language: messageData.language || 'en',
                sessionId,
                chatId: state.currentChatId || undefined,
                documentId: messageData.metadata?.documentId || undefined
            };

            console.log('📤 Sending message with data:', requestData);
            console.log('📄 Document ID:', requestData.documentId);

            const response = await axios.post(
                `${API_URL}/chat/message`,
                requestData,
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );

            console.log('✅ Message sent successfully:', response.data);

            return response.data.data;
        } catch (error) {
            console.error('❌ Failed to send message:', error.response?.data || error);
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.error?.details ||
                'Failed to send message'
            );
        }
    }
);

/**
 * Load chat history with pagination
 * @param {Object} params
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {boolean} params.append - Append to existing history (default: false)
 */
export const loadChatHistory = createAsyncThunk(
    'chat/loadChatHistory',
    async ({ page = 1, limit = 20, append = false } = {}, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/chat/history`, {
                params: { page, limit },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            return {
                chats: response.data.data.chats || [],
                hasMore: response.data.data.hasMore || false,
                page,
                append
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to load chat history'
            );
        }
    }
);

/**
 * Load more chat history (convenience action)
 */
export const loadMoreChatHistory = createAsyncThunk(
    'chat/loadMoreChatHistory',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState().chat;
            const nextPage = state.historyPage + 1;

            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/chat/history`, {
                params: { page: nextPage, limit: 20 },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            return {
                chats: response.data.data.chats || [],
                hasMore: response.data.data.hasMore || false,
                page: nextPage,
                append: true
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to load more chat history'
            );
        }
    }
);

/**
 * Load a specific chat conversation
 * @param {Object} params
 * @param {string} params.chatId - Chat ID to load
 * @param {string} params.sessionId - Current session identifier
 */
export const loadChat = createAsyncThunk(
    'chat/loadChat',
    async ({ chatId, sessionId }, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/chat/${chatId}`, {
                params: { sessionId },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to load chat'
            );
        }
    }
);

/**
 * Delete a chat conversation
 * @param {Object} params
 * @param {string} params.chatId - Chat ID to delete
 * @param {string} params.sessionId - Current session identifier
 */
export const deleteChat = createAsyncThunk(
    'chat/deleteChat',
    async ({ chatId, sessionId }, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            await axios.delete(`${API_URL}/chat/${chatId}`, {
                params: { sessionId },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            return chatId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete chat'
            );
        }
    }
);

/**
 * Get chat statistics
 */
export const getChatStats = createAsyncThunk(
    'chat/getChatStats',
    async (_, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/chat/stats`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch chat stats'
            );
        }
    }
);

// Initial state
const initialState = {
    messages: [],
    chatHistory: [],
    currentChatId: sessionStorage.getItem('currentChatId') || null,
    currentChatTitle: sessionStorage.getItem('currentChatTitle') || null,
    isLoading: false,
    isSendingMessage: false,
    isTyping: false,
    isLoadingHistory: false,
    hasMoreHistory: true,
    historyPage: 0,
    error: null,
    sessionId: null,
    stats: null
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        // Clear error message
        clearError: (state) => {
            state.error = null;
        },

        // Add user message immediately (optimistic update)
        addUserMessageImmediate: (state, action) => {
            state.messages.push({
                ...action.payload,
                type: 'user',
                timestamp: action.payload.timestamp || new Date().toISOString()
            });
        },

        // Set typing indicator
        setTypingIndicator: (state, action) => {
            state.isTyping = action.payload;
        },

        // Start new chat
        startNewChat: (state) => {
            state.messages = [];
            state.currentChatId = null;
            state.currentChatTitle = null;
            state.error = null;
            sessionStorage.removeItem('currentChatId');
            sessionStorage.removeItem('currentChatTitle');
        },

        // Set current chat
        setCurrentChat: (state, action) => {
            state.currentChatId = action.payload.chatId;
            state.currentChatTitle = action.payload.title;
            if (action.payload.chatId) {
                sessionStorage.setItem('currentChatId', action.payload.chatId);
                sessionStorage.setItem('currentChatTitle', action.payload.title || '');
            }
        },

        // Generate session ID
        generateSessionId: (state) => {
            state.sessionId = generateUniqueSessionId();
        },

        // Clear all chat data
        clearChat: (state) => {
            state.messages = [];
            state.chatHistory = [];
            state.currentChatId = null;
            state.currentChatTitle = null;
            state.error = null;
            state.sessionId = null;
            state.stats = null;
            sessionStorage.removeItem('currentChatId');
            sessionStorage.removeItem('currentChatTitle');
        },

        // Load stored chat ID from sessionStorage
        loadStoredChatId: (state) => {
            const storedChatId = sessionStorage.getItem('currentChatId');
            const storedChatTitle = sessionStorage.getItem('currentChatTitle');
            if (storedChatId) {
                state.currentChatId = storedChatId;
                state.currentChatTitle = storedChatTitle;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Send Message
            .addCase(sendMessage.pending, (state) => {
                state.isSendingMessage = true;
                state.isTyping = true;
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.isSendingMessage = false;
                state.isTyping = false;

                // Update chat ID and title
                if (action.payload.chatId) {
                    state.currentChatId = action.payload.chatId;
                    sessionStorage.setItem('currentChatId', action.payload.chatId);
                }
                if (action.payload.chatTitle) {
                    state.currentChatTitle = action.payload.chatTitle;
                    sessionStorage.setItem('currentChatTitle', action.payload.chatTitle);
                }

                // Add user message if not already added (optimistic update)
                if (action.payload.userMessage) {
                    const userMessageExists = state.messages.some(
                        msg => msg.id === action.payload.userMessage.id
                    );
                    if (!userMessageExists) {
                        state.messages.push({
                            ...action.payload.userMessage,
                            type: 'user'
                        });
                    }
                }

                // Add bot message
                if (action.payload.botMessage) {
                    state.messages.push({
                        ...action.payload.botMessage,
                        type: 'bot'
                    });
                }
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.isSendingMessage = false;
                state.isTyping = false;
                state.error = action.payload;

                // Add error message to chat
                state.messages.push({
                    id: `error-${Date.now()}`,
                    type: 'bot',
                    content: `Sorry, there was an error: ${action.payload}`,
                    timestamp: new Date().toISOString(),
                    isError: true
                });
            })

            // Load Chat History
            .addCase(loadChatHistory.pending, (state) => {
                state.isLoadingHistory = true;
                state.error = null;
            })
            .addCase(loadChatHistory.fulfilled, (state, action) => {
                state.isLoadingHistory = false;

                if (action.payload.append) {
                    state.chatHistory = [...state.chatHistory, ...action.payload.chats];
                } else {
                    state.chatHistory = action.payload.chats;
                }

                state.hasMoreHistory = action.payload.hasMore;
                state.historyPage = action.payload.page;
            })
            .addCase(loadChatHistory.rejected, (state, action) => {
                state.isLoadingHistory = false;
                state.error = action.payload;
            })

            // Load More Chat History
            .addCase(loadMoreChatHistory.pending, (state) => {
                state.isLoadingHistory = true;
            })
            .addCase(loadMoreChatHistory.fulfilled, (state, action) => {
                state.isLoadingHistory = false;
                state.chatHistory = [...state.chatHistory, ...action.payload.chats];
                state.hasMoreHistory = action.payload.hasMore;
                state.historyPage = action.payload.page;
            })
            .addCase(loadMoreChatHistory.rejected, (state, action) => {
                state.isLoadingHistory = false;
                state.error = action.payload;
            })

            // Load Chat
            .addCase(loadChat.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loadChat.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentChatId = action.payload._id;
                state.currentChatTitle = action.payload.title;
                state.messages = action.payload.messages || [];

                // Store in sessionStorage
                sessionStorage.setItem('currentChatId', action.payload._id);
                sessionStorage.setItem('currentChatTitle', action.payload.title);
            })
            .addCase(loadChat.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Delete Chat
            .addCase(deleteChat.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteChat.fulfilled, (state, action) => {
                state.isLoading = false;

                // Remove from chat history
                state.chatHistory = state.chatHistory.filter(
                    chat => chat.id !== action.payload
                );

                // Clear current chat if it was deleted
                if (state.currentChatId === action.payload) {
                    state.currentChatId = null;
                    state.currentChatTitle = null;
                    state.messages = [];
                    sessionStorage.removeItem('currentChatId');
                    sessionStorage.removeItem('currentChatTitle');
                }
            })
            .addCase(deleteChat.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Get Chat Stats
            .addCase(getChatStats.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getChatStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload;
            })
            .addCase(getChatStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const {
    clearError,
    addUserMessageImmediate,
    setTypingIndicator,
    startNewChat,
    setCurrentChat,
    generateSessionId,
    clearChat,
    loadStoredChatId
} = chatSlice.actions;

export default chatSlice.reducer;
