import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, BookOpen, Users, FolderTree, LogOut, Home, Bell, Search, Menu } from 'lucide-react';
import clsx from 'clsx';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (!user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    const navItems = [
        { path: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
        { path: '/admin/stories', label: 'Quản lý Truyện', icon: BookOpen },
        { path: '/admin/categories', label: 'Quản lý Danh mục', icon: FolderTree },
        { path: '/admin/users', label: 'Quản lý Tài khoản', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-white shadow-xl flex flex-col fixed h-full z-20 transition-all duration-300">
                <div className="h-20 flex items-center px-8 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
                            S
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            StoryAdmin
                        </h1>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu chính</div>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-indigo-50 text-indigo-600 font-semibold shadow-sm"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
                                )}
                            >
                                <Icon size={20} className={clsx("transition-colors", isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-600")} />
                                <span>{item.label}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"></div>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Link to="/" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all">
                            <Home size={18} />
                            <span>Về trang chủ</span>
                        </Link>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <LogOut size={18} />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72">
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            {navItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm nhanh..."
                                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
                            />
                        </div>

                        <button className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-gray-100">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                <div className="p-8 animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
