import { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen, Users, FolderTree, TrendingUp, Clock, Star, ArrowUpRight, Eye, BarChart2 } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color} text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} />
            </div>
            {trend && (
                <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <TrendingUp size={12} className="mr-1" /> {trend}
                </span>
            )}
        </div>
        <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
        </div>
    </div>
);

const CategoryChart = ({ data }) => {
    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <BarChart2 size={20} className="text-indigo-600" />
                    Thống kê theo danh mục
                </h3>
            </div>
            <div className="space-y-4">
                {data.map((item) => (
                    <div key={item.name} className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-gray-700">{item.name}</span>
                            <span className="text-gray-500">{item.count} truyện</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${(item.count / maxCount) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
                {data.length === 0 && (
                    <p className="text-center text-gray-400 py-4">Chưa có dữ liệu danh mục</p>
                )}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [stats, setStats] = useState({ stories: 0, users: 0, categories: 0, views: 0 });
    const [recentStories, setRecentStories] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [storiesRes, usersRes, categoriesRes] = await Promise.all([
                    api.get('/stories'),
                    api.get('/users'),
                    api.get('/categories')
                ]);

                // Calculate Category Stats
                const stories = storiesRes.data;
                const categories = categoriesRes.data;

                const catCounts = {};
                stories.forEach(story => {
                    // Handle both single categoryId and potential array (just in case)
                    const catId = story.categoryId;
                    if (catId) {
                        const cat = categories.find(c => c.id == catId); // Loose equality for string/number mismatch
                        if (cat) {
                            catCounts[cat.name] = (catCounts[cat.name] || 0) + 1;
                        }
                    }
                });

                const chartData = Object.entries(catCounts)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count);

                setCategoryStats(chartData);

                // Mock Total Views (since API doesn't have it yet, we estimate)
                const estimatedViews = stories.length * 125 + usersRes.data.length * 45;

                setStats({
                    stories: stories.length,
                    users: usersRes.data.length,
                    categories: categories.length,
                    views: estimatedViews
                });

                // Get 5 most recent stories (assuming higher ID = newer)
                const sortedStories = [...stories].sort((a, b) => b.id - a.id).slice(0, 5);
                setRecentStories(sortedStories);

            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Tổng số truyện"
                    value={stats.stories}
                    icon={BookOpen}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                    trend="+12% tháng này"
                />
                <StatCard
                    title="Tổng số danh mục"
                    value={stats.categories}
                    icon={FolderTree}
                    color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                    trend="+2 mới"
                />
                <StatCard
                    title="Tổng số người dùng"
                    value={stats.users}
                    icon={Users}
                    color="bg-gradient-to-br from-violet-500 to-violet-600"
                    trend="+24% tháng này"
                />
                <StatCard
                    title="Tổng lượt xem"
                    value={stats.views.toLocaleString()}
                    icon={Eye}
                    color="bg-gradient-to-br from-orange-500 to-orange-600"
                    trend="+1.2k hôm nay"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area - 2/3 width */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Clock size={20} className="text-indigo-600" />
                                Truyện mới cập nhật
                            </h3>
                            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                                Xem tất cả <ArrowUpRight size={16} />
                            </button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recentStories.map((story) => (
                                <div key={story.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                    <img
                                        src={story.coverUrl}
                                        alt={story.title}
                                        className="w-12 h-16 object-cover rounded-lg shadow-sm"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate">{story.title}</h4>
                                        <p className="text-sm text-gray-500">{story.author}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${story.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                            {story.status}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">Vừa xong</p>
                                    </div>
                                </div>
                            ))}
                            {recentStories.length === 0 && (
                                <div className="p-8 text-center text-gray-500">Chưa có dữ liệu</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Area - 1/3 width */}
                <div className="space-y-8">
                    {/* Category Chart */}
                    <CategoryChart data={categoryStats} />

                    {/* Quick Actions / Tips */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/30">
                        <h3 className="text-xl font-bold mb-2">Nâng cấp Pro?</h3>
                        <p className="text-indigo-100 mb-6 text-sm leading-relaxed">
                            Mở khóa các tính năng quản lý nâng cao, thống kê chi tiết và hỗ trợ ưu tiên 24/7.
                        </p>
                        <button className="w-full bg-white text-indigo-600 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-sm">
                            Tìm hiểu thêm
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Star size={18} className="text-yellow-500" />
                            Top Tác giả
                        </h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-600">
                                        #{i}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900">Nguyễn Văn A</p>
                                        <p className="text-xs text-gray-500">12 truyện</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
