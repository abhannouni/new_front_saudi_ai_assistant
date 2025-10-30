import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '@/hooks/useChat.js';
import { useDispatch, useSelector } from 'react-redux';
import { uploadDocument, getDocument, loadDocumentHistory } from '../store/slices/documentSlice.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Paperclip,
    Plus,
    Bot,
    User as UserIcon,
    Loader2,
    FileText,
    X,
    History,
    ChevronRight,
    AlertTriangle,
    CheckCircle,
    Info,
    MessageSquare,
    Calendar,
    Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Chat = () => {
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const {
        messages,
        isSendingMessage,
        isTyping,
        currentChatTitle,
        currentChatId,
        chatHistory,
        isLoadingHistory,
        error,
        sendMessage,
        startNewChat,
        clearError,
        loadChatHistory,
        loadChat,
        deleteChat
    } = useChat();

    const { uploading, documents: documentsState, loading: loadingDocuments } = useSelector((state) => state.document);
    const documents = documentsState.documents || [];

    const [input, setInput] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [showDocumentHistory, setShowDocumentHistory] = useState(false);
    const [historyTab, setHistoryTab] = useState('documents'); // 'documents' or 'chats'
    const [analyzedDocument, setAnalyzedDocument] = useState(null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [selectedDocumentForChat, setSelectedDocumentForChat] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const documentsLoadAttempted = useRef(false);
    const chatsLoadAttempted = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Create a stable loadDocuments function
    const loadDocuments = useCallback(() => {
        if (!documentsLoadAttempted.current) {
            documentsLoadAttempted.current = true;
            console.log('📄 Loading documents (dispatch action)');
            dispatch(loadDocumentHistory({
                page: 1,
                limit: 20,
                sortBy: 'lastUsed',
                sortOrder: 'desc'
            }));
        }
    }, [dispatch]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, clearError]);

    // Load chat history when sidebar opens with chat tab
    useEffect(() => {
        if (showDocumentHistory && historyTab === 'chats' && !chatsLoadAttempted.current && !isLoadingHistory) {
            chatsLoadAttempted.current = true;
            loadChatHistory();
        }

        // Reset when sidebar closes
        if (!showDocumentHistory) {
            chatsLoadAttempted.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showDocumentHistory, historyTab, isLoadingHistory]);

    // Load documents when sidebar opens with documents tab
    useEffect(() => {
        if (showDocumentHistory && historyTab === 'documents') {
            const token = localStorage.getItem('token');
            if (token && !loadingDocuments && !documentsLoadAttempted.current) {
                loadDocuments();
            } else if (!token && !documentsLoadAttempted.current) {
                documentsLoadAttempted.current = true;
                toast.error(t('auth.loginRequired') || 'Please login to view documents');
            }
        }

        // Reset when sidebar closes
        if (!showDocumentHistory) {
            documentsLoadAttempted.current = false;
        }
    }, [showDocumentHistory, historyTab, loadingDocuments, loadDocuments, t]);

    // Helper function to format document analysis for display in chat
    const formatDocumentAnalysis = (document) => {
        if (!document.analysis) return '';

        const { analysis } = document;
        let formattedText = `📄 **${document.originalName || document.displayName}**\n\n`;

        if (analysis.summary) {
            formattedText += `**${t('documents.summary')}:**\n${analysis.summary}\n\n`;
        }

        if (analysis.keyPoints && analysis.keyPoints.length > 0) {
            formattedText += `**${t('documents.keyPoints')}:**\n`;
            analysis.keyPoints.forEach((point, idx) => {
                formattedText += `${idx + 1}. ${point}\n`;
            });
            formattedText += '\n';
        }

        if (analysis.risks && analysis.risks.length > 0) {
            formattedText += `**${t('documents.risks')}:**\n`;
            analysis.risks.forEach((risk, idx) => {
                formattedText += `⚠️ ${risk.category}: ${risk.description} (${t(`documents.riskLevel.${risk.level}`) || risk.level})\n`;
            });
            formattedText += '\n';
        }

        if (analysis.compliance?.saudiLaw?.recommendations && analysis.compliance.saudiLaw.recommendations.length > 0) {
            formattedText += `**${t('documents.recommendations')}:**\n`;
            analysis.compliance.saudiLaw.recommendations.forEach((rec, idx) => {
                formattedText += `→ ${rec}\n`;
            });
        }

        return formattedText;
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                toast.error(t('documents.fileTooLarge') || 'File size must be less than 10MB');
                return;
            }

            // Check file type (PDF and Word documents)
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            if (!allowedTypes.includes(file.type)) {
                toast.error(t('documents.invalidFileType') || 'Only PDF and Word documents are allowed');
                return;
            }

            setSelectedFile(file);
            toast.success(t('documents.fileSelected') || 'File selected successfully');
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUploadDocument = async () => {
        if (!selectedFile) return null;

        const uploadToast = toast.loading(t('documents.uploading') || 'Uploading document...');

        try {
            const result = await dispatch(uploadDocument({
                file: selectedFile,
                language: i18n.language,
                analysisType: 'detailed'
            })).unwrap();

            toast.dismiss(uploadToast);
            toast.success(t('documents.uploadSuccess') || 'Document uploaded successfully!');

            // Store analyzed document and show analysis
            setAnalyzedDocument(result);
            setShowAnalysis(true);

            return result._id;
        } catch (error) {
            console.error('Upload error:', error);
            toast.dismiss(uploadToast);
            toast.error(error || t('documents.uploadFailed') || 'Failed to upload document');
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!input.trim() && !selectedFile) return;
        if (isSendingMessage) return;

        let documentId = null;

        // Upload document first if selected
        if (selectedFile) {
            documentId = await handleUploadDocument();
            if (!documentId) {
                // Upload failed, don't send message
                return;
            }
        }

        // Use selected document for chat if available
        if (!documentId && selectedDocumentForChat) {
            documentId = selectedDocumentForChat._id;
            console.log('📄 Using selected document for chat:', {
                documentId,
                name: selectedDocumentForChat.originalName || selectedDocumentForChat.displayName,
                type: selectedDocumentForChat.documentType
            });
        }

        const messageText = input.trim() || t('chat.analyzing');

        // Prepare message data with document context
        const messageData = {
            content: messageText,
            language: i18n.language,
            metadata: documentId ? {
                documentId,
                ...(selectedDocumentForChat && {
                    documentName: selectedDocumentForChat.originalName || selectedDocumentForChat.displayName,
                    documentType: selectedDocumentForChat.documentType
                })
            } : {}
        };

        console.log('💬 Submitting message:', messageData);

        try {
            const result = await sendMessage(messageData);
            if (result.type.endsWith('/fulfilled')) {
                setInput('');
                handleRemoveFile();
            }
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const handleNewChat = () => {
        startNewChat();
        setInput('');
        handleRemoveFile();
        setSelectedDocumentForChat(null);
    };

    const handleSelectDocumentForChat = async (doc) => {
        try {
            // Check if user is authenticated
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error(t('auth.loginRequired') || 'Please login to access documents');
                return;
            }

            console.log('📄 Selecting document for chat:', doc);

            // Load full document details
            const result = await dispatch(getDocument(doc._id)).unwrap();

            console.log('✅ Document loaded:', result);

            // Set the document for chat context
            setSelectedDocumentForChat(result);

            // Close the history sidebar
            setShowDocumentHistory(false);

            // Start a new chat with the document context
            startNewChat();

            // Send an initial message to establish document context with the AI
            // This helps the AI understand which document we're talking about
            const contextMessage = `I want to discuss the document "${result.originalName || result.displayName}" (ID: ${result._id}). ${result.analysis?.summary ? 'Summary: ' + result.analysis.summary : ''}`;

            console.log('💬 Sending initial context message:', contextMessage);

            const initialMessage = {
                content: contextMessage,
                language: i18n.language,
                metadata: {
                    documentId: result._id,
                    documentName: result.originalName || result.displayName,
                    documentType: result.documentType
                }
            };

            // Send the context message to the AI
            await sendMessage(initialMessage);

            toast.success(t('chat.documentSelected') || `Selected: ${result.originalName || result.displayName}`);
        } catch (error) {
            console.error('Failed to load document:', error);
            if (error === 'Authentication required') {
                toast.error(t('auth.sessionExpired') || 'Your session has expired. Please login again.');
            } else {
                toast.error(t('documents.loadFailed') || 'Failed to load document');
            }
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-amber-600 dark:from-green-400 dark:to-amber-400 bg-clip-text text-transparent">
                        {t('chat.title')}
                    </h1>
                    {selectedDocumentForChat ? (
                        <div className="flex items-center gap-2 mt-2">
                            <FileText className="w-4 h-4 text-green-600" />
                            <p className="text-green-600 dark:text-green-400 text-sm sm:text-base font-medium">
                                {t('chat.chattingWith')}: {selectedDocumentForChat.originalName || selectedDocumentForChat.displayName}
                            </p>
                            <button
                                onClick={() => setSelectedDocumentForChat(null)}
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title={t('chat.removeDocument')}
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                            {t('chat.greeting')}
                        </p>
                    )}
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setShowDocumentHistory(!showDocumentHistory)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 transition-all"
                        title={t('documents.history')}
                    >
                        <History className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('documents.history')}</span>
                    </button>

                    <button
                        onClick={handleNewChat}
                        className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex-1 sm:flex-none justify-center"
                    >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>{t('chat.newChat')}</span>
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6">
                <div className="max-w-4xl mx-auto space-y-4">
                    {/* Document Context Banner - Show when document is selected */}
                    {selectedDocumentForChat && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-4"
                        >
                            <div className="flex items-start gap-3">
                                <FileText className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-green-900 dark:text-green-100 mb-2">
                                        📄 {selectedDocumentForChat.originalName || selectedDocumentForChat.displayName}
                                    </h3>
                                    {selectedDocumentForChat.analysis && (
                                        <div className="space-y-3 text-sm">
                                            {selectedDocumentForChat.analysis.summary && (
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{t('documents.summary')}:</p>
                                                    <p className="text-gray-700 dark:text-gray-300 mt-1">{selectedDocumentForChat.analysis.summary}</p>
                                                </div>
                                            )}
                                            {selectedDocumentForChat.analysis.keyPoints && selectedDocumentForChat.analysis.keyPoints.length > 0 && (
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{t('documents.keyPoints')}:</p>
                                                    <ul className="list-disc list-inside mt-1 space-y-1 text-gray-700 dark:text-gray-300">
                                                        {selectedDocumentForChat.analysis.keyPoints.slice(0, 3).map((point, idx) => (
                                                            <li key={idx}>{point}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <AnimatePresence>
                        {messages.length === 0 && !selectedDocumentForChat ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center h-full text-center p-4"
                            >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-600 to-amber-500 flex items-center justify-center mb-4 shadow-xl">
                                    <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t('chat.greeting')}</h2>
                                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                    {t('chat.startConversation')}
                                </p>
                            </motion.div>
                        ) : (
                            messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}
                                >
                                    {message.type === 'bot' && (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.isError ? 'bg-red-500' : 'gradient-saudi'
                                            }`}>
                                            <Bot className="w-5 h-5 text-white" />
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.type === 'user'
                                            ? 'bg-green-600 text-white'
                                            : message.isError
                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap">{message.content}</p>

                                        {/* Document analysis badge */}
                                        {message.isAnalysis && message.documentInfo && (
                                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <FileText className="w-4 h-4" />
                                                    <span>{message.documentInfo.name}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Files attached */}
                                        {message.files && message.files.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                {message.files.map((file, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <Paperclip className="w-4 h-4" />
                                                        <span>{file.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Timestamp */}
                                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            {new Date(message.timestamp).toLocaleTimeString(i18n.language, {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>

                                    {message.type === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center shrink-0">
                                            <UserIcon className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3"
                        >
                            <div className="w-8 h-8 rounded-full gradient-saudi flex items-center justify-center shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Sending message indicator (deprecated - replaced by isTyping) */}
                    {isSendingMessage && !isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3"
                        >
                            <div className="w-8 h-8 rounded-full gradient-saudi flex items-center justify-center shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-gray-600 dark:text-gray-400">{t('chat.typing')}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Form */}
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 lg:px-6 py-4">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                    {selectedFile && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-3 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-lg p-3"
                        >
                            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span className="flex-1 text-sm truncate text-gray-900 dark:text-gray-100">{selectedFile.name}</span>
                            <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="p-1 hover:bg-green-100 dark:hover:bg-green-900/40 rounded text-gray-700 dark:text-gray-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}

                    <div className="flex items-end gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt"
                        />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading || isSendingMessage}
                            className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                            title={t('chat.uploadDocument')}
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder={t('chat.placeholder')}
                            className="flex-1 resize-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none min-h-[44px] max-h-32"
                            rows={1}
                        />

                        <button
                            type="submit"
                            disabled={(!input.trim() && !selectedFile) || isSendingMessage || uploading}
                            className="p-3 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSendingMessage || uploading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Document History Sidebar */}
            <AnimatePresence>
                {showDocumentHistory && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDocumentHistory(false)}
                            className="fixed inset-0 bg-black/50 z-40"
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-hidden flex flex-col"
                        >
                            {/* Sidebar Header */}
                            <div className="flex flex-col border-b border-gray-200 dark:border-gray-800">
                                <div className="flex items-center justify-between p-4">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <History className="w-5 h-5" />
                                        {t('history.title')}
                                    </h2>
                                    <button
                                        onClick={() => setShowDocumentHistory(false)}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-2 px-4 pb-3">
                                    <button
                                        onClick={() => setHistoryTab('documents')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${historyTab === 'documents'
                                            ? 'bg-green-600 text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <FileText className="w-4 h-4" />
                                        {t('history.documents')}
                                    </button>
                                    <button
                                        onClick={() => setHistoryTab('chats')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${historyTab === 'chats'
                                            ? 'bg-green-600 text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        {t('history.chats')}
                                    </button>
                                </div>
                            </div>

                            {/* Sidebar Content */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {historyTab === 'documents' ? (
                                    // Documents Tab
                                    loadingDocuments ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                                        </div>
                                    ) : documents.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                            <p className="text-gray-600 dark:text-gray-400">{t('documents.emptyState')}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {documents.map((doc) => (
                                                <motion.div
                                                    key={doc._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-md transition-all"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <FileText className="w-5 h-5 text-green-600 shrink-0 mt-1" />
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                                {doc.originalName || doc.displayName}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                {doc.documentType || 'Document'}
                                                            </p>
                                                            {doc.usage && (
                                                                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                                                    <span>👁 {doc.usage.viewCount || 0}</span>
                                                                    <span>💬 {doc.usage.chatCount || 0}</span>
                                                                </div>
                                                            )}

                                                            {/* Action buttons */}
                                                            <div className="flex gap-2 mt-3">
                                                                <button
                                                                    onClick={() => handleSelectDocumentForChat(doc)}
                                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                                                >
                                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                                    {t('chat.chatWithDoc')}
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            const token = localStorage.getItem('token');
                                                                            if (!token) {
                                                                                toast.error(t('auth.loginRequired') || 'Please login to access documents');
                                                                                return;
                                                                            }
                                                                            const result = await dispatch(getDocument(doc._id)).unwrap();
                                                                            setAnalyzedDocument(result);
                                                                            setShowAnalysis(true);
                                                                        } catch (error) {
                                                                            console.error('Failed to load document:', error);
                                                                            if (error === 'Authentication required') {
                                                                                toast.error(t('auth.sessionExpired') || 'Your session has expired. Please login again.');
                                                                            } else {
                                                                                toast.error(t('documents.loadFailed') || 'Failed to load document');
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
                                                                >
                                                                    <Info className="w-3.5 h-3.5" />
                                                                    {t('documents.viewAnalysis')}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )
                                ) : (
                                    // Chats Tab
                                    isLoadingHistory ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                                        </div>
                                    ) : chatHistory.length === 0 ? (
                                        <div className="text-center py-12">
                                            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                            <p className="text-gray-600 dark:text-gray-400">{t('chat.emptyHistory')}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {chatHistory.map((chat) => (
                                                <motion.div
                                                    key={chat._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`p-4 rounded-xl hover:shadow-md transition-all cursor-pointer ${chat._id === currentChatId
                                                        ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                                                        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                    onClick={() => {
                                                        loadChat(chat._id);
                                                        setShowDocumentHistory(false);
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                                            <MessageSquare className="w-5 h-5 text-green-600 shrink-0 mt-1" />
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                                    {chat.title || t('chat.untitled')}
                                                                </h3>
                                                                {chat.lastMessage && (
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                                        {chat.lastMessage}
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="w-3 h-3" />
                                                                        {new Date(chat.updatedAt || chat.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                    {chat.messageCount && (
                                                                        <span>💬 {chat.messageCount}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {chat._id === currentChatId && (
                                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (window.confirm(t('chat.confirmDelete'))) {
                                                                        deleteChat(chat._id);
                                                                    }
                                                                }}
                                                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600"
                                                                title={t('chat.deleteChat')}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Document Analysis Modal */}
            <AnimatePresence>
                {showAnalysis && analyzedDocument && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAnalysis(false)}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                        >
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto">
                                {/* Modal Header */}
                                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                            <FileText className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {analyzedDocument.originalName || 'Document Analysis'}
                                            </h2>
                                            {analyzedDocument.documentType && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {analyzedDocument.documentType}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowAnalysis(false)}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Modal Content */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    {analyzedDocument.analysis ? (
                                        <div className="space-y-6">
                                            {/* Summary */}
                                            {analyzedDocument.analysis.summary && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Info className="w-5 h-5 text-blue-600" />
                                                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                                            {t('documents.summary')}
                                                        </h3>
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                        {analyzedDocument.analysis.summary}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Key Points */}
                                            {analyzedDocument.analysis.keyPoints && analyzedDocument.analysis.keyPoints.length > 0 && (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                                            {t('documents.keyPoints')}
                                                        </h3>
                                                    </div>
                                                    <ul className="space-y-2">
                                                        {analyzedDocument.analysis.keyPoints.map((point, index) => (
                                                            <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                                                <span className="text-green-600 font-bold">•</span>
                                                                <span>{point}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Risks */}
                                            {analyzedDocument.analysis.risks && analyzedDocument.analysis.risks.length > 0 && (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                                                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                                            {t('documents.risks')}
                                                        </h3>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {analyzedDocument.analysis.risks.map((risk, index) => (
                                                            <div key={index} className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${risk.level === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                        risk.level === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                        }`}>
                                                                        {risk.level || 'Medium'}
                                                                    </span>
                                                                    {risk.category && (
                                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                            {risk.category}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-gray-700 dark:text-gray-300">
                                                                    {risk.description}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Recommendations */}
                                            {analyzedDocument.analysis.compliance?.saudiLaw?.recommendations &&
                                                analyzedDocument.analysis.compliance.saudiLaw.recommendations.length > 0 && (
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <CheckCircle className="w-5 h-5 text-blue-600" />
                                                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                                                {t('documents.recommendations')}
                                                            </h3>
                                                        </div>
                                                        <ul className="space-y-2">
                                                            {analyzedDocument.analysis.compliance.saudiLaw.recommendations.map((rec, index) => (
                                                                <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                                                    <span className="text-blue-600 font-bold">→</span>
                                                                    <span>{rec}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {t('documents.noAnalysis') || 'No analysis available for this document'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
                                    <button
                                        onClick={() => setShowAnalysis(false)}
                                        className="px-6 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                                    >
                                        {t('common.close') || 'Close'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAnalysis(false);
                                            // Start a chat with this document
                                            setInput(t('chat.askAboutDocument') || `Tell me about this document: ${analyzedDocument.originalName}`);
                                        }}
                                        className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
                                    >
                                        💬 {t('chat.askQuestions') || 'Ask Questions'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Chat;
