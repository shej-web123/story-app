import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Shuffle, Smile, Zap, Heart, Moon, Globe, Image as ImageIcon, Ghost, CloudRain } from 'lucide-react';
import axios from 'axios';
import ComicDetailModal from '../../components/ComicDetailModal';

const Home = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [banners, setBanners] = useState([]);

    // Missing states restored
    const [stories, setStories] = useState([]);
    const [categories, setCategories] = useState([]);

    // Derived state from URL
    const selectedCategory = searchParams.get('category') ? Number(searchParams.get('category')) : null;

    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'views', 'rating', 'az'
    const [currentSlide, setCurrentSlide] = useState(0);
    const [featuredStories, setFeaturedStories] = useState([]);
    const [readingHistory, setReadingHistory] = useState([]);

    // Online Search State
    const [onlineStories, setOnlineStories] = useState([]);
    const [homeOnlineStories, setHomeOnlineStories] = useState([]);
    const [selectedOnlineStory, setSelectedOnlineStory] = useState(null);
    const IMAGE_CDN = 'https://otruyenapi.com/uploads/comics';

    useEffect(() => {
        fetchBanners();
        fetchCategories();
        fetchStories();
        fetchHomeOnlineStories();
        const history = JSON.parse(localStorage.getItem('readingHistory') || '[]');
        setReadingHistory(history);
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await api.get('/banners?isActive=true&_sort=order&_order=asc');
            setBanners(res.data);
        } catch (error) {
            console.error("Failed to fetch banners", error);
        }
    };

    const fetchStories = async () => {
        try {
            let cx = '';
            if (search) cx += `&q=${search}`;
            if (selectedCategory) cx += `&categoryId=${selectedCategory}`;

            let sortQuery = '';
            switch (sortBy) {
                case 'views': sortQuery = '&_sort=viewCount&_order=desc'; break;
                case 'rating': sortQuery = '&_sort=rating&_order=desc'; break;
                case 'az': sortQuery = '&_sort=title&_order=asc'; break;
                default: sortQuery = '&_sort=id&_order=desc'; // Newest
            }

            const res = await api.get(`/stories?${cx}${sortQuery}`);
            setStories(res.data);

            // Also update featured stories if not searching
            if (!search && !selectedCategory) {
                const featuredRes = await api.get('/stories?_sort=viewCount&_order=desc&_limit=5');
                setFeaturedStories(featuredRes.data);
            }

        } catch (error) {
            console.error("Failed to fetch stories", error);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStories();
            if (search) fetchOnlineStories();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, selectedCategory, sortBy]);


    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const fetchOnlineStories = async () => {
        if (!search) {
            setOnlineStories([]);
            return;
        }
        try {
            const res = await axios.get(`https://otruyenapi.com/v1/api/tim-kiem?keyword=${search}`);
            if (res.data.status === 'success') {
                setOnlineStories(res.data.data.items);
            }
        } catch (error) {
            console.error("Failed to search online stories", error);
        }
    };

    const fetchHomeOnlineStories = async () => {
        try {
            const res = await axios.get(`https://otruyenapi.com/v1/api/danh-sach/truyen-moi`);
            if (res.data.status === 'success') {
                setHomeOnlineStories(res.data.data.items.slice(0, 10));
            }
        } catch (error) {
            console.error("Failed to fetch home online stories", error);
        }
    };

    const handleCategorySelect = (id) => {
        setSearchParams(id ? { category: id } : {});
    };

    const handleSurpriseMe = () => {
        if (stories.length > 0) {
            const random = stories[Math.floor(Math.random() * stories.length)];
            navigate(`/story/${random.id}`);
        }
    };

    const moods = [
        { id: 1, label: 'Vui vẻ', icon: <Smile size={16} />, color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200', categoryId: 2 }, // Ngôn tình
        { id: 2, label: 'Hồi hộp', icon: <Ghost size={16} />, color: 'bg-purple-100 text-purple-700 hover:bg-purple-200', categoryId: 6 }, // Kinh dị
        { id: 3, label: 'Phiêu lưu', icon: <Globe size={16} />, color: 'bg-green-100 text-green-700 hover:bg-green-200', categoryId: 1 }, // Tiên hiệp
        { id: 4, label: 'Buồn', icon: <CloudRain size={16} />, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200', categoryId: 2 }, // Ngôn tình (ngược)
    ];

    // displayedSlides will be banners if available, otherwise featuredStories
    const displayedSlides = banners.length > 0 ? banners : featuredStories;

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % displayedSlides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + displayedSlides.length) % displayedSlides.length);
    };

    // Auto-play slider
    useEffect(() => {
        if (displayedSlides.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % displayedSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [displayedSlides]);

    return (
        <div className="space-y-12 pb-12">
            {/* Premium Hero Slider */}
            {displayedSlides.length > 0 && (
                <div className="relative rounded-[2.5rem] overflow-hidden bg-gray-900 shadow-2xl animate-fade-in h-[500px] md:h-[650px] group ring-1 ring-white/10">
                    {displayedSlides.map((item, index) => (
                        <div
                            key={item.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                }`}
                        >
                            {/* Background Parallax Image */}
                            <div className="absolute inset-0 overflow-hidden">
                                <img
                                    src={item.imageUrl || item.coverUrl}
                                    alt={item.title}
                                    className={`w-full h-full object-cover transform transition-transform duration-[10s] ease-linear ${index === currentSlide ? 'scale-110' : 'scale-100'}`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-transparent to-transparent"></div>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 h-full flex flex-col justify-end md:justify-center px-8 md:px-20 max-w-5xl pb-20 md:pb-0">
                                <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-300 text-xs md:text-sm font-bold uppercase tracking-widest mb-6 animate-slide-up w-fit">
                                    <Zap size={14} className="fill-current" />
                                    {item.imageUrl ? 'Tin nổi bật' : 'Truyện đặc sắc'}
                                </span>

                                <h1 className="text-4xl md:text-7xl font-extrabold mb-4 text-white leading-tight tracking-tight drop-shadow-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                    {item.title}
                                </h1>

                                <p className="mb-8 text-gray-200 text-lg md:text-xl max-w-2xl line-clamp-2 leading-relaxed animate-slide-up drop-shadow-md opacity-90" style={{ animationDelay: '0.2s' }}>
                                    {item.description}
                                </p>

                                <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                                    <Link
                                        to={item.link || `/story/${item.id}`}
                                        className="btn btn-primary px-10 py-4 text-lg rounded-2xl"
                                    >
                                        {item.imageUrl ? 'Xem Ngay' : 'Đọc ngay'}
                                    </Link>
                                    {!item.imageUrl && (
                                        <button className="px-10 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white backdrop-blur-md border border-white/20 transition-all font-bold text-lg hover:-translate-y-0.5">
                                            + Thêm vào tủ
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Navigation Controls */}
                    <div className="absolute right-8 bottom-8 z-30 flex gap-4">
                        <button
                            onClick={prevSlide}
                            className="p-4 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="p-4 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Progress Dots */}
                    <div className="absolute top-8 right-8 z-30 flex gap-2">
                        {displayedSlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-8' : 'bg-white/30 w-4 hover:bg-white/50'}`}
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
                <div className="flex flex-wrap gap-4 items-center">
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

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100 pt-6">
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
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

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                        <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Sắp xếp:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-gray-300 transition-colors cursor-pointer"
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="views">Xem nhiều</option>
                            <option value="rating">Đánh giá cao</option>
                            <option value="az">Tên A-Z</option>
                        </select>
                    </div>
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

            {/* Premium Stories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {stories.map((story) => (
                    <Link
                        key={story.id}
                        to={`/story/${story.id}`}
                        className="group relative flex flex-col"
                    >
                        {/* Card Image */}
                        <div className="relative aspect-[2/3] rounded-3xl overflow-hidden mb-5 shadow-lg group-hover:shadow-2xl group-hover:shadow-indigo-500/20 transition-all duration-500 transform group-hover:-translate-y-2">
                            <img
                                src={story.coverUrl}
                                alt={story.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>

                            {/* Floating Action Badge */}
                            <div className="absolute top-4 right-4 translate-x-10 group-hover:translate-x-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                                <span className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                                    <Heart size={20} className="fill-transparent group-hover:fill-pink-500 transition-colors" />
                                </span>
                            </div>

                            {/* Status Badge */}
                            <div className="absolute bottom-4 left-4">
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md shadow-sm border border-white/10 ${story.status === 'Completed'
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                    }`}>
                                    {story.status}
                                </span>
                            </div>
                        </div>

                        {/* Card Meta */}
                        <div className="flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-1 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {story.title}
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-px w-6 bg-indigo-500/50"></div>
                                <p className="text-sm text-indigo-500 font-bold uppercase tracking-wider text-[10px]">{story.author}</p>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 md:line-clamp-3 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                {story.description}
                            </p>
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
