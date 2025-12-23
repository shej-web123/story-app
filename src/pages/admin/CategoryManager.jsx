import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Pencil, Trash2, Plus, X, FolderTree } from 'lucide-react';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            toast.error("Lỗi tải danh mục");
        }
    };

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setValue('name', category.name);
            setValue('description', category.description);
        } else {
            setEditingCategory(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        reset();
    };

    const onSubmit = async (data) => {
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, data);
                toast.success("Cập nhật danh mục thành công");
            } else {
                await api.post('/categories', data);
                toast.success("Thêm danh mục thành công");
            }
            fetchCategories();
            closeModal();
        } catch (error) {
            toast.error("Có lỗi xảy ra");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
            try {
                await api.delete(`/categories/${id}`);
                toast.success("Xóa danh mục thành công");
                fetchCategories();
            } catch (error) {
                toast.error("Có lỗi xảy ra khi xóa");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Quản lý Danh mục</h2>
                    <p className="text-gray-500 text-sm">Phân loại truyện theo thể loại</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all active:scale-95 font-medium"
                >
                    <Plus size={20} /> Thêm danh mục
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Tên danh mục</th>
                            <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Mô tả</th>
                            <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {categories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <FolderTree size={20} />
                                        </div>
                                        <span className="font-bold text-gray-900">{cat.name}</span>
                                    </div>
                                </td>
                                <td className="p-5 text-gray-600">{cat.description}</td>
                                <td className="p-5 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openModal(cat)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan="3" className="p-8 text-center text-gray-500">Chưa có danh mục nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-slide-up">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-bold text-gray-900">{editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên danh mục</label>
                                <input
                                    {...register('name', { required: true })}
                                    className="input-field"
                                    placeholder="Nhập tên danh mục"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả</label>
                                <textarea
                                    {...register('description')}
                                    className="input-field min-h-[100px]"
                                    placeholder="Nhập mô tả ngắn gọn"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary px-6 py-2.5 shadow-lg shadow-indigo-500/30"
                                >
                                    {editingCategory ? 'Lưu thay đổi' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManager;
