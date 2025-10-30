import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import {
    loadDocumentHistory,
    toggleDocumentFavorite,
    createDocumentChat,
    loadDocumentChats,
    uploadDocument,
    downloadDocument,
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
    clearDocuments,
    clearError
} from '../store/slices/documentSlice';

/**
 * Custom hook for document management
 * Provides a clean API for all document-related functionality
 * 
 * @param {boolean} autoLoad - Automatically load documents on mount (default: false)
 * @returns {Object} Document state and actions
 */
export const useDocument = (autoLoad = false) => {
    const dispatch = useDispatch();

    // Select all document state
    const documentState = useSelector(state => state.document);

    const {
        documents,
        loading,
        uploading,
        loadingDocumentChats,
        error,
        currentPage,
        totalPages,
        totalCount,
        hasNext,
        hasPrev,
        sortBy,
        sortOrder,
        filterType,
        limit,
        showFavorites,
        selectedDocument,
        selectedDocumentChats,
        viewMode,
        searchQuery
    } = documentState;

    // Auto-load documents on mount if enabled
    useEffect(() => {
        if (autoLoad && documents.length === 0 && !loading) {
            dispatch(loadDocumentHistory({
                page: 1,
                limit: 20,
                sortBy: 'lastUsed',
                sortOrder: 'desc'
            }));
        }
    }, [autoLoad, documents.length, loading, dispatch]);

    // ============================================================================
    // ASYNC ACTIONS
    // ============================================================================

    /**
     * Load documents with current or custom parameters
     */
    const loadDocuments = (params = {}) => {
        return dispatch(loadDocumentHistory({
            page: currentPage,
            limit,
            sortBy,
            sortOrder,
            documentType: filterType,
            favorites: showFavorites,
            ...params
        }));
    };

    /**
     * Reload documents with current filters
     */
    const reloadDocuments = () => {
        return loadDocuments();
    };

    /**
     * Toggle favorite status of a document
     */
    const toggleFavorite = (documentId) => {
        return dispatch(toggleDocumentFavorite({ documentId }));
    };

    /**
     * Create a new chat for a document
     */
    const createChat = (documentId) => {
        return dispatch(createDocumentChat({ documentId }));
    };

    /**
     * Load chats for a specific document
     */
    const loadChats = (documentId) => {
        return dispatch(loadDocumentChats({ documentId }));
    };

    /**
     * Upload a new document
     */
    const upload = (file, language, analysisType) => {
        return dispatch(uploadDocument({ file, language, analysisType }));
    };

    /**
     * Download a document
     */
    const download = (documentId, originalName) => {
        return dispatch(downloadDocument({ documentId, originalName }));
    };

    // ============================================================================
    // FILTER AND SORT ACTIONS
    // ============================================================================

    /**
     * Change sort field and reload
     */
    const changeSortBy = (newSortBy) => {
        dispatch(setSortBy(newSortBy));
        return loadDocuments({ page: 1, sortBy: newSortBy });
    };

    /**
     * Change sort order and reload
     */
    const changeSortOrder = (newSortOrder) => {
        dispatch(setSortOrder(newSortOrder));
        return loadDocuments({ page: 1, sortOrder: newSortOrder });
    };

    /**
     * Toggle sort order (asc <-> desc) and reload
     */
    const toggleSortOrder = () => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        dispatch(setSortOrder(newOrder));
        return loadDocuments({ page: 1, sortOrder: newOrder });
    };

    /**
     * Change document type filter and reload
     */
    const changeFilterType = (newFilterType) => {
        dispatch(setFilterType(newFilterType));
        return loadDocuments({ page: 1, documentType: newFilterType });
    };

    /**
     * Change items per page and reload
     */
    const changeLimit = (newLimit) => {
        dispatch(setLimit(newLimit));
        return loadDocuments({ page: 1, limit: newLimit });
    };

    /**
     * Toggle favorites filter and reload
     */
    const toggleFavoritesFilter = () => {
        const newValue = !showFavorites;
        dispatch(setShowFavorites(newValue));
        return loadDocuments({ page: 1, favorites: newValue });
    };

    /**
     * Set favorites filter and reload
     */
    const setFavoritesFilter = (value) => {
        dispatch(setShowFavorites(value));
        return loadDocuments({ page: 1, favorites: value });
    };

    // ============================================================================
    // PAGINATION ACTIONS
    // ============================================================================

    /**
     * Go to a specific page
     */
    const goToPage = (pageNumber) => {
        dispatch(setCurrentPage(pageNumber));
        return loadDocuments({ page: pageNumber });
    };

    /**
     * Go to next page
     */
    const nextPage = () => {
        if (hasNext) {
            return goToPage(currentPage + 1);
        }
    };

    /**
     * Go to previous page
     */
    const prevPage = () => {
        if (hasPrev) {
            return goToPage(currentPage - 1);
        }
    };

    /**
     * Go to first page
     */
    const firstPage = () => {
        return goToPage(1);
    };

    /**
     * Go to last page
     */
    const lastPage = () => {
        return goToPage(totalPages);
    };

    // ============================================================================
    // UI STATE ACTIONS
    // ============================================================================

    /**
     * Change view mode (grid/list)
     */
    const changeViewMode = (mode) => {
        dispatch(setViewMode(mode));
    };

    /**
     * Toggle view mode
     */
    const toggleViewMode = () => {
        dispatch(setViewMode(viewMode === 'grid' ? 'list' : 'grid'));
    };

    /**
     * Update search query
     */
    const updateSearchQuery = (query) => {
        dispatch(setSearchQuery(query));
    };

    /**
     * Select a document
     */
    const selectDocument = (document) => {
        dispatch(setSelectedDocument(document));
    };

    /**
     * Clear selected document
     */
    const deselectDocument = () => {
        dispatch(clearSelectedDocument());
    };

    /**
     * Clear error
     */
    const dismissError = () => {
        dispatch(clearError());
    };

    /**
     * Clear all documents
     */
    const clearAllDocuments = () => {
        dispatch(clearDocuments());
    };

    // ============================================================================
    // COMPUTED VALUES
    // ============================================================================

    /**
     * Filter documents by search query (client-side)
     */
    const filteredDocuments = documents.filter(doc =>
        doc.originalName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    /**
     * Check if any filters are active
     */
    const hasActiveFilters = filterType || showFavorites || sortBy !== 'lastUsed';

    /**
     * Reset all filters to default
     */
    const resetFilters = () => {
        dispatch(setSortBy('lastUsed'));
        dispatch(setSortOrder('desc'));
        dispatch(setFilterType(''));
        dispatch(setShowFavorites(false));
        dispatch(setSearchQuery(''));
        return loadDocuments({
            page: 1,
            sortBy: 'lastUsed',
            sortOrder: 'desc',
            documentType: '',
            favorites: false
        });
    };

    // ============================================================================
    // RETURN API
    // ============================================================================

    return {
        // State
        documents: filteredDocuments,
        allDocuments: documents,
        loading,
        uploading,
        loadingDocumentChats,
        error,

        // Pagination
        pagination: {
            currentPage,
            totalPages,
            totalCount,
            hasNext,
            hasPrev
        },

        // Filters
        filters: {
            sortBy,
            sortOrder,
            filterType,
            limit,
            showFavorites,
            hasActiveFilters
        },

        // Selected document
        selectedDocument,
        selectedDocumentChats,

        // UI state
        viewMode,
        searchQuery,

        // Document actions
        loadDocuments,
        reloadDocuments,
        toggleFavorite,
        createChat,
        loadChats,
        upload,
        download,

        // Filter and sort actions
        changeSortBy,
        changeSortOrder,
        toggleSortOrder,
        changeFilterType,
        changeLimit,
        toggleFavoritesFilter,
        setFavoritesFilter,
        resetFilters,

        // Pagination actions
        goToPage,
        nextPage,
        prevPage,
        firstPage,
        lastPage,

        // UI actions
        changeViewMode,
        toggleViewMode,
        updateSearchQuery,
        selectDocument,
        deselectDocument,
        dismissError,
        clearAllDocuments
    };
};

export default useDocument;
