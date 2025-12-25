import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import CommentSection from '../../components/CommentSection';
import axios from 'axios';
import { ArrowLeft, Settings, ChevronLeft, ChevronRight, List, Home, Image as ImageIcon, Type } from 'lucide-react';

const ChapterReader = () => {
    const { storyId, chapterId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [chapter, setChapter] = useState(null);
    const [story, setStory] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [showToc, setShowToc] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Comic State
    const [comicImages, setComicImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);

    // Settings
    const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('reader_fontSize')) || 18);
    const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('reader_fontFamily') || 'font-serif');
    const [theme, setTheme] = useState(() => localStorage.getItem('reader_theme') || 'light');

    useEffect(() => {
        localStorage.setItem('reader_fontSize', fontSize);
        localStorage.setItem('reader_fontFamily', fontFamily);
        localStorage.setItem('reader_theme', theme);
    }, [fontSize, fontFamily, theme]);

    useEffect(() => {
        // Reset state for new chapter
        setComicImages([]);
        setChapter(null);
        setLoadingImages(false);
        fetchData();
        window.scrollTo(0, 0);
        setIsHeaderVisible(true);
    }, [storyId, chapterId]);

    // Immersive Scroll Effect
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > 100) {
                setIsHeaderVisible(currentScrollY < lastScrollY);
            } else {
                setIsHeaderVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const fetchData = async () => {
        try {
            const [storyRes, chaptersRes, chapterRes] = await Promise.all([
                api.get(`/stories/${storyId}`),
                api.get(`/chapters?storyId=${storyId}&_sort=order&_order=asc`),
                api.get(`/chapters/${chapterId}`)
            ]);
            setStory(storyRes.data);
            setChapters(chaptersRes.data);
            setChapter(chapterRes.data);

            setChapter(chapterRes.data);

            // Update reading history
            addToHistory(storyRes.data, chapterRes.data);
        } catch (error) {
            console.error("Failed to load chapter data", error);
        }
    };

    const fetchComicImages = async (apiUrl) => {
        setLoadingImages(true);
        console.log("Fetching comic images from:", apiUrl);
        try {
            const res = await axios.get(apiUrl);
            console.log("API Response:", res.data);
            const data = res.data.data;
            const domain = data.domain_cdn;
            const path = data.item.chapter_path;
            const images = data.item.chapter_image.map(img => ({
                src: `${domain}/${path}/${img.image_file}`,
                page: img.image_page
            }));
            console.log("Parsed images:", images);
            setComicImages(images);
        } catch (error) {
            console.error("Failed to fetch comic images", error);
        } finally {
            setLoadingImages(false);
        }
    };

    const addToHistory = async (storyData, chapterData) => {
        // 1. Local Storage (always)
        const history = JSON.parse(localStorage.getItem('readingHistory') || '[]');
        const newEntry = {
            ...storyData,
            lastReadChapterId: chapterData.id,
            lastReadChapterTitle: chapterData.title,
            lastReadAt: new Date().toISOString()
        };
        const newHistory = [newEntry, ...history.filter(s => s.id !== storyData.id)].slice(0, 10);
        localStorage.setItem('readingHistory', JSON.stringify(newHistory));

        // 2. Database (if logged in)
        if (user) {
            try {
                // Check if entry exists
                const res = await api.get(`/reading_history?userId=${user.id}&storyId=${storyData.id}`);
                const existing = res.data[0];

                if (existing) {
                    await api.patch(`/reading_history/${existing.id}`, {
                        chapterId: chapterData.id,
                        chapterTitle: chapterData.title,
                        lastReadAt: new Date().toISOString()
                    });
                } else {
                    await api.post('/reading_history', {
                        userId: user.id,
                        storyId: storyData.id,
                        storyTitle: storyData.title,
                        storyCover: storyData.coverUrl || storyData.cover,
                        chapterId: chapterData.id,
                        chapterTitle: chapterData.title,
                        lastReadAt: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error("Failed to sync reading history", error);
            }
        }
    };

    const navigateChapter = (direction) => {
        const currentIndex = chapters.findIndex(c => c.id === Number(chapterId));
        if (direction === 'next' && currentIndex < chapters.length - 1) {
            navigate(`/story/${storyId}/chapter/${chapters[currentIndex + 1].id}`);
        } else if (direction === 'prev' && currentIndex > 0) {
            navigate(`/story/${storyId}/chapter/${chapters[currentIndex - 1].id}`);
        }
    };

    const currentChapterIndex = chapters.findIndex(c => c.id === Number(chapterId));
    const hasNext = currentChapterIndex < chapters.length - 1;
    const hasPrev = currentChapterIndex > 0;

    // Determine if comic based on story type OR chapter data (fallback)
    // Safe access because story/chapter might be null initially
    const isComic = story?.type === 'comic' || (chapter?.externalId && chapter?.source === 'otruyen');

    console.log("ChapterReader Render:", {
        storyType: story?.type,
        chapterExternalId: chapter?.externalId,
        isComic,
        imagesCount: comicImages.length
    });

    // Effect to fetch images if isComic becomes true and images aren't loaded
    useEffect(() => {
        if (isComic && chapter?.externalId && comicImages.length === 0 && !loadingImages) {
            console.log("Triggering fetchComicImages for:", chapter.externalId);
            fetchComicImages(chapter.externalId);
        }
    }, [isComic, chapter]);

    if (!chapter || !story) return <div className="text-center py-20">Đang tải...</div>;

    const themeClasses = {
        light: 'bg-white text-gray-900',
        sepia: 'bg-[#f4ecd8] text-[#5b4636]',
        dark: 'bg-[#1a1a1a] text-[#d1d5db]'
    };

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${themeClasses[theme]}`}>
            {/* Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
                } ${isComic ? 'bg-black/80 backdrop-blur-md text-white border-none' :
                    theme === 'dark' ? 'bg-[#1a1a1a]/90 backdrop-blur-md border-gray-800' :
                        theme === 'sepia' ? 'bg-[#f4ecd8]/90 backdrop-blur-md border-[#e6dcc5]' : 'bg-white/90 backdrop-blur-md border-gray-100'
                }`}>
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={`/story/${storyId}`} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="font-bold truncate max-w-[150px] sm:max-w-md">{story.title}</h1>
                        <span className="hidden sm:inline text-gray-400">/</span>
                        <span className="hidden sm:inline truncate max-w-[150px]">{chapter.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {!isComic && (
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                            >
                                <Settings size={20} />
                            </button>
                        )}
                        <button
                            onClick={() => setShowToc(!showToc)}
                            className={`p-2 rounded-full transition-colors ${showToc ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                        >
                            <List size={20} />
                        </button>
                        <Link to="/" className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                            <Home size={20} />
                        </Link>
                    </div>
                </div>

                {/* Settings Panel (Glassmorphism) */}
                {showSettings && !isComic && (
                    <div className="absolute top-full right-4 mt-2 w-80 p-6 rounded-2xl animate-fade-in glass-card">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold mb-3 opacity-70 flex justify-between">
                                    <span>Cỡ chữ</span>
                                    <span>{fontSize}px</span>
                                </label>
                                <input
                                    type="range"
                                    min="14"
                                    max="32"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-3 opacity-70">Font chữ</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setFontFamily('font-serif')} className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${fontFamily === 'font-serif' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30' : 'border-gray-200 hover:bg-black/5 dark:hover:bg-white/10'}`}>Serif</button>
                                    <button onClick={() => setFontFamily('font-sans')} className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${fontFamily === 'font-sans' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30' : 'border-gray-200 hover:bg-black/5 dark:hover:bg-white/10'}`}>Sans</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-3 opacity-70">Giao diện</label>
                                <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                    <button onClick={() => setTheme('light')} className={`flex-1 py-2 rounded-lg transition-all text-sm font-medium ${theme === 'light' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Sáng</button>
                                    <button onClick={() => setTheme('sepia')} className={`flex-1 py-2 rounded-lg transition-all text-sm font-medium ${theme === 'sepia' ? 'bg-[#f4ecd8] shadow-sm text-[#5b4636]' : 'text-gray-500 hover:text-[#5b4636]'}`}>Vàng</button>
                                    <button onClick={() => setTheme('dark')} className={`flex-1 py-2 rounded-lg transition-all text-sm font-medium ${theme === 'dark' ? 'bg-[#1a1a1a] shadow-sm text-white' : 'text-gray-500 hover:text-white'}`}>Tối</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table of Contents */}
                {showToc && (
                    <div className={`absolute top-full left-0 w-full md:w-80 max-h-[70vh] overflow-y-auto border-b md:border-r shadow-lg animate-fade-in ${theme === 'dark' ? 'bg-[#252525] border-gray-700' :
                        theme === 'sepia' ? 'bg-[#fdf6e3] border-[#e6dcc5]' : 'bg-white border-gray-100'
                        }`}>
                        <div className="p-4">
                            <h3 className="font-bold mb-4 opacity-80">Danh sách chương</h3>
                            <div className="space-y-1">
                                {chapters.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => {
                                            navigate(`/story/${storyId}/chapter/${c.id}`);
                                            setShowToc(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${c.id === Number(chapterId)
                                            ? 'bg-indigo-600 text-white'
                                            : 'hover:bg-black/5 dark:hover:bg-white/10'
                                            }`}
                                    >
                                        {c.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Content */}
            <main className={`flex-1 ${isComic ? 'w-full max-w-4xl mx-auto' : 'container mx-auto px-4 py-8 md:py-12 max-w-3xl'}`}>
                {!isComic && (
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">{chapter.title}</h2>
                        <p className="opacity-60 text-sm">Chương {chapter.order} • {story.title}</p>
                    </div>
                )}

                {
                    isComic ? (
                        <div className="flex flex-col items-center bg-black min-h-screen">
                            {loadingImages ? (
                                <div className="py-20 text-white">Đang tải ảnh truyện...</div>
                            ) : (
                                comicImages.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img.src}
                                        alt={`Page ${img.page}`}
                                        className="w-full h-auto max-w-3xl shadow-lg"
                                        loading="lazy"
                                    />
                                ))
                            )}
                            {comicImages.length === 0 && !loadingImages && (
                                <div className="py-20 text-white">Không tải được ảnh chương này.</div>
                            )}
                        </div>
                    ) : (
                        <div
                            className={`prose max-w-none leading-loose transition-all duration-300 ${fontFamily} ${theme === 'dark' ? 'prose-invert' : ''}`}
                            style={{ fontSize: `${fontSize}px` }}
                        >
                            {(chapter.content || '').split('\n').map((paragraph, idx) => (
                                paragraph.trim() && <p key={idx}>{paragraph}</p>
                            ))}
                            {(!chapter.content || !chapter.content.trim()) && (
                                <p className="italic text-gray-500 text-center">Nội dung chương trống...</p>
                            )}
                        </div>
                    )
                }

                {/* Chapter Comments */}
                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                    <CommentSection storyId={story.id} chapterId={chapter.id} />
                </div>

            </main>

            {/* Footer Navigation */}
            < footer className={`border-t py-6 mt-auto transition-colors duration-300 ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-800' :
                theme === 'sepia' ? 'bg-[#f4ecd8] border-[#e6dcc5]' : 'bg-gray-50 border-gray-100'
                }`}>
                <div className="container mx-auto px-4 max-w-3xl flex justify-between gap-4">
                    <button
                        onClick={() => navigateChapter('prev')}
                        disabled={!hasPrev}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${!hasPrev
                            ? 'opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-800 text-gray-500'
                            : 'bg-white dark:bg-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 text-indigo-600 dark:text-indigo-400'
                            }`}
                    >
                        <ChevronLeft size={20} /> Chương trước
                    </button>
                    <button
                        onClick={() => navigateChapter('next')}
                        disabled={!hasNext}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${!hasNext
                            ? 'opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-800 text-gray-500'
                            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:-translate-y-0.5'
                            }`}
                    >
                        Chương sau <ChevronRight size={20} />
                    </button>
                </div>
            </footer >
        </div >
    );
};

export default ChapterReader;
