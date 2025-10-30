import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDocument } from '../hooks/useDocument.js';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Star, Filter, SortAsc } from 'lucide-react';
import toast from 'react-hot-toast';

const Documents = () => {
    const { t } = useTranslation();
    const {
        documents,
        loading,
        pagination,
        filters,
        toggleFavorite,
        download,
        changeSortBy,
        setFavoritesFilter
    } = useDocument(true); // Auto-load on mount

    const handleToggleFavorite = async (documentId) => {
        try {
            await toggleFavorite(documentId);
            toast.success(t('common.success'));
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const handleDownload = async (doc) => {
        try {
            await download(doc._id, doc.originalName);
            toast.success(t('common.success'));
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const handleOpenDocument = (documentId) => {
        window.open(`http://localhost:3001/api/documents/${documentId}/open`, '_blank');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-amber-600 dark:from-green-400 dark:to-amber-400 bg-clip-text text-transparent mb-2">
                    {t('documents.title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    {t('documents.history')}
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6">
                <button
                    onClick={() => setFavoritesFilter(!filters.showFavorites)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${filters.showFavorites
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-green-500'
                        }`}
                >
                    <Star className="w-4 h-4" />
                    <span className="text-sm sm:text-base">{t('documents.favorites')}</span>
                </button>

                <select
                    value={filters.sortBy}
                    onChange={(e) => changeSortBy(e.target.value)}
                    className="px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:border-green-500 focus:outline-none transition-colors text-sm sm:text-base"
                >
                    <option value="lastUsed">{t('documents.sortBy')}: {t('documents.sortByLastUsed')}</option>
                    <option value="createdAt">{t('documents.sortBy')}: {t('documents.sortByCreated')}</option>
                    <option value="originalName">{t('documents.sortBy')}: {t('documents.sortByName')}</option>
                </select>
            </div>

            {/* Documents Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
                </div>
            ) : documents.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                >
                    <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">{t('documents.emptyState')}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{t('documents.uploadFirst')}</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc, index) => (
                        <motion.div
                            key={doc._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="card p-6 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: doc.color || '#16a34a20' }}
                                >
                                    <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <button
                                    onClick={() => handleToggleFavorite(doc._id)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                >
                                    <Star
                                        className={`w-5 h-5 ${doc.isFavorite ? 'fill-amber-500 text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}
                                    />
                                </button>
                            </div>

                            <h3 className="font-semibold text-lg mb-2 truncate text-gray-900 dark:text-white">
                                {doc.displayName || doc.originalName}
                            </h3>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                {doc.analysis?.summary || t('common.noResults')}
                            </p>

                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                <span>💬 {doc.usage?.chatCount || 0}</span>
                                <span>👁️ {doc.usage?.viewCount || 0}</span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenDocument(doc._id)}
                                    className="flex-1 btn-secondary text-sm py-2"
                                >
                                    <Eye className="w-4 h-4 mr-1" />
                                    {t('documents.open')}
                                </button>
                                <button
                                    onClick={() => handleDownload(doc)}
                                    className="btn-secondary text-sm py-2"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                        disabled={!pagination.hasPrev}
                        onClick={() => dispatch(setFilters({ ...filters, page: filters.page - 1 }))}
                        className="btn-secondary disabled:opacity-50"
                    >
                        {t('common.previous')}
                    </button>
                    <span className="text-sm">
                        {t('common.page')} {pagination.currentPage} / {pagination.totalPages}
                    </span>
                    <button
                        disabled={!pagination.hasNext}
                        onClick={() => dispatch(setFilters({ ...filters, page: filters.page + 1 }))}
                        className="btn-secondary disabled:opacity-50"
                    >
                        {t('common.next')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Documents;
