import { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen, Users, FolderTree, TrendingUp, Eye, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendDown }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {trend && (
                <span className={`inline-flex items-center text-xs font-medium mt-2 ${trendDown ? 'text-red-600' : 'text-green-600'}`}>
                    <TrendingUp size={12} className={`mr-1 ${trendDown ? 'rotate-180' : ''}`} />
                    {trend}
                </span>
            )}
        </div>
        <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
            <Icon size={20} />
        </div>
    </div>
);

const CategoryChart = ({ data }) => {
    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
            <h3 className="text-base font-bold text-gray-900 mb-6">Thống kê danh mục</h3>
            <div className="space-y-4">
                {data.map((item) => (
                    <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">{item.name}</span>
                            <span className="text-gray-500">{item.count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${(item.count / maxCount) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
                {data.length === 0 && (
                    <p className="text-center text-gray-400 py-4 text-sm">Chưa có dữ liệu</p>
                )}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [stats, setStats] = useState({ stories: 0, users: 0, categories: 0, views: 0, pendingReports: 0 });
    const [recentStories, setRecentStories] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [storiesRes, usersRes, categoriesRes, reportsRes] = await Promise.all([
                    api.get('/stories'),
                    api.get('/users'),
                    api.get('/categories'),
                    api.get('/reports?status=pending')
                ]);

                // Calculate Category Stats
                const stories = storiesRes.data;
                const categories = categoriesRes.data;

                const catCounts = {};
                stories.forEach(story => {
                    const catId = story.categoryId;
                    if (catId) {
                        const cat = categories.find(c => c.id == catId);
                        if (cat) {
                            catCounts[cat.name] = (catCounts[cat.name] || 0) + 1;
                        }
                    }
                });

                const chartData = Object.entries(catCounts)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count);

                setCategoryStats(chartData);

                // Calculate Real Stats
                const totalViews = stories.reduce((sum, story) => sum + (story.viewCount || 0), 0);
                const pendingReports = reportsRes.data.length;

                // Top Stories
                const top = [...stories].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5);
                setRecentStories(top);

                setStats({
                    stories: stories.length,
                    users: usersRes.data.length,
                    categories: categories.length,
                    views: totalViews,
                    pendingReports: pendingReports
                });
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Tổng quan</h2>
                    <p className="text-gray-500 text-sm mt-1">Hoạt động hệ thống</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Tổng Truyện"
                    value={stats.stories}
                    icon={BookOpen}
                    trend="+12% tháng này"
                />
                <StatCard
                    title="Người Dùng"
                    value={stats.users}
                    icon={Users}
                    trend="+5% tuần này"
                />
                <StatCard
                    title="Lượt Xem"
                    value={stats.views.toLocaleString()}
                    icon={Eye}
                    trend="+18% hôm nay"
                />
                <StatCard
                    title="Báo Cáo Chờ"
                    value={stats.pendingReports}
                    icon={AlertCircle}
                    trend={stats.pendingReports > 0 ? "Cần xử lý ngay" : "Tốt"}
                    trendDown={stats.pendingReports > 0}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-base font-bold text-gray-900">Top Truyện Nổi Bật</h3>
                        <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Xem tất cả</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-3">Tên truyện</th>
                                    <th className="px-6 py-3">Tác giả</th>
                                    <th className="px-6 py-3 text-right">Views</th>
                                    <th className="px-6 py-3 text-right">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentStories.map((story) => (
                                    <tr key={story.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-10 bg-gray-200 rounded object-cover overflow-hidden shrink-0">
                                                    <img src={story.coverUrl} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <span className="font-medium text-gray-900 text-sm line-clamp-1">{story.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{story.author}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium text-right">{(story.viewCount || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${story.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {story.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <CategoryChart data={categoryStats} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
