import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, MessageSquare, BarChart3, ArrowRight, Plus } from 'lucide-react';

const Dashboard = () => {
    const { t } = useTranslation();
    const { user } = useSelector((state) => state.auth);

    const stats = [
        {
            label: t('documents.totalDocuments'),
            value: user?.stats?.totalDocuments || 0,
            icon: FileText,
            color: 'from-primary-500 to-primary-600',
            link: '/documents'
        },
        {
            label: t('documents.totalChats'),
            value: user?.stats?.totalChats || 0,
            icon: MessageSquare,
            color: 'from-accent-500 to-accent-600',
            link: '/chat'
        },
        {
            label: t('documents.totalQueries'),
            value: user?.stats?.totalQueries || 0,
            icon: BarChart3,
            color: 'from-blue-500 to-blue-600',
            link: '/documents'
        }
    ];

    const quickActions = [
        {
            title: t('chat.newChat'),
            description: t('dashboard.quickAction.newChat.description'),
            icon: MessageSquare,
            link: '/chat',
            color: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
        },
        {
            title: t('documents.upload'),
            description: t('dashboard.quickAction.uploadDoc.description'),
            icon: Plus,
            link: '/chat',
            color: 'bg-accent-50 dark:bg-accent-900/20 text-accent-600'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Welcome */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 sm:mb-10"
            >
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-amber-600 dark:from-green-400 dark:to-amber-400 bg-clip-text text-transparent">
                    {t('dashboard.welcome')}, {user?.firstName}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    {t('dashboard.overview')}
                </p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                to={stat.link}
                                className="block bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-green-500 transform hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                </div>
                                <h3 className="text-3xl sm:text-4xl font-bold mb-1 text-gray-900 dark:text-white">{stat.value}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">{t('dashboard.quickActions')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <motion.div
                                key={action.title}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    to={action.link}
                                    className="block card p-6 hover:shadow-lg transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center shrink-0`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                                {action.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {action.description}
                                            </p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('dashboard.recentActivity')}</h2>
                <div className="card p-6">
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No recent activity yet. Start by creating a chat or uploading a document.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
