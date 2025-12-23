import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { Menu, X, Home, BookOpen, Clock, User, LogOut, Moon, Sun, LayoutDashboard, TrendingUp, Smile, Zap, Heart, Ghost, CloudRain, Book, PenTool, List, Globe, Bell } from 'lucide-react';
import api from '../services/api';

const ClientLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [trendingStories, setTrendingStories] = useState([]);
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' ||
                (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    useEffect(() => {
        fetchCategories();
        fetchTrendingStories();
        fetchTrendingStories();
    }, []);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll for notifications every 30s
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user]);

    // Close sidebar on route change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch categories");
        }
    };

    const fetchTrendingStories = async () => {
        try {
            // Fetch random or top stories. For now, just taking the first 5.
            // In a real app, we would sort by views: /stories?_sort=views&_order=desc&_limit=5
            const res = await api.get('/stories?_limit=5');
            setTrendingStories(res.data);
        } catch (error) {
            console.error("Failed to fetch trending stories");
        }
    };

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await api.get(`/notifications?userId=${user.id}&_sort=createdAt&_order=desc`);
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            try {
                await api.patch(`/notifications/${notif.id}`, { isRead: true });
                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error("Failed to mark notification as read");
            }
        }
        setShowNotifications(false);
    };

    const toggleTheme = () => setIsDark(!isDark);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                            <Book className="w-8 h-8" />
                            StoryApp
                        </Link>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-8">
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Menu Chính</h3>
                            <nav className="space-y-2">
                                <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors font-medium">
                                    <Home size={20} /> Trang chủ
                                </Link>
                                <Link to="/library" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors font-medium">
                                    <Book size={20} /> Tủ sách cá nhân
                                </Link>
                                <Link to="/external-library" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors font-medium">
                                    <Globe size={20} /> Kho sách Online
                                </Link>
                                <Link to="/write" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors font-medium">
                                    <PenTool size={20} /> Viết truyện
                                </Link>
                                <Link to="/history" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors font-medium">
                                    <Clock size={20} /> Lịch sử đọc
                                </Link>
                                {user && user.role === 'admin' && (
                                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl transition-colors font-medium">
                                        <LayoutDashboard size={20} /> Admin Dashboard
                                    </Link>
                                )}
                            </nav>
                        </section>

                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Danh mục</h3>
                            <nav className="space-y-1">
                                {categories.map(cat => (
                                    <Link
                                        key={cat.id}
                                        to={`/?category=${cat.id}`}
                                        className="flex items-center gap-3 px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors text-sm"
                                    >
                                        <List size={16} /> {cat.name}
                                    </Link>
                                ))}
                            </nav>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Tâm trạng</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <Link to="/?category=4" className="flex items-center gap-2 p-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-gray-600 dark:text-gray-300 hover:text-yellow-600 transition-colors">
                                    <Smile size={18} /> <span className="text-sm">Vui vẻ</span>
                                </Link>
                                <Link to="/?category=5" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 transition-colors">
                                    <Ghost size={18} /> <span className="text-sm">Sợ hãi</span>
                                </Link>
                                <Link to="/?category=6" className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
                                    <CloudRain size={18} /> <span className="text-sm">Buồn</span>
                                </Link>
                                <Link to="/?category=2" className="flex items-center gap-2 p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 text-gray-600 dark:text-gray-300 hover:text-pink-600 transition-colors">
                                    <Heart size={18} /> <span className="text-sm">Yêu đời</span>
                                </Link>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Thịnh hành</h3>
                            <div className="space-y-4">
                                {/* Mock Trending Items */}
                                {trendingStories.map((story, index) => (
                                    <Link key={story.id} to={`/story/${story.id}`} className="flex gap-3 group cursor-pointer">
                                        <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0 overflow-hidden">
                                            <img src={story.coverUrl} className="w-full h-full object-cover" alt={story.title} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{story.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><TrendingUp size={12} /> Top {index + 1}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </aside>

            <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30 transition-colors duration-300">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                            <Book className="w-8 h-8" />
                            <span className="hidden sm:inline">StoryApp</span>
                        </Link>
                    </div>

                    <nav className="flex items-center gap-2 sm:gap-4">
                        <Link to="/" className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Trang chủ</Link>
                        <Link to="/write" className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Viết truyện</Link>

                        {/* Notifications */}
                        {user && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors relative"
                                    title="Thông báo"
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-fade-in-up">
                                        <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                                            <h3 className="font-bold text-gray-800 dark:text-gray-200">Thông báo</h3>
                                            {unreadCount > 0 && <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{unreadCount} chưa đọc</span>}
                                        </div>
                                        <div className="max-h-[60vh] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                    <p className="text-sm">Không có thông báo nào</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                                    {notifications.map(notif => (
                                                        <Link
                                                            key={notif.id}
                                                            to={notif.link}
                                                            onClick={() => handleNotificationClick(notif)}
                                                            className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notif.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notif.isRead ? 'bg-indigo-600' : 'bg-transparent'}`}></div>
                                                                <div>
                                                                    <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{notif.message}</p>
                                                                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString('vi-VN')}</p>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                            title={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-2 sm:gap-4">
                                <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                    <span>Hi, {user.name}</span>
                                </div>

                                <div className="flex items-center gap-1 sm:gap-2">
                                    <Link
                                        to="/library"
                                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Tủ sách cá nhân"
                                    >
                                        <Book size={20} />
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Hồ sơ cá nhân"
                                    >
                                        <User size={20} />
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link
                                            to="/admin"
                                            className="hidden sm:block px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                                        >
                                            Admin
                                        </Link>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Đăng xuất"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Link to="/login" className="px-3 sm:px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg font-medium transition-colors text-sm sm:text-base">Đăng nhập</Link>
                                <Link to="/register" className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 text-sm sm:text-base">Đăng ký</Link>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
                <Outlet />
            </main>

            <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 py-8 mt-auto transition-colors duration-300">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-500 dark:text-gray-400">&copy; 2024 StoryApp. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default ClientLayout;
