import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Trash2, Clock, History } from 'lucide-react';
import api from '../../services/api';

const Library = () => {
    const [activeTab, setActiveTab] = useState('saved'); // 'saved' | 'history'
    const [savedStories, setSavedStories] = useState([]);
    const [historyStories, setHistoryStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLibrary();
        fetchHistory();
    }, []);

    const fetchLibrary = async () => {
        try {
            // Mock API fetch
            const res = await api.get('/stories?_limit=3');
            setSavedStories(res.data);
        } catch (error) {
            console.error("Failed to fetch library", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = () => {
        const history = JSON.parse(localStorage.getItem('readingHistory') || '[]');
        setHistoryStories(history);
    };

    const removeFromLibrary = (e, id) => {
        e.preventDefault();
        if (window.confirm('Bạn có chắc muốn xóa truyện này khỏi tủ sách?')) {
            setSavedStories(savedStories.filter(story => story.id !== id));
        }
    };

    const clearHistory = () => {
        if (window.confirm('Xóa toàn bộ lịch sử đọc?')) {
            localStorage.removeItem('readingHistory');
            setHistoryStories([]);
        }
    };

    if (loading) return <div className="text-center py-12 dark:text-white">Đang tải tủ sách...</div>;

    const storiesToDisplay = activeTab === 'saved' ? savedStories : historyStories;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                        <BookOpen size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tủ sách cá nhân</h1>
                        <p className="text-gray-500 dark:text-gray-400">Quản lý truyện yêu thích và lịch sử đọc</p>
                    </div>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'saved'
                                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Đã lưu
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'history'
                                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Lịch sử
                    </button>
                </div>
            </div>

            {activeTab === 'history' && historyStories.length > 0 && (
                <div className="flex justify-end">
                    <button
                        onClick={clearHistory}
                        className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                    >
                        <Trash2 size={16} /> Xóa lịch sử
                    </button>
                </div>
            )}

            {storiesToDisplay.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {storiesToDisplay.map((story) => (
                        <Link
                            key={story.id}
                            to={`/story/${story.id}`}
                            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex transition-all hover:-translate-y-1"
                        >
                            <div className="w-1/3 relative">
                                <img
                                    src={story.coverUrl}
                                    alt={story.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                            </div>
                            <div className="w-2/3 p-5 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {story.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{story.author}</p>
                                    {activeTab === 'saved' && (
                                        <>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
                                                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${Math.floor(Math.random() * 100)}%` }}></div>
                                            </div>
                                            <p className="text-xs text-gray-400">Đã đọc {Math.floor(Math.random() * 100)}%</p>
                                        </>
                                    )}
                                    {activeTab === 'history' && (
                                        <p className="text-xs text-indigo-500 flex items-center gap-1">
                                            <Clock size={12} /> Vừa đọc xong
                                        </p>
                                    )}
                                </div>
                                {activeTab === 'saved' && (
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={(e) => removeFromLibrary(e, story.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Xóa khỏi tủ sách"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                    {activeTab === 'saved' ? (
                        <BookOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    ) : (
                        <History size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    )}
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                        {activeTab === 'saved' ? 'Tủ sách trống' : 'Lịch sử trống'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {activeTab === 'saved' ? 'Bạn chưa lưu truyện nào vào tủ sách.' : 'Bạn chưa đọc truyện nào gần đây.'}
                    </p>
                    <Link to="/" className="btn btn-primary px-6 py-2.5">Khám phá ngay</Link>
                </div>
            )}
        </div>
    );
};

export default Library;
