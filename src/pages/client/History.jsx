import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Clock, Trash2, ArrowRight, BookOpen } from 'lucide-react';

const History = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, [user]);

    const fetchHistory = async () => {
        setLoading(true);
        if (user) {
            // Fetch from DB
            try {
                const res = await api.get(`/reading_history?userId=${user.id}&_sort=lastReadAt&_order=desc`);
                setHistory(res.data);
            } catch (error) {
                console.error("Failed to fetch history", error);
            }
        } else {
            // Fetch from LocalStorage
            const localHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]');
            setHistory(localHistory);
        }
        setLoading(false);
    };

    const clearHistory = async () => {
        if (!confirm('Bạn có chắc muốn xóa toàn bộ lịch sử đọc?')) return;

        if (user) {
            try {
                // Delete one by one (json-server limit) or assume a clear endpoint
                // For simplicity, we'll just clear local state and user would need a specialized endpoint for bulk delete normally
                // Here we iterate
                await Promise.all(history.map(item => api.delete(`/reading_history/${item.id}`)));
                setHistory([]);
            } catch (error) {
                console.error("Failed to clear history", error);
            }
        } else {
            localStorage.removeItem('readingHistory');
            setHistory([]);
        }
    };

    if (loading) return <div className="text-center py-20">Đang tải...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
                        <Clock size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Lịch sử đọc truyện</h1>
                </div>
                {history.length > 0 && (
                    <button
                        onClick={clearHistory}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} /> Xóa lịch sử
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <BookOpen size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Chưa có lịch sử đọc</h3>
                    <p className="text-gray-500 mb-6">Hãy bắt đầu đọc truyện để lưu lại dấu ấn nhé!</p>
                    <Link to="/" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                        Khám phá ngay
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {history.map((item) => (
                        <div key={item.id || item.storyId} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex gap-4">
                            <Link to={`/story/${item.storyId || item.id}`} className="flex-shrink-0 w-20 h-28 bg-gray-200 rounded-lg overflow-hidden">
                                <img
                                    src={item.storyCover || item.coverUrl}
                                    alt={item.storyTitle || item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                                />
                            </Link>

                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <Link to={`/story/${item.storyId || item.id}`} className="text-lg font-bold text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1">
                                        {item.storyTitle || item.title}
                                    </Link>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <Clock size={14} className="mr-1" />
                                        Đọc lần cuối: {new Date(item.lastReadAt).toLocaleString('vi-VN')}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                        Đang đọc: {item.chapterTitle || item.lastReadChapterTitle || 'Chương ?'}
                                    </span>
                                    <Link
                                        to={`/story/${item.storyId || item.id}/chapter/${item.chapterId || item.lastReadChapterId}`}
                                        className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                    >
                                        Đọc tiếp <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
