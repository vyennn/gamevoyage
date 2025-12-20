import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader, Eye, EyeOff } from 'lucide-react';
import { useForm } from '@inertiajs/react';

export default function AuthModal({ show, onClose, initialMode = 'login' }) {
    const [mode, setMode] = useState(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        setMode(initialMode);
    }, [initialMode, show]);

    useEffect(() => {
        if (!show) {
            reset();
            setShowPassword(false);
            setShowConfirmPassword(false);
        }
    }, [show]);

    const submit = (e) => {
        e.preventDefault();
        const endpoint = mode === 'login' ? route('login') : route('register');
        
        post(endpoint, {
            onSuccess: () => {
                reset();
                onClose();
                window.location.reload();
            },
            preserveScroll: true,
        });
    };

    if (!show) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/60 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div
                    key={mode} 
                    layout
                    initial={{ scale: 0.9, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 50 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-white dark:bg-gradient-to-br dark:from-gray-900/95 dark:to-black/95 backdrop-blur-2xl rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden"
                >
                    <div className="relative p-8 pb-0">
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-green-500 bg-clip-text text-transparent mb-2">
                            {mode === 'login' ? 'Welcome Back' : 'Join Quest Chronicle'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                            {mode === 'login' 
                                ? 'Sign in to save your favorites'
                                : 'Create an account to start your journey'}
                        </p>
                    </div>

                    <motion.form 
                        onSubmit={submit} 
                        className="p-8 pt-0 space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {mode === 'register' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        placeholder="Your name"
                                        required
                                    />
                                </div>
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full pl-12 pr-12 py-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-violet-500 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                        </div>

                        {mode === 'register' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full pl-12 pr-12 py-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-violet-500 transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-green-600 hover:to-purple-600 rounded-xl font-medium transition-all disabled:opacity-50 shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                mode === 'login' ? 'Sign In' : 'Create Account'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setMode(mode === 'login' ? 'register' : 'login');
                                reset();
                                setShowPassword(false);
                                setShowConfirmPassword(false);
                            }}
                            className="w-full text-sm text-gray-400 hover:text-violet-400 transition-colors mt-4"
                        >
                            {mode === 'login' 
                                ? "Don't have an account? Sign up"
                                : "Already have an account? Sign in"}
                        </button>
                    </motion.form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}