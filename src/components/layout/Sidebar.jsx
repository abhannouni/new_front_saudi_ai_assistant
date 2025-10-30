import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    MessageSquare,
    FileText,
    LayoutDashboard,
    User,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.js';
import { toggleSidebar, setMobileMenuOpen } from '../../store/slices/uiSlice.js';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Sidebar = () => {
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout: logoutUser } = useAuth();
    const { sidebarOpen, mobileMenuOpen } = useSelector((state) => state.ui);

    const isRTL = i18n.language === 'ar';

    const navigation = [
        { name: t('nav.home'), href: '/', icon: Home, auth: false },
        { name: t('nav.chat'), href: '/chat', icon: MessageSquare, auth: false },
        { name: t('nav.documents'), href: '/documents', icon: FileText, auth: true },
        { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard, auth: true },
        { name: t('nav.profile'), href: '/profile', icon: User, auth: true },
    ];

    const filteredNavigation = navigation.filter(item => !item.auth || isAuthenticated);

    const handleLogout = async () => {
        try {
            await logoutUser();
            dispatch(setMobileMenuOpen(false));
            toast.success(t('auth.logoutSuccess') || 'Logged out successfully');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error(t('errors.logoutFailed') || 'Logout failed');
        }
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => dispatch(setMobileMenuOpen(false))}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    x: mobileMenuOpen || sidebarOpen ? 0 : (isRTL ? 280 : -280),
                }}
                className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full bg-white dark:bg-gray-900 ${isRTL ? 'border-l' : 'border-r'
                    } border-gray-200 dark:border-gray-800 z-50 lg:z-30 ${sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
                    } transition-all duration-300`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
                        {sidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2"
                            >
                                <div className="w-8 h-8 rounded-lg gradient-saudi flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">⚖️</span>
                                </div>
                                <span className="font-bold text-lg text-gradient">Legal AI</span>
                            </motion.div>
                        )}
                        <button
                            onClick={() => dispatch(toggleSidebar())}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 lg:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                        {filteredNavigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => dispatch(setMobileMenuOpen(false))}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {sidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="font-medium"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-2 border-t border-gray-200 dark:border-gray-800">
                        {isAuthenticated && (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <LogOut className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="font-medium"
                                    >
                                        {t('nav.logout')}
                                    </motion.span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* Spacer for desktop */}
            <div className={`hidden lg:block ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex-shrink-0`} />
        </>
    );
};

export default Sidebar;
