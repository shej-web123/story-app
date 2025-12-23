import { useState, useEffect } from 'react';
import { X, Loader, Info, Download, PlayCircle, ExternalLink, Globe } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ComicDetailModal = ({ book, isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [detailLoading, setDetailLoading] = useState(false);
    const [fullBookData, setFullBookData] = useState(null);
    const [localStoryId, setLocalStoryId] = useState(null);
    const [readingProgress, setReadingProgress] = useState(null);
    const [hasChapters, setHasChapters] = useState(true);
    const [importing, setImporting] = useState(false);

    const API_BASE = 'https://otruyenapi.com/v1/api';
    const IMAGE_CDN = 'https://otruyenapi.com/uploads/comics';

    useEffect(() => {
        if (isOpen && book) {
            fetchBookDetails(book.slug);
            checkLocalExistence(book.slug);
        } else {
            // Reset state when closed
            setFullBookData(null);
            setLocalStoryId(null);
            setReadingProgress(null);
            setHasChapters(true);
        }
    }, [isOpen, book]);

    const fetchBookDetails = async (slug) => {
        setDetailLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/truyen-tranh/${slug}`);
            const data = res.data.data.item;
            setFullBookData(data);
        } catch (error) {
            console.error("Failed to fetch details", error);
            toast.error("Không thể xem chi tiết truyện này.");
        } finally {
            setDetailLoading(false);
        }
    };

    const checkLocalExistence = async (slug) => {
        try {
            const res = await api.get(`/stories?slug=${slug}`);
            const foundStory = res.data.find(s => s.slug === slug);

            if (foundStory) {
                const storyId = foundStory.id;
                setLocalStoryId(storyId);

                // Check if chapters exist
                const chapRes = await api.get(`/chapters?storyId=${storyId}&_limit=1`);
                setHasChapters(chapRes.data.length > 0);

                // Check reading history
                const history = JSON.parse(localStorage.getItem('readingHistory') || '[]');
                const progress = history.find(h => h.id == storyId); // Loose equality for ID

                if (progress) {
                    setReadingProgress(progress);
                }
            } else {
                setLocalStoryId(null);
                setReadingProgress(null);
                setHasChapters(true);
            }
        } catch (error) {
            console.error("Failed to check local existence", error);
        }
    };

    const handleImport = async () => {
        if (!fullBookData) return;

        // Check if user is logged in
        if (!user) {
            toast.warning('Đăng nhập để lưu truyện vào tủ sách!');
            navigate('/login');
            return;
        }

        if (localStoryId) {
            toast.info("Truyện này đã có trong thư viện!");
            return;
        }

        setImporting(true);
        console.log('[IMPORT] Starting import process...');
        console.log('[IMPORT] Full book data:', fullBookData);

        try {
            // 1. Create Story
            console.log('[IMPORT] Creating story...');
            const storyData = {
                title: fullBookData.name,
                author: fullBookData.author[0] || 'Unknown',
                categoryId: 1, // Default category
                status: fullBookData.status === 'completed' ? 'Completed' : 'Ongoing',
                description: fullBookData.content.replace(/<[^>]*>?/gm, ''), // Strip HTML
                coverUrl: `${IMAGE_CDN}/${fullBookData.thumb_url}`,
                createdAt: new Date().toISOString(),
                source: 'otruyen',
                type: 'comic',
                slug: fullBookData.slug,
                externalId: fullBookData._id
            };

            const storyRes = await api.post('/stories', storyData);
            const storyId = storyRes.data.id;

            // 2. Create Chapters (Metadata only)
            const serverData = fullBookData.chapters?.[0]?.server_data || [];

            if (serverData.length === 0) {
                toast.warn("Truyện này chưa có chương nào để nhập.");
            }

            const chapterPromises = serverData.map((chap) => {
                return api.post('/chapters', {
                    storyId: storyId,
                    title: `Chương ${chap.chapter_name}: ${chap.chapter_title || ''}`,
                    content: '', // No text content for comics
                    order: parseFloat(chap.chapter_name),
                    createdAt: new Date().toISOString(),
                    externalId: chap.chapter_api_data,
                    source: 'otruyen'
                });
            });

            // Execute in chunks
            const CHUNK_SIZE = 10;
            console.log('[IMPORT] Total promises:', chapterPromises.length);

            for (let i = 0; i < chapterPromises.length; i += CHUNK_SIZE) {
                console.log(`[IMPORT] Processing chunk ${i / CHUNK_SIZE + 1}...`);
                await Promise.all(chapterPromises.slice(i, i + CHUNK_SIZE));
            }

            console.log('[IMPORT] All chapters saved!');

            console.log('[IMPORT] Import complete! Setting local story ID...');
            setLocalStoryId(storyId);
            toast.success(`Đã lưu "${fullBookData.name}" và ${serverData.length} chương vào thư viện!`);
        } catch (error) {
            console.error('Import failed:', error);

            // More specific error messages
            if (error.response) {
                // Server responded with error
                toast.error(`Lỗi từ server: ${error.response.status}`);
            } else if (error.request) {
                // No response from server
                toast.error("Không thể kết nối đến server. Hãy kiểm tra kết nối.");
            } else {
                // Other errors
                toast.error("Lỗi khi lưu truyện. Vui lòng thử lại.");
            }
        } finally {
            setImporting(false);
        }
    };

    const handleReloadChapters = async () => {
        if (!fullBookData || !localStoryId) return;
        setImporting(true);
        try {
            const serverData = fullBookData.chapters[0]?.server_data || [];

            if (serverData.length === 0) {
                toast.warn("Truyện này chưa có chương nào để nhập.");
                setImporting(false);
                return;
            }

            const chapterPromises = serverData.map((chap) => {
                return api.post('/chapters', {
                    storyId: localStoryId,
                    title: `Chương ${chap.chapter_name}: ${chap.chapter_title || ''}`,
                    content: '',
                    order: parseFloat(chap.chapter_name),
                    createdAt: new Date().toISOString(),
                    externalId: chap.chapter_api_data,
                    source: 'otruyen'
                });
            });

            const CHUNK_SIZE = 10;
            for (let i = 0; i < chapterPromises.length; i += CHUNK_SIZE) {
                await Promise.all(chapterPromises.slice(i, i + CHUNK_SIZE));
            }

            setHasChapters(true);
            toast.success(`Đã cập nhật ${serverData.length} chương!`);
        } catch (error) {
            console.error("Reload failed", error);
            toast.error("Lỗi khi cập nhật chương.");
        } finally {
            setImporting(false);
        }
    };

    const handleReadNow = async () => {
        if (localStoryId) {
            if (readingProgress && readingProgress.lastReadChapterId) {
                navigate(`/story/${localStoryId}/chapter/${readingProgress.lastReadChapterId}`);
                return;
            }

            try {
                const res = await api.get(`/chapters?storyId=${localStoryId}&_sort=order&_order=asc&_limit=1`);
                if (res.data.length > 0) {
                    navigate(`/story/${localStoryId}/chapter/${res.data[0].id}`);
                } else {
                    toast.info("Truyện này chưa có chương nào.");
                }
            } catch (error) {
                toast.error("Không thể tải thông tin chương.");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative flex flex-col md:flex-row overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors text-gray-800 dark:text-white"
                >
                    <X size={24} />
                </button>

                {detailLoading || !fullBookData ? (
                    <div className="w-full h-96 flex items-center justify-center">
                        <Loader className="animate-spin text-orange-500" size={48} />
                    </div>
                ) : (
                    <>
                        <div className="w-full md:w-1/3 bg-gray-100 dark:bg-gray-900 p-8 flex items-center justify-center">
                            <div className="w-48 shadow-2xl rounded-lg overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-500">
                                <img
                                    src={`${IMAGE_CDN}/${fullBookData.thumb_url}`}
                                    alt={fullBookData.name}
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>

                        <div className="flex-1 p-8 md:p-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{fullBookData.name}</h2>
                            <p className="text-xl text-orange-600 dark:text-orange-400 mb-6 font-medium">
                                {fullBookData.author?.join(', ') || 'Đang cập nhật'}
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <Info size={18} /> Thể loại
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {fullBookData.category?.slice(0, 5).map((cat, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                                                {cat.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                    <span className="block text-sm text-orange-600 dark:text-orange-400 mb-1">Trạng thái</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        {fullBookData.status === 'completed' ? 'Hoàn thành' : 'Đang tiến hành'}
                                    </span>
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                                    {localStoryId ? (
                                        !hasChapters ? (
                                            <button
                                                onClick={handleReloadChapters}
                                                disabled={importing}
                                                className="btn bg-yellow-500 hover:bg-yellow-600 text-white w-full py-4 rounded-xl shadow-lg shadow-yellow-500/30 font-bold text-lg flex items-center justify-center gap-2"
                                            >
                                                {importing ? <Loader className="animate-spin" /> : <Download size={24} />}
                                                Cập nhật chương
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleReadNow}
                                                className="btn bg-indigo-600 hover:bg-indigo-700 text-white w-full py-4 rounded-xl shadow-lg shadow-indigo-500/30 font-bold text-lg flex items-center justify-center gap-2"
                                            >
                                                <PlayCircle size={24} />
                                                {readingProgress ? `Đọc tiếp: ${readingProgress.lastReadChapterTitle || 'Chương đang đọc'}` : 'Đọc ngay'}
                                            </button>
                                        )
                                    ) : (
                                        <button
                                            onClick={handleImport}
                                            disabled={importing}
                                            className="btn bg-emerald-600 hover:bg-emerald-700 text-white w-full py-4 rounded-xl shadow-lg shadow-emerald-500/30 font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {importing ? (
                                                <>Đang lưu...</>
                                            ) : (
                                                <><Download size={24} /> Lưu vào tủ sách</>
                                            )}
                                        </button>
                                    )}

                                    <a
                                        href={`https://otruyenapi.com/truyen-tranh/${fullBookData.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <ExternalLink size={18} /> Xem nguồn gốc
                                    </a>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ComicDetailModal;
