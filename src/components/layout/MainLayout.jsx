import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Header from './Header';
import { Toaster } from 'react-hot-toast';

const MainLayout = () => {
    const { i18n } = useTranslation();
    const { theme } = useSelector((state) => state.ui);
    const location = useLocation();
    const isRTL = i18n.language === 'ar';

    // Check if current page is chat to apply full-screen layout
    const isChatPage = location.pathname === '/chat';

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950" dir={isRTL ? 'rtl' : 'ltr'}>
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Header />

                <main className={`flex-1 overflow-auto ${isChatPage ? '' : 'p-4 lg:p-6'}`}>
                    <Outlet />
                </main>
            </div>

            <Toaster
                position={isRTL ? "top-left" : "top-right"}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: theme === 'dark' ? 'rgb(31, 41, 55)' : 'white',
                        color: theme === 'dark' ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)',
                        borderRadius: '0.5rem',
                        border: theme === 'dark' ? '1px solid rgb(55, 65, 81)' : '1px solid rgb(229, 231, 235)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#16a34a',
                            secondary: 'white',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#dc2626',
                            secondary: 'white',
                        },
                    },
                }}
            />
        </div>
    );
};

export default MainLayout;
