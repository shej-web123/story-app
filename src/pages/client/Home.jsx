import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Shuffle, Smile, Zap, Heart, Moon, Globe, Image as ImageIcon, Ghost, CloudRain } from 'lucide-react';
import axios from 'axios';
import ComicDetailModal from '../../components/ComicDetailModal';

const Home = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [stories, setStories] = useState([]);
    const [categories, setCategories] = useState([]);

    // Derived state from URL
    const selectedCategory = searchParams.get('category') ? Number(searchParams.get('category')) : null;

    const [search, setSearch] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [featuredStories, setFeaturedStories] = useState([]);
    const [readingHistory, setReadingHistory] = useState([]);

    // Online Search State
    const [onlineStories, setOnlineStories] = useState([]);
    const [homeOnlineStories, setHomeOnlineStories] = useState([]);
    const [selectedOnlineStory, setSelectedOnlineStory] = useState(null);
    const IMAGE_CDN = 'https://otruyenapi.com/uploads/comics';

    useEffect(() => {
        fetchCategories();
        fetchStories();
        fetchHomeOnlineStories();
        const history = JSON.parse(localStorage.getItem('readingHistory') || '[]');
        setReadingHistory(history);
    }, []);

    useEffect(() => {
        fetchStories();
        if (search) {
            searchOnlineStories(search);
        } else {
            setOnlineStories([]);
        }
    }, [selectedCategory, search]);

    // Auto-play slider
    useEffect(() => {
        if (featuredStories.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % featuredStories.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [featuredStories]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const fetchStories = async () => {
        try {
            let url = '/stories';
            const params = [];
            if (selectedCategory) params.push(`categoryId=${selectedCategory}`);
            if (search) params.push(`q=${search}`);

            if (params.length > 0) {
                url += `?${params.join('&')}`;
            }

            const res = await api.get(url);
            setStories(res.data);

            // Set featured stories (just taking first 3 for demo)
            if (!selectedCategory && !search && res.data.length > 0) {
                setFeaturedStories(res.data.slice(0, 3));
            }
        } catch (error) {
            console.error("Failed to fetch stories", error);
        }
    };

    const fetchHomeOnlineStories = async () => {
        try {
            const res = await axios.get('https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=1');
            setHomeOnlineStories(res.data.data.items || []);
        } catch (error) {
            console.error("Failed to fetch home online stories", error);
        }
    };

    const searchOnlineStories = async (keyword) => {
        try {
            const res = await axios.get(`https://otruyenapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`);
            setOnlineStories(res.data.data.items || []);
        } catch (error) {
            console.error("Failed to search online", error);
            setOnlineStories([]);
        }
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % featuredStories.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + featuredStories.length) % featuredStories.length);
    };

    const handleSurpriseMe = async () => {
        try {
            const res = await api.get('/stories');
            const allStories = res.data;
            if (allStories.length > 0) {
                const randomStory = allStories[Math.floor(Math.random() * allStories.length)];
                navigate(`/story/${randomStory.id}`);
            }
        } catch (error) {
            console.error("Failed to surprise", error);
        }
    };

    const handleCategorySelect = (id) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            if (id) newParams.set('category', id);
            else newParams.delete('category');
            return newParams;
        });
    };

    const moods = [
        { id: 'happy', label: 'Vui vẻ', icon: <Smile size={20} />, categoryId: 4, color: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' },
        { id: 'thrilling', label: 'Hồi hộp', icon: <Zap size={20} />, categoryId: 1, color: 'bg-amber-100 text-amber-600 hover:bg-amber-200' },
        { id: 'dreamy', label: 'Mơ mộng', icon: <Moon size={20} />, categoryId: 3, color: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' },
        { id: 'scared', label: 'Sợ hãi', icon: <Ghost size={20} />, categoryId: 5, color: 'bg-gray-100 text-gray-600 hover:bg-gray-200' },
        { id: 'sad', label: 'Buồn', icon: <CloudRain size={20} />, categoryId: 6, color: 'bg-blue-100 text-blue-600 hover:bg-blue-200' },
        { id: 'love', label: 'Yêu đời', icon: <Heart size={20} />, categoryId: 2, color: 'bg-pink-100 text-pink-600 hover:bg-pink-200' },
    ];

    return (
        <div className="space-y-12 pb-12">
            {/* Hero Slider */}
            {featuredStories.length > 0 && (
                <div className="relative rounded-3xl overflow-hidden bg-gray-900 shadow-2xl animate-fade-in h-[400px] md:h-[500px] group">
                    {featuredStories.map((story, index) => (
                        <div
                            key={story.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                }`}
                        >
                            <div className="absolute inset-0">
                                <img
                                    src={story.coverUrl}
                                    alt={story.title}
                                    className="w-full h-full object-cover opacity-50"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/60 to-transparent"></div>
                            </div>

                            <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 max-w-4xl">
                                <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs md:text-sm font-medium mb-4 md:mb-6 backdrop-blur-sm w-fit animate-slide-up">
                                    Truyện nổi bật
                                </span>
                                <h1 className="text-3xl md:text-6xl font-bold mb-3 md:mb-4 text-white leading-tight tracking-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                    {story.title}
                                </h1>
                                <p className="mb-6 md:mb-8 text-gray-200 text-base md:text-xl max-w-2xl line-clamp-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                    {story.description}
                                </p>
                                <div className="flex gap-3 md:gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                                    <Link
                                        to={`/story/${story.id}`}
                                        className="btn btn-primary px-8 py-3 text-lg shadow-lg shadow-indigo-500/30"
                                    >
                                        Đọc ngay
                                    </Link>
                                    <button className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors font-medium">
                                        Thêm vào tủ
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Slider Controls */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {featuredStories.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Continue Reading Section */}
            {readingHistory.length > 0 && (
                <div className="space-y-4 animate-slide-up">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-1 h-8 bg-indigo-600 rounded-full"></span>
                        Tiếp tục đọc
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {readingHistory.slice(0, 3).map((item, index) => (
                            <Link
                                key={index}
                                to={`/story/${item.id}/chapter/${item.lastReadChapterId}`}
                                className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all group"
                            >
                                <img
                                    src={item.coverUrl}
                                    alt={item.title}
                                    className="w-16 h-24 object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform"
                                />
                                <div className="flex-1 flex flex-col justify-center">
                                    <h4 className="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                                    <p className="text-sm text-gray-500 mb-2">Đang đọc: <span className="text-indigo-600 font-medium">{item.lastReadChapterTitle}</span></p>
                                    <span className="text-xs text-gray-400">Tiếp tục ngay →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Search & Categories */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Danh mục khám phá</h2>
                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            onClick={handleSurpriseMe}
                            className="p-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 font-bold whitespace-nowrap"
                            title="Khám phá ngẫu nhiên"
                        >
                            <Shuffle size={20} /> <span className="hidden sm:inline">Ngẫu nhiên</span>
                        </button>
                        <div className="relative w-full md:w-80 group">
                            <input
                                type="text"
                                placeholder="Tìm kiếm truyện..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        </div>
                    </div>
                </div>

                {/* Mood Selector */}
                <div className="flex flex-wrap gap-4">
                    <span className="flex items-center text-gray-500 font-medium mr-2">Tâm trạng hôm nay:</span>
                    {moods.map(mood => (
                        <button
                            key={mood.id}
                            onClick={() => handleCategorySelect(mood.categoryId)}
                            className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all font-medium ${mood.color} ${selectedCategory === mood.categoryId ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                        >
                            {mood.icon} {mood.label}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide border-t border-gray-100 pt-6">
                    <button
                        onClick={() => handleCategorySelect(null)}
                        className={`px-6 py-2.5 rounded-xl whitespace-nowrap transition-all font-medium ${!selectedCategory
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Tất cả
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat.id)}
                            className={`px-6 py-2.5 rounded-xl whitespace-nowrap transition-all font-medium ${selectedCategory === cat.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* New Section: Home Online Stories (Latest Updates) */}
            <section className="px-4 md:px-0">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-2xl text-green-600">
                            <Globe size={28} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">Truyện Mới Cập Nhật (Online)</h2>
                    </div>
                    <Link to="/external" className="text-orange-600 font-bold hover:text-orange-700 flex items-center gap-2">
                        Xem tất cả <ChevronRight size={20} />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {homeOnlineStories.map((story) => (
                        <div
                            key={story._id}
                            className="group cursor-pointer"
                            onClick={() => setSelectedOnlineStory(story)}
                        >
                            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-md mb-4 group-hover:shadow-xl transition-all duration-300">
                                <img
                                    src={`${IMAGE_CDN}/${story.thumb_url}`}
                                    alt={story.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/400x600?text=No+Image';
                                    }}
                                />
                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                                    Mới
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <span className="text-white font-medium text-sm">Xem chi tiết</span>
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-2 min-h-[3rem]">
                                {story.name}
                            </h3>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                    Online
                                </span>
                                <span className="text-sm text-gray-500">
                                    {story.latest_chapter || 'Đang cập nhật'}
                                </span>
                            </div>
                        </div>
                    ))}
                    {homeOnlineStories.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            Đang tải truyện mới...
                        </div>
                    )}
                </div>
            </section>

            {/* Stories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {stories.map((story) => (
                    <Link
                        key={story.id}
                        to={`/story/${story.id}`}
                        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full"
                    >
                        <div className="aspect-[2/3] overflow-hidden relative">
                            <img
                                src={story.coverUrl}
                                alt={story.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute top-3 right-3">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-md shadow-sm ${story.status === 'Completed'
                                    ? 'bg-green-500/90 text-white'
                                    : 'bg-amber-500/90 text-white'
                                    }`}>
                                    {story.status}
                                </span>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-xl text-gray-900 line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">{story.title}</h3>
                            <p className="text-sm text-indigo-500 font-medium mb-3">{story.author}</p>
                            <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">{story.description}</p>
                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-400">
                                <span>Đọc ngay</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Online Results Section */}
            {search && onlineStories.length > 0 && (
                <div className="space-y-6 pt-12 border-t border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Globe className="text-indigo-600" />
                        Kết quả từ Online (Otruyen)
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                        {onlineStories.map(book => (
                            <div
                                key={book._id}
                                onClick={() => setSelectedOnlineStory(book)}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-gray-100 dark:border-gray-700 overflow-hidden group flex flex-col h-full"
                            >
                                <div className="aspect-[2/3] overflow-hidden relative bg-gray-100 dark:bg-gray-900">
                                    <img
                                        src={`${IMAGE_CDN}/${book.thumb_url}`}
                                        alt={book.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full font-medium border border-white/30">
                                            Xem chi tiết
                                        </span>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                        {book.status === 'completed' ? 'Full' : 'Đang ra'}
                                    </div>
                                </div>
                                <div className="p-3 flex-1 flex flex-col">
                                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors text-sm md:text-base">
                                        {book.name}
                                    </h3>
                                    <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-2">
                                        <span className="flex items-center gap-1">
                                            <ImageIcon size={12} /> Comic
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {
                stories.length === 0 && onlineStories.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="text-gray-300 mb-4">
                            <Search size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy truyện nào</h3>
                        <p className="text-gray-500">Thử tìm kiếm với từ khóa khác xem sao.</p>
                    </div>
                )
            }

            {/* Comic Detail Modal */}
            <ComicDetailModal
                book={selectedOnlineStory}
                isOpen={!!selectedOnlineStory}
                onClose={() => setSelectedOnlineStory(null)}
            />
        </div >
    );
};

export default Home;
