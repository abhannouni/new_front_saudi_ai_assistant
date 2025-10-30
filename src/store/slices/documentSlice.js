import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API Configuration
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Load Document History
 * Loads user's document history with advanced filtering, sorting, and pagination
 */
export const loadDocumentHistory = createAsyncThunk(
    'document/loadDocumentHistory',
    async (params = {}, { rejectWithValue }) => {
        try {
            const {
                page = 1,
                limit = 20,
                sortBy = 'lastUsed',
                sortOrder = 'desc',
                documentType = '',
                tags = '',
                favorites = false
            } = params;

            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/documents/history`, {
                params: {
                    page,
                    limit,
                    sortBy,
                    sortOrder,
                    documentType,
                    tags,
                    favorites
                },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to load document history'
            );
        }
    }
);

/**
 * Toggle Document Favorite
 * Toggles the favorite status of a document
 */
export const toggleDocumentFavorite = createAsyncThunk(
    'document/toggleFavorite',
    async ({ documentId }, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const response = await axios.patch(
                `${API_URL}/documents/${documentId}/favorite`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            return { documentId };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to toggle favorite'
            );
        }
    }
);

/**
 * Create Document Chat
 * Creates a new chat conversation for a specific document
 */
export const createDocumentChat = createAsyncThunk(
    'document/createDocumentChat',
    async ({ documentId }, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${API_URL}/documents/${documentId}/chat`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            return {
                chatId: response.data.data.chatId,
                documentId
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create document chat'
            );
        }
    }
);

/**
 * Load Document Chats
 * Loads all chat conversations associated with a specific document
 */
export const loadDocumentChats = createAsyncThunk(
    'document/loadDocumentChats',
    async ({ documentId }, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const response = await axios.get(
                `${API_URL}/documents/${documentId}/chats`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            return {
                documentId,
                document: response.data.data.document,
                chats: response.data.data.chats
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to load document chats'
            );
        }
    }
);

/**
 * Get Document (legacy support)
 * Fetches a single document by ID
 */
export const getDocument = createAsyncThunk(
    'document/getDocument',
    async (documentId, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/documents/${documentId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            return response.data.data.document;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch document'
            );
        }
    }
);

/**
 * Upload Document
 * Uploads a new document for analysis
 */
export const uploadDocument = createAsyncThunk(
    'document/upload',
    async ({ file, language, analysisType }, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const formData = new FormData();
            formData.append('document', file);
            if (language) formData.append('language', language);
            if (analysisType) formData.append('analysisType', analysisType);

            const response = await axios.post(`${API_URL}/legal/analyze-document`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            });
            return response.data.data.document;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to upload document'
            );
        }
    }
);

/**
 * Download Document
 * Downloads a document file
 */
export const downloadDocument = createAsyncThunk(
    'document/download',
    async ({ documentId, originalName }, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/documents/${documentId}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = originalName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to download document'
            );
        }
    }
);

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
    // Documents array
    documents: [],

    // Loading states
    loading: false,
    uploading: false,
    loadingDocumentChats: false,

    // Error state
    error: null,

    // Pagination
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,

    // Filters and sorting
    sortBy: 'lastUsed',          // 'lastUsed', 'createdAt', 'originalName', 'totalInteractions'
    sortOrder: 'desc',           // 'asc' or 'desc'
    filterType: '',              // Document type filter
    limit: 20,                   // Items per page
    showFavorites: false,        // Show only favorites

    // Selected document details
    selectedDocument: null,
    selectedDocumentChats: [],

    // UI state
    viewMode: 'grid',            // 'grid' or 'list'
    searchQuery: ''              // Search text
};

// ============================================================================
// SLICE
// ============================================================================

