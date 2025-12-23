import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Globe, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import ComicDetailModal from '../../components/ComicDetailModal';

const ExternalLibrary = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [selectedBook, setSelectedBook] = useState(null);

    // API Base URL
    const API_BASE = 'https://otruyenapi.com/v1/api';
    const IMAGE_CDN = 'https://otruyenapi.com/uploads/comics'; // Base for thumbnails

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async (page = 1, keyword = '') => {
        setLoading(true);
        try {
            let url = `${API_BASE}/danh-sach/truyen-moi?page=${page}`;
            if (keyword) {
                url = `${API_BASE}/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`;
            }

            const res = await axios.get(url);
            const data = res.data.data;

            if (page === 1) {
                setBooks(data.items);
            } else {
                setBooks(prev => [...prev, ...data.items]);
            }

            setPagination({
                currentPage: data.params.pagination.currentPage,
                totalPages: Math.ceil(data.params.pagination.totalItems / data.params.pagination.totalItemsPerPage)
            });

        } catch (error) {
            console.error("Failed to fetch books", error);
            toast.error("Không thể tải danh sách truyện.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchBooks(1, search);
    };

    const loadMore = () => {
        if (pagination.currentPage < pagination.totalPages) {
            fetchBooks(pagination.currentPage + 1, search);
        }
    };

    const handleBookClick = (book) => {
        setSelectedBook(book);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-6 md:p-12 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Globe size={200} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">Kho Truyện Tranh</h1>
                    <p className="text-orange-100 text-lg mb-8">
                        Khám phá hàng ngàn bộ truyện tranh hấp dẫn.
                        Cập nhật liên tục, đa dạng thể loại từ Manga, Manhwa đến Manhua.
                    </p>

                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Tìm tên truyện..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500/30 shadow-lg"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="absolute left-4 top-4 text-gray-400" size={24} />
                        <button
                            type="submit"
                            className="absolute right-2 top-2 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                        >
                            Tìm
                        </button>
                    </form>
                </div>
            </div>

            {/* Book Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {books.map(book => (
                    <div
                        key={book._id}
                        onClick={() => handleBookClick(book)}
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
                            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors text-sm md:text-base">
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

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-gray-500">Đang tải truyện...</p>
                </div>
            )}

            {/* Load More */}
            {!loading && pagination.currentPage < pagination.totalPages && (
                <div className="text-center pt-8">
                    <button
                        onClick={loadMore}
                        className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium shadow-sm"
                    >
                        Tải thêm truyện
                    </button>
                </div>
            )}

            {/* Detail Modal */}
            <ComicDetailModal
                book={selectedBook}
                isOpen={!!selectedBook}
                onClose={() => setSelectedBook(null)}
            />
        </div>
    );
};

export default ExternalLibrary;

