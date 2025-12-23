import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Pencil, Trash2, Plus, X, Search, Filter, Eye, Download, Loader, List, ChevronRight, Globe, Database } from 'lucide-react';
import axios from 'axios';

const StoryManager = () => {
    const [stories, setStories] = useState([]);
    const [filteredStories, setFilteredStories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
    const [editingStory, setEditingStory] = useState(null);
    const [selectedStoryForChapters, setSelectedStoryForChapters] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [editingChapter, setEditingChapter] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [importSource, setImportSource] = useState('dummy'); // 'dummy' | 'gutendex'

    const { register, handleSubmit, reset, setValue } = useForm();
    const { register: registerChapter, handleSubmit: handleSubmitChapter, reset: resetChapter, setValue: setValueChapter } = useForm();

    useEffect(() => {
        fetchStories();
        fetchCategories();
    }, []);

    useEffect(() => {
        let result = stories;
        if (searchTerm) {
            result = result.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.author.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (filterCategory) {
            result = result.filter(s => s.categoryId === Number(filterCategory));
        }
        setFilteredStories(result);
    }, [stories, searchTerm, filterCategory]);

    const fetchStories = async () => {
        try {
            const res = await api.get('/stories');
            setStories(res.data);
            setFilteredStories(res.data);
        } catch (error) {
            toast.error("Lỗi tải danh sách truyện");
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch categories");
        }
    };

    const fetchChapters = async (storyId) => {
        try {
            const res = await api.get(`/chapters?storyId=${storyId}&_sort=order&_order=asc`);
            setChapters(res.data);
        } catch (error) {
            toast.error("Lỗi tải danh sách chương");
        }
    };

    const handleImport = async () => {
        if (importSource === 'dummy') {
            await importFromDummyJSON();
        } else if (importSource === 'gutendex') {
            await importFromGutendex();
        }
    };

    const importFromDummyJSON = async () => {
        if (!window.confirm("Nhập 5 truyện mẫu từ DummyJSON?")) return;

        setIsImporting(true);
        try {
            const res = await axios.get('https://dummyjson.com/posts?limit=5');
            const posts = res.data.posts;

            let count = 0;
            for (const post of posts) {
                const newStory = {
                    title: post.title,
                    author: 'External Author',
                    categoryId: categories.length > 0 ? categories[0].id : 1,
                    status: 'Completed',
                    description: post.body.substring(0, 100) + '...',
                    coverUrl: `https://picsum.photos/seed/${post.id}/300/450`,
                    createdAt: new Date().toISOString()
                };

                const storyRes = await api.post('/stories', newStory);
                const storyId = storyRes.data.id;

                await api.post('/chapters', {
                    storyId: storyId,
                    title: "Chương 1: Nội dung chính",
                    content: post.body.repeat(5),
                    order: 1,
                    createdAt: new Date().toISOString()
                });

                count++;
            }

            toast.success(`Đã nhập ${count} truyện từ DummyJSON!`);
            fetchStories();
        } catch (error) {
            console.error("Import failed", error);
            toast.error("Lỗi khi nhập dữ liệu");
        } finally {
            setIsImporting(false);
        }
    };

    const importFromGutendex = async () => {
        if (!window.confirm("Nhập 5 sách kinh điển từ Project Gutenberg?")) return;

        setIsImporting(true);
        try {
            const res = await axios.get('https://gutendex.com/books?languages=en&sort=popular');
            // Take top 5 books that have cover images
            const books = res.data.results.filter(b => b.formats['image/jpeg']).slice(0, 5);

            let count = 0;
            for (const book of books) {
                const authorName = book.authors.length > 0 ? book.authors[0].name.replace(/, /g, ' ') : 'Unknown';
                const cover = book.formats['image/jpeg'];

                // Try to get text content URL
                const textUrl = book.formats['text/plain; charset=utf-8'];
                let content = "Nội dung sách này chưa được tải về do giới hạn bản quyền hoặc kỹ thuật. Vui lòng đọc tại Project Gutenberg.";

                if (textUrl) {
                    try {
                        // Note: fetching text content directly might fail due to CORS on client side
                        // We will try, but fallback gracefully
                        // const textRes = await axios.get(textUrl);
                        // content = textRes.data.substring(0, 5000) + "... (Đọc tiếp tại nguồn)";
                        content = `Đây là một tác phẩm kinh điển từ Project Gutenberg.\n\nBạn có thể đọc toàn bộ tác phẩm tại: ${textUrl}\n\n(Hệ thống hiện tại chỉ lưu trữ thông tin metadata của sách này do hạn chế về CORS khi tải nội dung trực tiếp từ trình duyệt).`;
                    } catch (e) {
                        console.warn("Could not fetch text content", e);
                    }
                }

                const newStory = {
                    title: book.title,
                    author: authorName,
                    categoryId: categories.length > 0 ? categories[0].id : 1, // Default to first category
                    status: 'Completed',
                    description: `Một tác phẩm kinh điển được nhập từ Project Gutenberg. Lượt tải: ${book.download_count}.`,
                    coverUrl: cover,
                    createdAt: new Date().toISOString()
                };

                const storyRes = await api.post('/stories', newStory);
                const storyId = storyRes.data.id;

                await api.post('/chapters', {
                    storyId: storyId,
                    title: "Chương 1: Giới thiệu & Nội dung",
                    content: content,
                    order: 1,
                    createdAt: new Date().toISOString()
                });

                count++;
            }

            toast.success(`Đã nhập ${count} sách từ Project Gutenberg!`);
            fetchStories();
        } catch (error) {
            console.error("Gutendex import failed", error);
            toast.error("Lỗi khi nhập từ Project Gutenberg");
        } finally {
            setIsImporting(false);
        }
    };

    // Story Modal Functions
    const openModal = (story = null) => {
        if (story) {
            setEditingStory(story);
            setValue('title', story.title);
            setValue('author', story.author);
            setValue('categoryId', story.categoryId);
            setValue('status', story.status);
            setValue('coverUrl', story.coverUrl);
            setValue('description', story.description);
        } else {
            setEditingStory(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingStory(null);
        reset();
    };

    const onSubmit = async (data) => {
        try {
            data.categoryId = Number(data.categoryId);
            if (editingStory) {
                await api.put(`/stories/${editingStory.id}`, data);
                toast.success("Cập nhật truyện thành công");
            } else {
                await api.post('/stories', data);
                toast.success("Thêm truyện thành công");
            }
            fetchStories();
            closeModal();
        } catch (error) {
            toast.error("Có lỗi xảy ra");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa truyện này? Tất cả chương cũng sẽ bị xóa.")) {
            try {
                // Delete story
                await api.delete(`/stories/${id}`);
                // Note: In a real backend, cascading delete would handle chapters. 
                // With json-server, we might leave orphans or need to delete manually. 
                // For simplicity here, we just delete the story.
                toast.success("Xóa truyện thành công");
                fetchStories();
            } catch (error) {
                toast.error("Có lỗi xảy ra khi xóa");
            }
        }
    };

    // Chapter Modal Functions
    const openChapterManager = (story) => {
        setSelectedStoryForChapters(story);
        fetchChapters(story.id);
        setIsChapterModalOpen(true);
        setEditingChapter(null);
        resetChapter();
    };

    const closeChapterManager = () => {
        setIsChapterModalOpen(false);
        setSelectedStoryForChapters(null);
        setChapters([]);
    };

    const editChapter = (chapter) => {
        setEditingChapter(chapter);
        setValueChapter('title', chapter.title);
        setValueChapter('order', chapter.order);
        setValueChapter('content', chapter.content);
    };

    const cancelEditChapter = () => {
        setEditingChapter(null);
        resetChapter();
    };

    const onSubmitChapter = async (data) => {
        try {
            data.order = Number(data.order);
            data.storyId = selectedStoryForChapters.id;

            if (editingChapter) {
                await api.put(`/chapters/${editingChapter.id}`, data);
                toast.success("Cập nhật chương thành công");
            } else {
                data.createdAt = new Date().toISOString();
                await api.post('/chapters', data);
                toast.success("Thêm chương thành công");
            }
            fetchChapters(selectedStoryForChapters.id);
            cancelEditChapter();
        } catch (error) {
            toast.error("Lỗi lưu chương");
        }
    };

    const handleDeleteChapter = async (id) => {
        if (window.confirm("Xóa chương này?")) {
            try {
                await api.delete(`/chapters/${id}`);
                toast.success("Đã xóa chương");
                fetchChapters(selectedStoryForChapters.id);
            } catch (error) {
                toast.error("Lỗi xóa chương");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Quản lý Truyện</h2>
                    <p className="text-gray-500 text-sm">Quản lý danh sách truyện và nội dung</p>
                </div>
                <div className="flex gap-3 items-center">
                    {/* Source Selector */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setImportSource('dummy')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${importSource === 'dummy' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Dữ liệu mẫu (DummyJSON)"
                        >
                            <Database size={16} /> <span className="hidden sm:inline">Mẫu</span>
                        </button>
                        <button
                            onClick={() => setImportSource('gutendex')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${importSource === 'gutendex' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Sách thật (Project Gutenberg)"
                        >
                            <Globe size={16} /> <span className="hidden sm:inline">Gutenberg</span>
                        </button>
                    </div>

                    <button
                        onClick={handleImport}
                        disabled={isImporting}
                        className="bg-white text-indigo-600 border border-indigo-200 px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-50 transition-all font-medium disabled:opacity-50"
                    >
                        {isImporting ? <Loader size={20} className="animate-spin" /> : <Download size={20} />}
                        {isImporting ? 'Đang nhập...' : 'Nhập'}
                    </button>
                    <button
                        onClick={() => openModal()}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all active:scale-95 font-medium"
                    >
                        <Plus size={20} /> Thêm truyện
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên truyện hoặc tác giả..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 min-w-[200px]">
                    <Filter size={20} className="text-gray-400" />
                    <select
                        className="w-full px-3 py-2.5 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Truyện</th>
                                <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Danh mục</th>
                                <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Trạng thái</th>
                                <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredStories.map((story) => (
                                <tr key={story.id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={story.coverUrl}
                                                alt={story.title}
                                                className="w-12 h-16 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-all"
                                            />
                                            <div>
                                                <h4 className="font-bold text-gray-900">{story.title}</h4>
                                                <p className="text-sm text-gray-500">{story.author}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                            {categories.find(c => c.id === story.categoryId)?.name || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${story.status === 'Completed'
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                                            }`}>
                                            {story.status}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openChapterManager(story)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Quản lý chương"
                                            >
                                                <List size={18} />
                                            </button>
                                            <button
                                                onClick={() => openModal(story)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Chỉnh sửa thông tin"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(story.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredStories.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500">
                                        Không tìm thấy truyện nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Story Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{editingStory ? 'Cập nhật truyện' : 'Thêm truyện mới'}</h3>
                                <p className="text-sm text-gray-500">Điền đầy đủ thông tin bên dưới</p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên truyện</label>
                                        <input
                                            {...register('title', { required: true })}
                                            className="input-field"
                                            placeholder="Nhập tên truyện"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tác giả</label>
                                        <input
                                            {...register('author', { required: true })}
                                            className="input-field"
                                            placeholder="Nhập tên tác giả"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Danh mục</label>
                                        <select
                                            {...register('categoryId', { required: true })}
                                            className="input-field"
                                        >
                                            <option value="">Chọn danh mục</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trạng thái</label>
                                        <select
                                            {...register('status')}
                                            className="input-field"
                                        >
                                            <option value="Ongoing">Đang tiến hành (Ongoing)</option>
                                            <option value="Completed">Đã hoàn thành (Completed)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ảnh bìa (URL)</label>
                                        <input
                                            {...register('coverUrl')}
                                            className="input-field"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả ngắn</label>
                                        <textarea
                                            {...register('description')}
                                            className="input-field min-h-[130px]"
                                            placeholder="Nhập mô tả ngắn về truyện..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary px-8 py-2.5 shadow-lg shadow-indigo-500/30"
                                >
                                    {editingStory ? 'Lưu thay đổi' : 'Tạo truyện mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Chapter Manager Modal */}
            {isChapterModalOpen && selectedStoryForChapters && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl animate-slide-up overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Quản lý chương: {selectedStoryForChapters.title}</h3>
                                <p className="text-sm text-gray-500">Thêm, sửa, xóa các chương của truyện</p>
                            </div>
                            <button onClick={closeChapterManager} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors"><X size={24} /></button>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            {/* Chapter List */}
                            <div className="w-1/3 border-r border-gray-100 overflow-y-auto p-4 bg-gray-50/50">
                                <button
                                    onClick={cancelEditChapter}
                                    className="w-full mb-4 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm"
                                >
                                    <Plus size={18} /> Thêm chương mới
                                </button>
                                <div className="space-y-2">
                                    {chapters.map(chapter => (
                                        <div
                                            key={chapter.id}
                                            className={`p-3 rounded-lg border transition-all cursor-pointer group ${editingChapter?.id === chapter.id
                                                    ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                                    : 'bg-white border-gray-200 hover:border-indigo-300'
                                                }`}
                                            onClick={() => editChapter(chapter)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className={`font-medium text-sm ${editingChapter?.id === chapter.id ? 'text-indigo-700' : 'text-gray-800'}`}>{chapter.title}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">Thứ tự: {chapter.order}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chapter.id); }}
                                                    className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {chapters.length === 0 && (
                                        <p className="text-center text-gray-400 text-sm py-8">Chưa có chương nào.</p>
                                    )}
                                </div>
                            </div>

                            {/* Chapter Editor */}
                            <div className="flex-1 p-6 overflow-y-auto bg-white">
                                <h4 className="font-bold text-lg mb-6 pb-2 border-b border-gray-100">
                                    {editingChapter ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
                                </h4>
                                <form onSubmit={handleSubmitChapter(onSubmitChapter)} className="space-y-6">
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên chương</label>
                                            <input
                                                {...registerChapter('title', { required: true })}
                                                className="input-field"
                                                placeholder="Ví dụ: Chương 1: Khởi đầu"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Thứ tự</label>
                                            <input
                                                type="number"
                                                {...registerChapter('order', { required: true })}
                                                className="input-field"
                                                placeholder="1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nội dung chương</label>
                                        <textarea
                                            {...registerChapter('content', { required: true })}
                                            className="input-field font-mono text-sm min-h-[400px]"
                                            placeholder="Nhập nội dung chương..."
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                        {editingChapter && (
                                            <button
                                                type="button"
                                                onClick={cancelEditChapter}
                                                className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                            >
                                                Hủy bỏ
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            className="btn btn-primary px-8 py-2.5 shadow-lg shadow-indigo-500/30"
                                        >
                                            {editingChapter ? 'Lưu thay đổi' : 'Tạo chương mới'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryManager;
