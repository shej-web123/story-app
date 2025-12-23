import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { PenTool, Image as ImageIcon, Save, ArrowLeft, Bold, Italic, Underline, Type, Quote, List, Eye, X, Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const WriteStory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            status: 'Draft',
            ageRating: 'General'
        }
    });
    const [previewUrl, setPreviewUrl] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const contentRef = useRef(null);

    // Watch content for word count
    const content = watch('content', '');
    const wordCount = content ? content.trim().split(/\s+/).length : 0;

    useEffect(() => {
        if (!user) {
            toast.warning("Vui lòng đăng nhập để viết truyện");
            navigate('/login');
            return;
        }
        fetchCategories();
    }, [user, navigate]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch categories");
        }
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
                setTagInput('');
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const insertFormatting = (format) => {
        const textarea = contentRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        let newText = '';
        let newCursorPos = end;

        switch (format) {
            case 'bold':
                newText = `${before}**${selection}**${after}`;
                newCursorPos = end + 4;
                break;
            case 'italic':
                newText = `${before}*${selection}*${after}`;
                newCursorPos = end + 2;
                break;
            case 'underline': // Markdown doesn't support underline natively, usually ignored or HTML used
                newText = `${before}<u>${selection}</u>${after}`;
                newCursorPos = end + 7;
                break;
            case 'heading':
                newText = `${before}\n### ${selection}${after}`;
                newCursorPos = end + 5;
                break;
            case 'quote':
                newText = `${before}\n> ${selection}${after}`;
                newCursorPos = end + 3;
                break;
            case 'list':
                newText = `${before}\n- ${selection}${after}`;
                newCursorPos = end + 3;
                break;
            default:
                return;
        }

        setValue('content', newText);
        // Need to defer focus to ensure value update propagates
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const onSubmit = async (data) => {
        try {
            const storyData = {
                ...data,
                categoryId: Number(data.categoryId),
                author: user.name,
                tags: tags,
                createdAt: new Date().toISOString()
            };

            await api.post('/stories', storyData);
            toast.success(data.status === 'Published' ? "Đăng truyện thành công!" : "Lưu nháp thành công!");
            navigate('/library');
        } catch (error) {
            toast.error("Có lỗi xảy ra khi lưu truyện");
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-20">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
                <ArrowLeft size={20} /> Quay lại
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <PenTool size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Viết truyện mới</h1>
                            <p className="text-indigo-100">Chia sẻ câu chuyện của bạn với thế giới</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowPreview(true)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-colors flex items-center gap-2"
                        >
                            <Eye size={20} /> Xem trước
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tên truyện</label>
                                <input
                                    {...register('title', { required: "Vui lòng nhập tên truyện" })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-lg font-medium"
                                    placeholder="Ví dụ: Hành trình về phía mặt trời..."
                                />
                                {errors.title && <span className="text-red-500 text-sm mt-1">{errors.title.message}</span>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Danh mục</label>
                                    <select
                                        {...register('categoryId', { required: "Vui lòng chọn danh mục" })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                                    >
                                        <option value="">Chọn danh mục...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {errors.categoryId && <span className="text-red-500 text-sm mt-1">{errors.categoryId.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Độ tuổi</label>
                                    <select
                                        {...register('ageRating')}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                                    >
                                        <option value="General">Mọi lứa tuổi (General)</option>
                                        <option value="Teen">Thanh thiếu niên (13+)</option>
                                        <option value="Mature">Trưởng thành (18+)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Thẻ (Tags)</label>
                                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 transition-all flex flex-wrap gap-2">
                                    {tags.map((tag, index) => (
                                        <span key={index} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium flex items-center gap-1">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={14} /></button>
                                        </span>
                                    ))}
                                    <input
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagKeyDown}
                                        className="flex-1 bg-transparent border-none focus:ring-0 min-w-[100px] dark:text-white"
                                        placeholder="Nhập thẻ và nhấn Enter..."
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Dùng dấu phẩy hoặc Enter để thêm thẻ.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mô tả ngắn</label>
                                <textarea
                                    {...register('description', { required: "Vui lòng nhập mô tả" })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all min-h-[100px]"
                                    placeholder="Giới thiệu sơ lược về cốt truyện..."
                                />
                                {errors.description && <span className="text-red-500 text-sm mt-1">{errors.description.message}</span>}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Trạng thái</label>
                                <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                                    <label className="flex-1 cursor-pointer">
                                        <input type="radio" value="Draft" {...register('status')} className="sr-only peer" />
                                        <span className="block text-center py-2 rounded-lg text-sm font-medium text-gray-500 peer-checked:bg-white peer-checked:text-indigo-600 peer-checked:shadow-sm transition-all">Bản nháp</span>
                                    </label>
                                    <label className="flex-1 cursor-pointer">
                                        <input type="radio" value="Published" {...register('status')} className="sr-only peer" />
                                        <span className="block text-center py-2 rounded-lg text-sm font-medium text-gray-500 peer-checked:bg-white peer-checked:text-green-600 peer-checked:shadow-sm transition-all">Công khai</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Ảnh bìa (URL)</label>
                                <input
                                    {...register('coverUrl', {
                                        required: "Vui lòng nhập URL ảnh bìa",
                                        onChange: (e) => setPreviewUrl(e.target.value)
                                    })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all mb-4"
                                    placeholder="https://..."
                                />
                                <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center relative group">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'} />
                                    ) : (
                                        <div className="text-center text-gray-400 p-4">
                                            <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">Nhập URL ảnh để xem trước</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Nội dung truyện</label>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{wordCount} từ</span>
                        </div>

                        {/* Toolbar */}
                        <div className="flex flex-wrap gap-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-t-xl border border-gray-200 dark:border-gray-600 border-b-0">
                            <button type="button" onClick={() => insertFormatting('bold')} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition-colors" title="In đậm"><Bold size={18} /></button>
                            <button type="button" onClick={() => insertFormatting('italic')} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition-colors" title="In nghiêng"><Italic size={18} /></button>
                            <button type="button" onClick={() => insertFormatting('underline')} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition-colors" title="Gạch chân"><Underline size={18} /></button>
                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1 self-center"></div>
                            <button type="button" onClick={() => insertFormatting('heading')} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition-colors" title="Tiêu đề"><Type size={18} /></button>
                            <button type="button" onClick={() => insertFormatting('quote')} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition-colors" title="Trích dẫn"><Quote size={18} /></button>
                            <button type="button" onClick={() => insertFormatting('list')} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition-colors" title="Danh sách"><List size={18} /></button>
                        </div>

                        <textarea
                            {...register('content', { required: "Vui lòng nhập nội dung" })}
                            ref={(e) => {
                                register('content').ref(e);
                                contentRef.current = e;
                            }}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-b-xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all min-h-[500px] font-serif leading-relaxed text-lg"
                            placeholder="Bắt đầu viết câu chuyện của bạn tại đây..."
                        />
                        {errors.content && <span className="text-red-500 text-sm mt-1">{errors.content.message}</span>}
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-700">
                        <button type="submit" className="btn btn-primary px-8 py-3 text-lg flex items-center gap-2 shadow-xl shadow-indigo-500/30 hover:-translate-y-1 transition-transform">
                            <Save size={20} /> {watch('status') === 'Published' ? 'Đăng truyện ngay' : 'Lưu bản nháp'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-4xl h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-slide-up">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                <Eye size={20} className="text-indigo-600" /> Xem trước
                            </h3>
                            <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900">
                            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl shadow-sm min-h-full">
                                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center">{watch('title') || 'Tiêu đề truyện'}</h1>
                                <div className="flex justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8">
                                    <span>Tác giả: {user?.name}</span>
                                    <span>•</span>
                                    <span>{categories.find(c => c.id === Number(watch('categoryId')))?.name || 'Chưa chọn danh mục'}</span>
                                </div>
                                <div className="prose dark:prose-invert max-w-none font-serif text-lg leading-loose whitespace-pre-wrap">
                                    {watch('content') || 'Nội dung truyện sẽ hiển thị ở đây...'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WriteStory;
