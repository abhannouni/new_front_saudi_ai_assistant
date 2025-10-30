import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import {
    sendMessage,
    loadChatHistory,
    loadMoreChatHistory,
    loadChat,
    deleteChat,
    getChatStats,
    clearError,
    addUserMessageImmediate,
    setTypingIndicator,
    startNewChat,
    setCurrentChat,
    generateSessionId,
    clearChat,
    loadStoredChatId
} from '../store/slices/chatSlice.js';

/**
 * Custom hook for chat functionality
 * Provides easy access to all chat state and actions
 */
export const useChat = () => {
    const dispatch = useDispatch();
    const chat = useSelector((state) => state.chat);

    // Initialize session on mount
    useEffect(() => {
        if (!chat.sessionId) {
            dispatch(generateSessionId());
        }
        dispatch(loadStoredChatId());
    }, [chat.sessionId, dispatch]);

    return {
        // State
        messages: chat.messages,
        chatHistory: chat.chatHistory,
        currentChatId: chat.currentChatId,
        currentChatTitle: chat.currentChatTitle,
        isLoading: chat.isLoading,
        isSendingMessage: chat.isSendingMessage,
        isTyping: chat.isTyping,
        isLoadingHistory: chat.isLoadingHistory,
        hasMoreHistory: chat.hasMoreHistory,
        historyPage: chat.historyPage,
        error: chat.error,
        sessionId: chat.sessionId,
        stats: chat.stats,

        // Actions
        sendMessage: (messageData) => dispatch(sendMessage({ messageData, sessionId: chat.sessionId })),
        loadChatHistory: (params) => dispatch(loadChatHistory(params)),
        loadMoreChatHistory: () => dispatch(loadMoreChatHistory()),
        loadChat: (chatId) => dispatch(loadChat({ chatId, sessionId: chat.sessionId })),
        deleteChat: (chatId) => dispatch(deleteChat({ chatId, sessionId: chat.sessionId })),
        getChatStats: () => dispatch(getChatStats()),
        clearError: () => dispatch(clearError()),
        addUserMessageImmediate: (message) => dispatch(addUserMessageImmediate(message)),
        setTypingIndicator: (isTyping) => dispatch(setTypingIndicator(isTyping)),
        startNewChat: () => dispatch(startNewChat()),
        setCurrentChat: (chatData) => dispatch(setCurrentChat(chatData)),
        generateSessionId: () => dispatch(generateSessionId()),
        clearChat: () => dispatch(clearChat()),
        loadStoredChatId: () => dispatch(loadStoredChatId())
    };
};

export default useChat;