const documentSlice = createSlice({
    name: 'document',
    initialState,
    reducers: {
        // Clear error
        clearError: (state) => {
            state.error = null;
        },

        // Set sort by field
        setSortBy: (state, action) => {
            state.sortBy = action.payload;
            state.currentPage = 1; // Reset to first page
        },

        // Set sort order
        setSortOrder: (state, action) => {
            state.sortOrder = action.payload;
            state.currentPage = 1;
        },

        // Set filter type
        setFilterType: (state, action) => {
            state.filterType = action.payload;
            state.currentPage = 1;
        },

        // Set limit (items per page)
        setLimit: (state, action) => {
            state.limit = action.payload;
            state.currentPage = 1;
        },

        // Set show favorites
        setShowFavorites: (state, action) => {
            state.showFavorites = action.payload;
            state.currentPage = 1;
        },

        // Set current page
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },

        // Set view mode
        setViewMode: (state, action) => {
            state.viewMode = action.payload;
        },

        // Set search query
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },

        // Set selected document
        setSelectedDocument: (state, action) => {
            state.selectedDocument = action.payload;
        },

        // Clear selected document
        clearSelectedDocument: (state) => {
            state.selectedDocument = null;
            state.selectedDocumentChats = [];
        },

        // Clear all documents
        clearDocuments: (state) => {
            state.documents = [];
            state.currentPage = 1;
            state.totalPages = 0;
            state.totalCount = 0;
            state.hasNext = false;
            state.hasPrev = false;
        }
    },

    extraReducers: (builder) => {
        builder
            // ========================================================================
            // LOAD DOCUMENT HISTORY
            // ========================================================================
            .addCase(loadDocumentHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadDocumentHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.documents = action.payload.documents;

                // Update pagination
                const { pagination } = action.payload;
                state.currentPage = pagination.currentPage;
                state.totalPages = pagination.totalPages;
                state.totalCount = pagination.totalCount;
                state.hasNext = pagination.hasNext;
                state.hasPrev = pagination.hasPrev;
            })
            .addCase(loadDocumentHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ========================================================================
            // TOGGLE DOCUMENT FAVORITE
            // ========================================================================
            .addCase(toggleDocumentFavorite.fulfilled, (state, action) => {
                const doc = state.documents.find(d => d._id === action.payload.documentId);
                if (doc) {
                    doc.isFavorite = !doc.isFavorite;
                }

                // Update selected document if it matches
                if (state.selectedDocument && state.selectedDocument._id === action.payload.documentId) {
                    state.selectedDocument.isFavorite = !state.selectedDocument.isFavorite;
                }
            })
            .addCase(toggleDocumentFavorite.rejected, (state, action) => {
                state.error = action.payload;
            })

            // ========================================================================
            // CREATE DOCUMENT CHAT
            // ========================================================================
            .addCase(createDocumentChat.fulfilled, (state, action) => {
                // Update chat count for the document
                const doc = state.documents.find(d => d._id === action.payload.documentId);
                if (doc && doc.usage) {
                    doc.usage.chatCount = (doc.usage.chatCount || 0) + 1;
                    doc.usage.totalInteractions = (doc.usage.totalInteractions || 0) + 1;
                }
            })
            .addCase(createDocumentChat.rejected, (state, action) => {
                state.error = action.payload;
            })

            // ========================================================================
            // LOAD DOCUMENT CHATS
            // ========================================================================
            .addCase(loadDocumentChats.pending, (state) => {
                state.loadingDocumentChats = true;
                state.error = null;
            })
            .addCase(loadDocumentChats.fulfilled, (state, action) => {
                state.loadingDocumentChats = false;
                state.selectedDocument = action.payload.document;
                state.selectedDocumentChats = action.payload.chats;
            })
            .addCase(loadDocumentChats.rejected, (state, action) => {
                state.loadingDocumentChats = false;
                state.error = action.payload;
            })

            // ========================================================================
            // GET DOCUMENT
            // ========================================================================
            .addCase(getDocument.fulfilled, (state, action) => {
                state.selectedDocument = action.payload;
            })
            .addCase(getDocument.rejected, (state, action) => {
                state.error = action.payload;
            })

            // ========================================================================
            // UPLOAD DOCUMENT
            // ========================================================================
            .addCase(uploadDocument.pending, (state) => {
                state.uploading = true;
                state.error = null;
            })
            .addCase(uploadDocument.fulfilled, (state, action) => {
                state.uploading = false;
                state.documents.unshift(action.payload);
                state.selectedDocument = action.payload;
                state.totalCount += 1;
            })
            .addCase(uploadDocument.rejected, (state, action) => {
                state.uploading = false;
                state.error = action.payload;
            })

            // ========================================================================
            // DOWNLOAD DOCUMENT
            // ========================================================================
            .addCase(downloadDocument.rejected, (state, action) => {
                state.error = action.payload;
            });
    }
});

// ============================================================================
// EXPORTS
// ============================================================================

export const {
    clearError,
    setSortBy,
    setSortOrder,
    setFilterType,
    setLimit,
    setShowFavorites,
    setCurrentPage,
    setViewMode,
    setSearchQuery,
    setSelectedDocument,
    clearSelectedDocument,
    clearDocuments
} = documentSlice.actions;

export default documentSlice.reducer;
