import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, isLoading, error, login, clearError } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, clearError]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast.error(t('errors.required'));
            return;
        }

        try {
            const result = await login(formData);
            if (result.type.endsWith('/fulfilled')) {
                toast.success(t('auth.loginSuccess'));
                navigate('/dashboard');
            }
        } catch (err) {
            // Error is handled by useEffect
            console.error('Login error:', err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-600 to-amber-500 flex items-center justify-center shadow-xl">
                            <span className="text-white text-4xl">⚖️</span>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-amber-600 dark:from-green-400 dark:to-amber-400 bg-clip-text text-transparent mb-2">
                            {t('auth.login')}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                            {t('chat.greeting')}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                                {t('auth.email')}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input pl-10"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                                {t('auth.password')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input pl-10"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 text-lg font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t('auth.loading')}
                                </>
                            ) : (
                                t('auth.login')
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('auth.noAccount')}{' '}
                            <Link to="/register" className="link font-medium">
                                {t('auth.register')}
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
