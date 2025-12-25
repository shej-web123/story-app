import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Users, BookOpen, Star, TrendingUp, Activity, BarChart2 } from 'lucide-react';

const Analytics = () => {
    const [stats, setStats] = useState({
        userGrowth: [],
        topStories: [],
        categoryData: [],
        topUsers: []
    });
    const [loading, setLoading] = useState(true);

    const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#3b82f6'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, storiesRes, categoriesRes, commentsRes] = await Promise.all([
                api.get('/users'),
                api.get('/stories'),
                api.get('/categories'),
                api.get('/comments')
            ]);

            const users = usersRes.data;
            const stories = storiesRes.data;
            const categories = categoriesRes.data;
            const comments = commentsRes.data;

            // 1. Process User Growth (Mocking daily growth from joinDate)
            const growthData = processUserGrowth(users);

            // 2. Top Stories by Views
            const topStoriesData = stories
                .sort((a, b) => b.viewCount - a.viewCount)
                .slice(0, 5)
                .map(s => ({
                    name: s.title.length > 20 ? s.title.substring(0, 20) + '...' : s.title,
                    views: s.viewCount,
                    fullTitle: s.title
                }));

            // 3. Category Distribution
            const categoryCount = {};
            stories.forEach(s => {
                const cat = categories.find(c => c.id === s.categoryId);
                if (cat) {
                    categoryCount[cat.name] = (categoryCount[cat.name] || 0) + 1;
                }
            });
            const categoryChartData = Object.keys(categoryCount).map(key => ({
                name: key,
                value: categoryCount[key]
            }));

            // 4. Top Active Users (by comments)
            const userCommentCount = {};
            comments.forEach(c => {
                userCommentCount[c.userId] = (userCommentCount[c.userId] || 0) + 1;
            });
            const topActiveUsers = Object.keys(userCommentCount)
                .map(uid => {
                    const user = users.find(u => u.id === Number(uid));
                    return user ? { ...user, commentCount: userCommentCount[uid] } : null;
                })
                .filter(Boolean)
                .sort((a, b) => b.commentCount - a.commentCount)
                .slice(0, 5);


            setStats({
                userGrowth: growthData,
                topStories: topStoriesData,
                categoryData: categoryChartData,
                topUsers: topActiveUsers
            });
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch analytics data", error);
            setLoading(false);
        }
    };

    const processUserGrowth = (users) => {
        // Simple aggregation by month/year or just sorting by date for the cumulative chart
        // Since mock data dates might be sparse, we'll sort and accumulating.
        const sortedUsers = [...users].sort((a, b) => new Date(a.joinDate) - new Date(b.joinDate));

        let cumulative = 0;
        return sortedUsers.map(u => {
            cumulative += 1;
            return {
                date: new Date(u.joinDate).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
                users: cumulative
            };
        });
    };

    if (loading) return <div className="p-8 text-center">Đang tải dữ liệu phân tích...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                        <Activity className="text-indigo-600" />
                        Phân Tích & Thống Kê
                    </h1>
                    <p className="text-gray-500 mt-1">Tổng quan chi tiết về hoạt động của hệ thống</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                        <BarChart2 size={16} /> Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Top Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Growth Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <Users className="text-indigo-500" size={20} />
                        Tăng trưởng người dùng
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.userGrowth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    name="Tổng thành viên"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Stories Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <TrendingUp className="text-pink-500" size={20} />
                        Truyện xem nhiều nhất
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.topStories} layout="vertical" barSize={20}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12, fill: '#4b5563' }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 text-sm">
                                                    <p className="font-bold mb-1">{payload[0].payload.fullTitle}</p>
                                                    <p className="text-indigo-600 font-semibold">{payload[0].value.toLocaleString()} lượt xem</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="views" fill="#ec4899" radius={[0, 4, 4, 0]}>
                                    {stats.topStories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Category Distribution */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <BookOpen className="text-orange-500" size={20} />
                        Phân bố thể loại
                    </h3>
                    <div className="h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Active Users Table */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <Star className="text-yellow-500" size={20} />
                        Thành viên tích cực
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase font-medium">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Thành viên</th>
                                    <th className="px-4 py-3">Vai trò</th>
                                    <th className="px-4 py-3">Bình luận</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Ngày tham gia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {stats.topUsers.map((user, index) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-4 py-4 flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-100 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}`}>
                                                {index + 1}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 dark:text-gray-200">{user.name}</p>
                                                    <p className="text-xs text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 font-bold text-gray-700 dark:text-gray-300">
                                            {user.commentCount}
                                        </td>
                                        <td className="px-4 py-4 text-right text-gray-500">
                                            {new Date(user.joinDate).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
