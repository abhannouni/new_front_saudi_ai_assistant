import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
    // Force light mode as default for testing
    const saved = localStorage.getItem('theme');
    if (saved) {
        console.log('Saved theme found:', saved);
        return saved;
    }
    console.log('No saved theme, defaulting to light');
    return 'light'; // Changed from checking system preference to always default to light
};

const getInitialLanguage = () => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
};

const initialState = {
    theme: getInitialTheme(),
    language: getInitialLanguage(),
    sidebarOpen: true,
    mobileMenuOpen: false,
    notifications: [],
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setTheme: (state, action) => {
            const newTheme = action.payload;
            console.log('setTheme called with:', newTheme);

            state.theme = newTheme;
            localStorage.setItem('theme', newTheme);

            // Remove all theme classes first
            document.documentElement.classList.remove('dark', 'light');

            // Add the appropriate class
            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
                console.log('Applied dark class');
            } else {
                document.documentElement.classList.add('light');
                console.log('Applied light class, removed dark');
            }
        },
        toggleTheme: (state) => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            console.log('toggleTheme: changing from', state.theme, 'to', newTheme);

            state.theme = newTheme;
            localStorage.setItem('theme', newTheme);

            // Remove all theme classes first
            document.documentElement.classList.remove('dark', 'light');

            // Add the appropriate class
            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
                console.log('Toggled to dark mode');
            } else {
                document.documentElement.classList.add('light');
                console.log('Toggled to light mode, removed dark');
            }
        },
        setLanguage: (state, action) => {
            state.language = action.payload;
            localStorage.setItem('language', action.payload);
            document.documentElement.dir = action.payload === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = action.payload;
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload;
        },
        toggleMobileMenu: (state) => {
            state.mobileMenuOpen = !state.mobileMenuOpen;
        },
        setMobileMenuOpen: (state, action) => {
            state.mobileMenuOpen = action.payload;
        },
        addNotification: (state, action) => {
            state.notifications.push({
                id: Date.now(),
                ...action.payload,
            });
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
        },
    },
});

export const {
    setTheme,
    toggleTheme,
    setLanguage,
    toggleSidebar,
    setSidebarOpen,
    toggleMobileMenu,
    setMobileMenuOpen,
    addNotification,
    removeNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
