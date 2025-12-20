
import React, { useState, useEffect, useRef, useCallback} from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, Gamepad2, Heart, BookOpen, Sparkles, X, Plus, Edit2, Trash2, User, LogOut, ChevronDown, Menu, Filter, Star, TrendingUp, Clock } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import AuthModal from '@/Components/AuthModal';
import GameVoyageIntro from '@/Components/GameVoyageIntro';
import ThemeToggle from '@/Components/ThemeToggle';
import '@google/model-viewer/dist/model-viewer.min.js';

export default function Index({ games, userFavorites, userNotes, auth }) {
    if (!games || games.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <Gamepad2 className="w-20 h-20 text-violet-500 mx-auto mb-4 animate-spin" />
                    <p className="text-xl text-gray-400">Loading games...</p>
                </div>
            </div>
        );
    }
        
    const [showPlanetIntro, setShowPlanetIntro] = useState(true);
    const [showGameVoyageIntro, setShowGameVoyageIntro] = useState(false);
    const [introComplete, setIntroComplete] = useState(false);
        
    // Planet shows for 3 seconds then fades out
    useEffect(() => {
        const planetTimer = setTimeout(() => {
            setShowPlanetIntro(false);
            setShowGameVoyageIntro(true);
        }, 3000);

        return () => {
            clearTimeout(planetTimer);
        };
    }, []);
        
    const handleGameVoyageIntroComplete = useCallback(() => {
        setShowGameVoyageIntro(false);
        setIntroComplete(true);
    }, []);

    const [isDark, setIsDark] = useState(false);

    //adjust dark mode as not default
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const [selectedGame, setSelectedGame] = useState(null);
    const [favorites, setFavorites] = useState(userFavorites || []);
    const [notes, setNotes] = useState(userNotes || {});
    const [showFavorites, setShowFavorites] = useState(false);
    const [filterGenre, setFilterGenre] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingNote, setEditingNote] = useState(null);
    const [noteText, setNoteText] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [activeSection, setActiveSection] = useState('explore');
    const { scrollYProgress } = useScroll();
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
    const heroOpacity = useTransform(smoothProgress, [0, 0.3], [1, 0]);
    const heroScale = useTransform(smoothProgress, [0, 0.3], [1, 0.95]);
    const heroY = useTransform(smoothProgress, [0, 0.3], [0, -100]);
    const scrollToGames = () => {
        document.getElementById('games-section').scrollIntoView({ behavior: 'smooth' });
    };
    const resetFilters = () => {
        setSearchTerm('');
        setFilterGenre('all');
    };
        
    useEffect(() => {
        let rafId;
        
    const handleMouseMove = (e) => {
        if (rafId) return;
            
        rafId = requestAnimationFrame(() => {
                setMousePosition({ x: e.clientX, y: e.clientY });
                rafId = null;
        }
        );
    };
        
    window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, 
    []);

    useEffect(() => {
        setFavorites(userFavorites || []);
        setNotes(userNotes || {});
    }, [userFavorites, userNotes]);

    useEffect(() => {
        const handleScroll = () => {
            const heroSection = document.querySelector('section');
            const gamesSection = document.getElementById('games-section');
                
            if (gamesSection && window.scrollY >= gamesSection.offsetTop - 100) {
                    // When in games section and NOT showing favorites, it's still "explore"
            if (!showFavorites) {
                    setActiveSection('explore');  // ← Changed from 'games'
                }
            } else if (heroSection) {
                    // When at hero section
                setActiveSection('explore');
            }
        };
            
    window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showFavorites]);
        
    const genres = ['all', ...new Set(games.map(g => g.genre))];

    const filteredGames = games.filter(game => {
        const matchesGenre = filterGenre === 'all' || game.genre === filterGenre;
        const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            game.short_description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesGenre && matchesSearch;
    });
        
    const displayGames = showFavorites
        ? games.filter(g => favorites.includes(g.id))
        : filteredGames;

        console.log('Debug:', {
            showFavorites,
            searchTerm,
            filterGenre,
            totalGames: games.length,
            filteredGames: filteredGames.length,
            displayGames: displayGames.length
        });

    const toggleFavorite = async (game) => {
        console.log('Toggle favorite clicked', { game, authUser: auth.user });
            
        if (!auth.user) {
            console.log('User not authenticated, showing login modal');
            setAuthMode('login');
            setShowAuthModal(true);
            return;
        }
        
        const isFavorite = favorites.includes(game.id);
        console.log('Is favorite?', isFavorite);
        
        if (isFavorite) {
            try {
                console.log('Removing favorite:', game.id);
                const response = await fetch(`/favorites/${game.id}`, {
                    method: 'DELETE',
                    headers: { 
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content 
                    }
                });
                console.log('Delete response:', response);
                    
                if (response.ok) {
                    setFavorites(prev => prev.filter(id => id !== game.id));
                }
            } catch (error) {
                console.error('Error removing favorite:', error);
            }
        } else {
            try {
                console.log('Adding favorite:', game);
                const response = await fetch('/favorites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({
                        game_id: game.id,
                        game_title: game.title,
                        game_thumbnail: game.thumbnail,
                        game_genre: game.genre
                    })
                }
                );
                console.log('Add response:', response);  
                if (response.ok) {
                    setFavorites(prev => [...prev, game.id]);
                }
            } catch (error) {
                console.error('Error adding favorite:', error);
            }
        }
    };

    const saveNote = (gameId) => {
        if (!auth.user) {
            setAuthMode('login');
            setShowAuthModal(true);
            return;
        }
        
        router.post('/notes', 
            { game_id: gameId, note: noteText },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNotes(prev => ({ ...prev, [gameId]: noteText }));
                    setEditingNote(null);
                    setNoteText('');
                },
                onError: (errors) => {
                    console.error('Error saving note:', errors);
                }
            }
        );
    };

    const deleteNote = (gameId) => {
        router.delete(`/notes/${gameId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setNotes(prev => {
                    const updated = { ...prev };
                    delete updated[gameId];
                    return updated;
                });
            },
            onError: (errors) => {
                console.error('Error deleting note:', errors);
            }
        });
    };

    const startEditNote = (gameId) => {
        setEditingNote(gameId);
        setNoteText(notes[gameId] || '');
    };

    const handleLogout = () => {
        router.post('/logout', {}, {
            onSuccess: () => {
                setFavorites([]);
                setNotes({});
                setShowFavorites(false);
            }
        });
    };

    return (
        <>
        <Head title="GameVoyage" />
                
            {/* Planet Intro Animation - Shows First */}
            {showPlanetIntro && (
                <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center overflow-hidden">
                    <style>{`
                        @keyframes planetZoomFade {
                            0% { 
                                transform: scale(0.5); 
                                   opacity: 0; 
                            }
                            20% {
                                transform: scale(1);
                                opacity: 1;
                            }
                            70% {
                                transform: scale(7);
                                opacity: 1;
                            }
                            100% { 
                                transform: scale(10); 
                                opacity: 0; 
                            }
                        }
                    `}</style>
                        
                    <img 
                        src="/Model/planet01.png"
                        alt="Planet"
                        className="w-96 h-96 object-contain"
                        style={{ 
                            animation: 'planetZoomFade 3s ease-in-out forwards' 
                        }}
                    />
                </div>
            )}

            {/* GameVoyage Intro - Shows Second */}
            {showGameVoyageIntro && (
                <GameVoyageIntro onComplete={handleGameVoyageIntroComplete} />
            )}

            {introComplete && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
            <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white overflow-x-hidden transition-colors duration-300">
            <motion.div 
                className="fixed inset-0 pointer-events-none z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
            >
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-violet-400 rounded-full"
                        initial={{
                            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
                            opacity: 0
                        }}
                        animate={{
                            y: [
                            null,
                            Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080)
                            ],
                            opacity: [0.2, 0.6, 0.2]
                        }}
                        transition={{
                            duration: Math.random() * 4 + 3,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </motion.div>
    
            {/* Cursor Follower */}
            <div className="fixed w-6 h-6 border-2 border-violet-500 dark:border-violet-500 rounded-full pointer-events-none z-50 mix-blend-difference hidden lg:block"
                style={{
                    left: `${mousePosition.x - 12}px`,
                    top: `${mousePosition.y - 12}px`,
                    transition: 'none'
                }}
            />

            {/* Animated Background Gradient */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(0, 0, 0, 0.15) 0%, transparent 70%)',
                    left: mousePosition.x - 400,
                    top: mousePosition.y - 400,
                }}
                transition={{ type: "spring", damping: 50 }}
            />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Fixed Navigation Header - FLOATING TRANSPARENT VERSION */}
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-40"
        >
        <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-[auto_1fr_auto_auto] items-center h-20">

        {/* Logo - Floating Pill */}
        <motion.div 
            className="flex items-center gap-3 cursor-pointer bg-white/90 dark:bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 dark:border-white/10"
            whileHover={{ scale: 1.05 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-500 via-green-500 to-green-500 bg-clip-text text-transparent">
                GameVoyage
            </h1>
        </motion.div>

        {/* Desktop Menu - Floating Pill */}
        <nav className="hidden lg:flex justify-center">
            <div className="flex gap-3 bg-white/90 dark:bg-black/30 backdrop-blur-md px-2 py-2 rounded-full border border-gray-200 dark:border-white/10">
            
            `{/* Explore */}
            <button
                onClick={() => {
                    setActiveSection('explore');  
                    setShowFavorites(false);
                    setSearchTerm('');        
                    setFilterGenre('all');
                    scrollToGames(); 
                }}
                className={`font-bold px-4 py-2 rounded-full transition-all ${
                    activeSection === 'explore' && !showFavorites
                        ? 'bg-violet-500 text-white'
                        : 'text-violet-600 dark:text-violet-400 hover:bg-violet-300 dark:hover:bg-white/10'
                }`}
            >
                Explore
            </button>

            {/* Collection */}
            <button 
                onClick={() => {
                    setShowFavorites(true);
                    setActiveSection('collection');
                    setSearchTerm('');        // ← ADD THIS: Clear search
                    setFilterGenre('all');
                    scrollToGames();
                }}
                className={`font-bold px-4 py-2 rounded-full transition-all ${
                    showFavorites 
                        ? 'bg-violet-500 text-white'
                        : 'text-violet-600 dark:text-violet-400 hover:bg-violet-300 dark:hover:bg-white/10'
                }`}>
                Collection ({favorites.length})
            </button>`
        </div>
    </nav>

    {/* Auth Buttons - Floating Pill */}
    <div className="flex items-center gap-4">
    <ThemeToggle />
        {auth?.user ? (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-black/30 backdrop-blur-md hover:bg-gray-200 dark:hover:bg-black/50 rounded-full transition-all border border-gray-200 dark:border-white/10"
            >
                <User className="w-4 h-4" />
                <span className="hidden md:inline text-sm">{auth.user.name}</span>
            </motion.button>

            <AnimatePresence>
                {showUserMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                    >
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-3 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-left text-sm text-gray-900 dark:text-white"
                        >
                            <LogOut className="w-4 h-4" />
                                Logout
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
                </div>
                    ) : (
                        <div className="flex gap-2 bg-gray-100 dark:bg-violet-100/10 backdrop-blur-md px-2 py-2 rounded-full border border-gray-200 dark:border-white/10">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setAuthMode('login');
                                    setShowAuthModal(true);
                                }}
                                className="font-bold px-4 py-2 text-l text-violet-600 dark:text-violet-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-all"
                            >
                                Login
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setAuthMode('register');
                                    setShowAuthModal(true);
                                }}
                                className="font-bold px-4 py-2 text-sm bg-gradient-to-r from-violet-500 to-violet-500 hover:from-violet-400 hover:to-violet-400 rounded-full transition-all">
                                Sign Up
                            </motion.button>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.header>

        {/* Hero Section - Full Screen */}
        <motion.section className="relative min-h-screen flex items-center justify-center px-4 pt-50">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl mx-auto w-full">
                            
        {/* Left: Text Content */}
        <div className="text-center lg:text-left max-w-xl space-y-11">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-1 px-4 py-2 bg-violet-100 dark:bg-white/5 backdrop-blur-sm rounded-full border border-gray-200 dark:border-white/10"
        >
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="text-violet-600 dark:text-violet-400 text-sm font-medium tracking-widest uppercase">
                Your Free Gaming Universe Awaits
            </span>
        </motion.div>
        
        <motion.h1 className="text-5xl md:text-7xl lg:text-7xl font-bold leading-none">
            
            {/* Left-to-right span */}
            <motion.span
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ type: "spring", damping: 15, stiffness: 120, delay: 0.2 }}
                className="inline-block bg-gradient-to-r from-violet-400 via-green-400 to-green-400 bg-clip-text text-transparent"
            >
                Embark on
            </motion.span>

            {/* Right-to-left span */}
            <motion.span
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ type: "spring", damping: 15, stiffness: 120, delay: 0.2 }}
                className="inline-block bg-gradient-to-r from-violet-500 via-green-500 to-green-500 bg-clip-text text-transparent pb-1"
            >
                GameVoyage
            </motion.span>
        </motion.h1>

        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 font-light"
        >
            Discover, explore, and chart your adventure across thousands of free-to-play games.
        </motion.p>

        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center lg:items-start lg:justify-start justify-center gap-4"
        >
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    setShowFavorites(false);
                    setActiveSection('explore')
                    setSearchTerm('');        
                    setFilterGenre('all');
                    scrollToGames();
                }}
                className="px-8 py-4 bg-gradient-to-r from-violet-500 to-violet-500 rounded-full font-medium text-lg hover:shadow-2xl hover:shadow-violet-500/50 transition-all"
            >
                Start Your Voyage
            </motion.button>                             
        </motion.div>
    </div>

    {/* Right: 3D Model */}
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -20, 0] 
        }}
        transition={{ 
            opacity: { duration: 1, delay: 0.5 },
            scale: { duration: 1, delay: 0.5 },
            y: { 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1.5 
            }
        }}
        className="w-full max-w-md lg:w-[800px] h-[1000px] lg:h-[800px] dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.35)]">
            <model-viewer
                src="Model/arcade-machine.glb"
                alt="3D Arcade Machine"
                auto-rotate
                disable-zoom
                camera-controls={false}
                interaction-prompt="none"
                exposure="1"
                shadow-intensity="1"
                environment-image="neutral"
                loading="eager"
                reveal="auto"
                style={{ 
                    width: '100%', 
                    height: '100%',
                    '--poster-color': 'transparent'
                }}
            />             
        </motion.div>
    </div>

    {/* Scroll Indicator */}
    <motion.div
        initial={{ opacity: 0 }}    
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ 
            opacity: { delay: 1.2, duration: 0.5 }, 
            y: { duration: 2, repeat: Infinity, delay: 1.5 } 
        }}
        className="absolute bottom-20 left-1/2 transform -translate-x-[10px] cursor-pointer" 
        onClick={scrollToGames}
    >
        <ChevronDown className="w-8 h-8 text-gray-500" />
    </motion.div>
</motion.section>
                            
{/* 3D Model Section */}
<motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative flex flex-col lg:flex-row items-center justify-center my-0 gap-8"
>
    {/* First Model */}
    <div className="w-full max-w-sm h-[400px] lg:h-[500px] dark:drop-shadow-[0_0_35px_rgba(255,255,255,0.35)]">
        <model-viewer
        src="/Model/character-female-a.glb"
        alt="Character Employee"
        auto-rotate            
        disable-zoom           
        interaction-prompt="none" 
        shadow-intensity="1"
        camera-controls={false} 
        style={{ width: '100%', height: '100%', '--poster-color': 'transparent' }}
    />
    </div>

    {/* Second Model */}
    <div className="w-full max-w-sm h-[400px] lg:h-[500px] dark:drop-shadow-[0_0_35px_rgba(255,255,255,0.35)]">
        <model-viewer
        src="/Model/character-m.glb"
        alt="Character Gamer"
        auto-rotate
        disable-zoom
        interaction-prompt="none"
        shadow-intensity="1"    
        camera-controls={false}
        style={{ width: '100%', height: '90%', '--poster-color': 'transparent' }}
    />
    </div>
    {/* Model 3 */}
    <div className="w-full max-w-sm h-[400px] lg:h-[500px] dark:drop-shadow-[0_0_35px_rgba(255,255,255,0.35)]">
        <model-viewer
        src="/Model/character-soldier.glb"   
        alt="Character Explorer"
        auto-rotate
        disable-zoom
        interaction-prompt="none"
        shadow-intensity="1"
        camera-controls={false}
        style={{ width: '100%', height: '100%', '--poster-color': 'transparent' }}
        />
    </div>
    </motion.section>

    {/* Games Section */}
    <section id="games-section" key={showFavorites ? 'favorites' : 'all'} className="relative py-20 px-4">
        <div className="container mx-auto max-w-7xl w-full">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mb-20"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent flex-1" />
                    <Sparkles className="w-6 h-6 text-violet-500" />
                    <div className="h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent flex-1" />
                </div>
                
                <h2 className="text-6xl md:text-8xl font-bold text-center mb-6 bg-gradient-to-r from-violet-500 via-green-500 to-violet-500 bg-clip-text text-transparent leading-tight">
                    {showFavorites ? 'Your Epic Collection' : 'Curated Adventures'}
                </h2>
                
                <p className="text-xl md:text-2xl text-center text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
                    {showFavorites 
                        ? 'Every great journey deserves to be remembered. These are your chosen tales.'
                        : 'Discover handpicked experiences that transcend gaming—each one a story waiting to unfold.'}
                </p>
            </motion.div>

            {/* Search & Filter Controls */}
            {!showFavorites && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 space-y-8"
                >
                    {/* Elegant Search */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-violet-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Seek your next adventure..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-16 pr-6 py-6 bg-white/50 dark:bg-white/5 backdrop-blur-xl border-2 border-gray-200 dark:border-white/10 rounded-full text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-violet-500 dark:focus:border-violet-500 transition-all text-lg shadow-lg"
                            />
                        </div>
                    </div>

                    {/* Genre Tags */}
                    <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                        {genres.map((genre, index) => (
                            <motion.button
                                key={genre}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFilterGenre(genre)}
                                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                                    filterGenre === genre
                                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                                }`}
                            >
                                {genre === 'all' ? '✦ All Stories' : genre}
                            </motion.button>
                        ))}
                    </div>

                    {/* Collection Toggle */}
                    {auth.user && (
                        <div className="flex justify-center">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowFavorites(!showFavorites)}
                                className={`px-8 py-4 rounded-full font-medium transition-all flex items-center gap-3 ${
                                    showFavorites
                                        ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-xl shadow-violet-500/30'
                                        : 'bg-white/80 dark:bg-white/5 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-white/10'
                                }`}
                            >
                                <Heart className={`w-5 h-5 ${showFavorites ? 'fill-current' : ''}`} />
                                <span>{showFavorites ? 'Viewing Your Collection' : 'View Collection'}</span>
                                {!showFavorites && <span className="bg-violet-500 text-white px-2.5 py-1 rounded-full text-xs">{favorites.length}</span>}
                            </motion.button>
                        </div>
                    )}
                </motion.div>
            )}

            {/* CONDITIONAL RENDERING: Narrative Layout vs Card Grid */}
            <div className={displayGames.length === 0 ? '' : 'min-h-[600px]'}>
                {showFavorites ? (
                    /* COLLECTION VIEW - SIMPLE CARD GRID */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <AnimatePresence mode="sync">
                            {displayGames.map((game, index) => (
                                <motion.div
                                    key={game.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -50 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 hover:shadow-2xl hover:shadow-violet-500/20 transition-all group"
                                >
                                    {/* Card Image */}
                                    <div className="relative h-64 overflow-hidden cursor-pointer" onClick={() => setSelectedGame(game)}>
                                        <img
                                            src={game.thumbnail}
                                            alt={game.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                        
                                        {/* Favorite Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(game);
                                            }}
                                            className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all"
                                        >
                                            <Heart className="w-5 h-5 fill-white text-white" />
                                        </button>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <span className="inline-block px-3 py-1 bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-full text-xs font-bold uppercase mb-2">
                                                {game.genre}
                                            </span>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                                {game.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                {game.short_description}
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedGame(game)}
                                                className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                                            >
                                                View Details
                                            </button>
                                            <a
                                                href={game.game_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all"
                                            >
                                                Play
                                            </a>
                                        </div>

                                        {/* Notes Section */}
                                        <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                                            {editingNote === game.id ? (
                                                <div className="space-y-3">
                                                    <textarea
                                                        value={noteText}
                                                        onChange={(e) => setNoteText(e.target.value)}
                                                        placeholder="Add your notes..."
                                                        className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                                                        rows="3"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => saveNote(game.id)}
                                                            className="flex-1 px-3 py-2 bg-violet-500 text-white rounded-lg text-sm font-medium hover:bg-violet-600 transition-all"
                                                        >
                                                            Save Note
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingNote(null)}
                                                            className="px-3 py-2 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : notes[game.id] ? (
                                                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 space-y-2">
                                                    <div className="flex items-start justify-between">
                                                        <BookOpen className="w-4 h-4 text-violet-500 mt-1" />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => startEditNote(game.id)}
                                                                className="text-gray-400 hover:text-violet-500 transition-colors"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteNote(game.id)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{notes[game.id]}"</p>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => startEditNote(game.id)}
                                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add Note
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    /* EXPLORE VIEW - NARRATIVE MAGAZINE LAYOUT*/
                    <div className="space-y-32">
                        <AnimatePresence>
                            {displayGames.map((game, index) => {
                                const isEven = index % 2 === 0;
                                const isFeatured = index % 3 === 0;
                                
                                return (
                                    <motion.article
                                        key={game.id}
                                        initial={{ opacity: 0, y: 100 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                        className={`relative ${isFeatured ? 'mb-40' : ''}`}
                                    >
                                        {/* Featured Full-Width Layout */}
                                        {isFeatured ? (
                                                        <div className="relative">
                                                            {/* Large Hero Image */}
                                                            <motion.div 
                                                                className="relative h-[50vh] max-h-[500px] rounded-3xl overflow-hidden group cursor-pointer"
                                                                whileHover={{ scale: 1.01 }}
                                                                transition={{ duration: 0.6 }}
                                                                onClick={() => setSelectedGame(game)}
                                                            >
                                                                <img
                                                                    src={game.thumbnail}
                                                                    alt={game.title}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                                                                
                                                                {/* Content Overlay */}
                                                                <div className="absolute bottom-0 left-0 right-0 p-12">
                                                                    <div className="max-w-4xl">
                                                                        <motion.span 
                                                                            className="inline-block px-4 py-2 bg-violet-500/90 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                                                                            initial={{ opacity: 0, x: -20 }}
                                                                            whileInView={{ opacity: 1, x: 0 }}
                                                                            transition={{ delay: 0.3 }}
                                                                        >
                                                                            Featured • {game.genre}
                                                                        </motion.span>
                                                                        
                                                                        <motion.h3 
                                                                            className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight"
                                                                            initial={{ opacity: 0, y: 30 }}
                                                                            whileInView={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: 0.4 }}
                                                                        >
                                                                            {game.title}
                                                                        </motion.h3>
                                                                        
                                                                        <motion.p 
                                                                            className="text-xl text-gray-200 leading-relaxed mb-8 max-w-2xl"
                                                                            initial={{ opacity: 0 }}
                                                                            whileInView={{ opacity: 1 }}
                                                                            transition={{ delay: 0.5 }}
                                                                        >
                                                                            {game.short_description}
                                                                        </motion.p>
                                                                        
                                                                        <motion.div 
                                                                            className="flex items-center gap-6"
                                                                            initial={{ opacity: 0, y: 20 }}
                                                                            whileInView={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: 0.6 }}
                                                                        >
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setSelectedGame(game);
                                                                                }}
                                                                                className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-100 transition-all"
                                                                            >
                                                                                Explore Story
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    toggleFavorite(game);
                                                                                }}
                                                                                className="p-4 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all"
                                                                            >
                                                                                <Heart className={`w-6 h-6 ${favorites.includes(game.id) ? 'fill-white text-white' : 'text-white'}`} />
                                                                            </button>
                                                                        </motion.div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        </div>
                                                    ) : (
                                                        /* Two-Column Editorial Layout */
                                                        <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
                                                            {/* Image Side */}
                                                            <motion.div 
                                                                className="w-full lg:w-1/2 relative group cursor-pointer"
                                                                whileHover={{ scale: 1.02 }}
                                                                transition={{ duration: 0.4 }}
                                                                onClick={() => setSelectedGame(game)}
                                                            >
                                                                <div className="relative h-[350px] rounded-3xl overflow-hidden">
                                                                    <img
                                                                        src={game.thumbnail}
                                                                        alt={game.title}
                                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                    />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                                                    
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            toggleFavorite(game);
                                                                        }}
                                                                        className="absolute top-6 right-6 p-3 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-all"
                                                                    >
                                                                        <Heart className={`w-5 h-5 ${favorites.includes(game.id) ? 'fill-white text-white' : 'text-white'}`} />
                                                                    </button>
                                                                </div>
                                                            </motion.div>

                                                            {/* Content Side */}
                                                            <div className="w-full lg:w-1/2 space-y-6">
                                                                <motion.div
                                                                    initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                                                                    whileInView={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.3 }}
                                                                >
                                                                    <span className="inline-block px-4 py-2 bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                                                                        {game.genre}
                                                                    </span>
                                                                    
                                                                    <h3 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
                                                                        {game.title}
                                                                    </h3>
                                                        
                                                                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                                                        {game.short_description}
                                                                    </p>

                                                                    {/* Metadata */}
                                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-500 mb-8">
                                                                        <span className="flex items-center gap-2">
                                                                            <Gamepad2 className="w-4 h-4" />
                                                                            {game.platform}
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span>{game.publisher}</span>
                                                                    </div>

                                                                    {/* Actions */}
                                                                    <div className="flex gap-4">
                                                                        <button
                                                                            onClick={() => setSelectedGame(game)}
                                                                            className="px-8 py-4 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-full font-medium hover:shadow-xl hover:shadow-violet-500/30 transition-all"
                                                                        >
                                                                            Begin Journey
                                                                        </button>
                                                                    </div>

                                                                    {/* Notes Section (for favorites) */}
                                                                    {favorites.includes(game.id) && auth.user && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, height: 0 }}
                                                                            animate={{ opacity: 1, height: 'auto' }}
                                                                            className="pt-6 mt-6 border-t border-gray-200 dark:border-white/10"
                                                                        >
                                                                            {editingNote === game.id ? (
                                                                                <div className="space-y-3">
                                                                                    <textarea
                                                                                        value={noteText}
                                                                                        onChange={(e) => setNoteText(e.target.value)}
                                                                                        placeholder="Chronicle your experience..."
                                                                                        className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                                                                                        rows="4"
                                                                                        autoFocus
                                                                                    />
                                                                                    <div className="flex gap-2">
                                                                                        <button
                                                                                            onClick={() => saveNote(game.id)}
                                                                                            className="flex-1 px-4 py-2 bg-violet-500 text-white rounded-xl font-medium hover:bg-violet-600 transition-all"
                                                                                        >
                                                                                            Save
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => setEditingNote(null)}
                                                                                            className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                                                                                        >
                                                                                            Cancel
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            ) : notes[game.id] ? (
                                                                                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 space-y-3 border border-gray-200 dark:border-white/10">
                                                                                    <div className="flex items-start justify-between">
                                                                                        <BookOpen className="w-5 h-5 text-violet-500" />
                                                                                        <div className="flex gap-2">
                                                                                            <button
                                                                                                onClick={() => startEditNote(game.id)}
                                                                                                className="text-gray-400 hover:text-violet-500 transition-colors"
                                                                                            >
                                                                                                <Edit2 className="w-4 h-4" />
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => deleteNote(game.id)}
                                                                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                                                            >
                                                                                                <Trash2 className="w-4 h-4" />
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{notes[game.id]}"</p>
                                                                                </div>
                                                                            ) : (
                                                                                <button
                                                                                    onClick={() => startEditNote(game.id)}
                                                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400"
                                                                                >
                                                                                    <Plus className="w-4 h-4" />
                                                                                    Add Note
                                                                                </button>
                                                                            )}
                                                                        </motion.div>
                                                                    )}
                                                                </motion.div>
                                                            </div>
                                                        </div>
                                                    )}
                                    </motion.article>
                                );
                            })}``
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {displayGames.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-32"
                >
                    <Gamepad2 className="w-24 h-24 text-gray-300 dark:text-gray-700 mx-auto mb-6 opacity-50" />
                    <h3 className="text-3xl font-bold text-gray-700 dark:text-gray-400 mb-3">
                        {showFavorites ? 'No Favorites Yet' : 'No Adventures Found'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 text-lg">
                        {showFavorites 
                            ? 'Start adding games to your collection to see them here.'
                            : 'Your story awaits in another realm. Try adjusting your search.'}
                    </p>
                </motion.div>
            )}
        </div>
    </section>
                    
    {/* Game Detail Modal */}
    <AnimatePresence>
    {selectedGame && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 dark:bg-black/90 backdrop-blur-xl"
            onClick={() => setSelectedGame(null)}
        >
            <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gradient-to-br dark:from-gray-900/95 dark:to-black/95 backdrop-blur-2xl rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10 shadow-2xl"
            >
            {/* Modal Header Image */}
            <div className="relative h-80 md:h-96 overflow-hidden">
                <img src={selectedGame.thumbnail}
                    alt={selectedGame.title}
                    className="w-full h-full object-cover"
                />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                                        
            {/* Close Button */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedGame(null)}
                className="absolute top-6 right-6 p-3 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-black/70 transition-all border border-gray-200 dark:border-white/20"
            >
            <X className="w-6 h-6" />
            </motion.button>

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-end justify-between"
                >
                <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-3 text-white">{selectedGame.title}</h2>
                <div className="flex gap-3">
                    <span className="px-4 py-2 bg-purple-500/80 backdrop-blur-sm rounded-full text-sm font-bold">
                                                            {selectedGame.genre}
                                                        </span>
                                                        <span className="px-4 py-2 bg-violet-500/80 backdrop-blur-sm rounded-full text-sm font-bold">
                                                            {selectedGame.platform}
                                                        </span>
                                                    </div>
                                                </div>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(selectedGame);
                                                    }}
                                                    className="p-4 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all border border-white/20"
                                                >
                                                    <Heart className={`w-7 h-7 ${favorites.includes(selectedGame.id) ? 'fill-violet-500 text-violet-500' : ''}`} />
                                                </motion.button>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Modal Content */}
                                    <div className="p-8 space-y-8">
                                        <motion.p
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed"
                                        >
                                            {selectedGame.short_description}
                                        </motion.p>

                                        {/* Game Details Grid */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                            <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/10">
                                                <p className="text-gray-500 text-sm mb-2 uppercase tracking-wider">Publisher</p>
                                                <p className="text-xl font-semibold text-gray-900 dark:text-white">{selectedGame.publisher}</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/10">
                                                <p className="text-gray-500 text-sm mb-2 uppercase tracking-wider">Developer</p>
                                                <p className="text-xl font-semibold text-gray-900 dark:text-white">{selectedGame.developer}</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/10">
                                                <p className="text-gray-500 text-sm mb-2 uppercase tracking-wider">Release Date</p>
                                                <p className="text-xl font-semibold text-gray-900 dark:text-white">{selectedGame.release_date}</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/10">
                                                <p className="text-gray-500 text-sm mb-2 uppercase tracking-wider">Platform</p>
                                                <p className="text-xl font-semibold text-gray-900 dark:text-white">{selectedGame.platform}</p>
                                            </div>
                                        </motion.div>

                                        {/* Play Button */}
                                        <motion.a
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            href={selectedGame.game_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full px-10 py-6 bg-gradient-to-r from-green-500 to-green-500 hover:from-green-600 hover:to-green-600 rounded-2xl font-bold text-xl text-center transition-all shadow-2xl shadow-green-500/30"
                                        >
                                            Play Now →
                                        </motion.a>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                        {/* Footer */}
                        <footer className="relative py-12 border-t border-gray-200 dark:border-white/5 w-full">
                            <div className="container mx-auto px-4 lg:px-8 max-w-7xl w-full">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    className="text-center"
                                >
                                    <div className="flex items-center justify-center gap-3 mb-4">

                                        <span className="text-xl font-bold bg-gradient-to-r from-violet-500 to-green-500 bg-clip-text text-transparent">
                                            GameVoyage
                                        </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-500 text-sm">
                                        Your journey through the gaming universe
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-600 text-xs mt-4">
                                        © 2025 GameVoyage. All rights reserved.
                                    </p>
                                </motion.div>
                            </div>
                        </footer>
                        {/* Auth Modal */}
                        <AuthModal 
                            show={showAuthModal} 
                            onClose={() => setShowAuthModal(false)}
                            initialMode={authMode}
                        />
                        </div>
                    </motion.div>
                )}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.1; }
                    50% { opacity: 0.2; }
                }
            `}</style>
        </>
    );
}