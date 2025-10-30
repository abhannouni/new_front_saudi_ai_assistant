import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, MessageSquare, FileText, Shield, ArrowRight } from 'lucide-react';

const Home = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: Scale,
            title: t('home.features.expertise.title'),
            description: t('home.features.expertise.description')
        },
        {
            icon: MessageSquare,
            title: t('home.features.consultation.title'),
            description: t('home.features.consultation.description')
        },
        {
            icon: FileText,
            title: t('home.features.analysis.title'),
            description: t('home.features.analysis.description')
        },
        {
            icon: Shield,
            title: t('home.features.security.title'),
            description: t('home.features.security.description')
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section with Modern Gradient Background */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 dark:bg-green-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl animate-blob"></div>
                    <div className="absolute top-40 right-10 w-72 h-72 bg-amber-200 dark:bg-amber-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-green-300 dark:bg-green-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl animate-blob animation-delay-4000"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-green-600 to-amber-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/50"
                    >
                        <Scale className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                    >
                        <span className="bg-gradient-to-r from-green-600 to-amber-600 dark:from-green-400 dark:to-amber-400 bg-clip-text text-transparent">
                            {t('home.title')}
                        </span>
                        <br />
                        <span className="text-gray-900 dark:text-white">
                            {t('home.subtitle')}
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
                    >
                        {t('home.tagline')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Link
                            to="/chat"
                            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                        >
                            <MessageSquare className="w-5 h-5 mr-2" />
                            {t('chat.newChat')}
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-green-700 dark:text-green-400 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200 dark:border-green-800 w-full sm:w-auto"
                        >
                            {t('auth.login')}
                        </Link>
                    </motion.div>
                </motion.div>
            </div>

            {/* Features Section with Modern Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        {t('home.features.title')}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {t('home.features.subtitle')}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transform hover:-translate-y-2"
                            >
                                {/* Gradient Background on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-amber-50 dark:from-green-900/10 dark:to-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-amber-500 mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white text-center">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* CTA Section with Modern Design */}
            <div className="bg-gradient-to-br from-green-600 via-green-700 to-amber-600 dark:from-green-800 dark:via-green-900 dark:to-amber-800">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                        {t('home.cta.title')}
                    </h2>
                    <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {t('home.cta.subtitle')}
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-green-700 bg-white rounded-xl hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                        {t('auth.register')}
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
