import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, Moon, Sun, Globe } from 'lucide-react';
import { toggleTheme, setLanguage, toggleSidebar, setMobileMenuOpen } from '../../store/slices/uiSlice.js';
import { motion } from 'framer-motion';

const Header = () => {
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const { theme } = useSelector((state) => state.ui);
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const handleThemeToggle = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        console.log('Toggling theme from', theme, 'to', newTheme);
        dispatch(toggleTheme());
    };

    const handleLanguageToggle = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        dispatch(setLanguage(newLang));
        i18n.changeLanguage(newLang);
    };

    return (
        <header className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6">
                {/* Left section */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={() => dispatch(setMobileMenuOpen(true))}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors lg:hidden"
                    >
                        <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <button
                        onClick={() => dispatch(toggleSidebar())}
                        className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Language toggle */}
                    <button
                        onClick={handleLanguageToggle}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                        title={t('profile.language')}
                    >
                        <Globe className="w-5 h-5" />
                    </button>

                    {/* Theme toggle */}
                    <button
                        onClick={handleThemeToggle}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                        title={t('profile.theme')}
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-5 h-5" />
                        ) : (
                            <Moon className="w-5 h-5" />
                        )}
                    </button>

                    {/* User profile */}
                    {isAuthenticated && user && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg bg-gradient-saudi text-white"
                        >
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-medium">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                            <span className="hidden md:block text-sm font-medium">
                                {user.firstName} {user.lastName}
                            </span>
                        </motion.div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
