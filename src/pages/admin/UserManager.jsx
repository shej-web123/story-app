import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Pencil, Trash2, Plus, X, User, Shield, ShieldCheck, Eye } from 'lucide-react';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [viewMode, setViewMode] = useState('edit'); // 'edit', 'view'
    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            toast.error("Lỗi tải danh sách người dùng");
        }
    };

    const openModal = (user = null, mode = 'edit') => {
        setViewMode(mode);
        if (user) {
            setEditingUser(user);
            setValue('email', user.email);
            setValue('name', user.name);
            setValue('role', user.role);
            setValue('password', '');
        } else {
            setEditingUser(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        reset();
    };

    const onSubmit = async (data) => {
        try {
            if (editingUser && !data.password) {
                delete data.password;
            }

            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, { ...editingUser, ...data });
                toast.success("Cập nhật người dùng thành công");
            } else {
                await api.post('/register', data);
                toast.success("Thêm người dùng thành công");
            }
            fetchUsers();
            closeModal();
        } catch (error) {
            toast.error("Có lỗi xảy ra");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            try {
                await api.delete(`/users/${id}`);
                toast.success("Xóa người dùng thành công");
                fetchUsers();
            } catch (error) {
                toast.error("Có lỗi xảy ra khi xóa");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Quản lý Tài khoản</h2>
                    <p className="text-gray-500 text-sm">Quản lý người dùng và phân quyền</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all active:scale-95 font-medium"
                >
                    <Plus size={20} /> Thêm tài khoản
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Người dùng</th>
                            <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Email</th>
                            <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Vai trò</th>
                            <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold overflow-hidden shadow-sm">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                user.name.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">ID: {user.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5 text-gray-600">{user.email}</td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${user.role === 'admin'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {user.role === 'admin' ? <ShieldCheck size={12} /> : <User size={12} />}
                                        {user.role}
                                    </span>
                                    {user.isBanned && (
                                        <span className="ml-2 px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 bg-red-100 text-red-700">
                                            Banned
                                        </span>
                                    )}
                                </td>
                                <td className="p-5">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => openModal(user, 'view')} // Pass 'view' mode
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => openModal(user, 'edit')}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Sửa"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Xóa"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all scale-100">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">
                                {viewMode === 'view' ? 'Thông tin người dùng' : editingUser ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            {viewMode === 'view' && editingUser ? (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-24 h-24 rounded-full bg-indigo-100 mb-4 overflow-hidden ring-4 ring-indigo-50">
                                            {editingUser.avatar ? (
                                                <img src={editingUser.avatar} alt={editingUser.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-indigo-600">
                                                    {editingUser.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900">{editingUser.name}</h4>
                                        <p className="text-gray-500">{editingUser.email}</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${editingUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {editingUser.role}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${editingUser.isBanned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {editingUser.isBanned ? 'Banned' : 'Active'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                            <span className="text-gray-500">ID tài khoản</span>
                                            <span className="font-medium text-gray-900">#{editingUser.id}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                            <span className="text-gray-500">Ngày tham gia</span>
                                            <span className="font-medium text-gray-900">
                                                {editingUser.joinDate ? new Date(editingUser.joinDate).toLocaleDateString('vi-VN') : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Giới thiệu</span>
                                            <span className="font-medium text-gray-900 max-w-[200px] truncate text-right">
                                                {editingUser.bio || 'Chưa cập nhật'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                                        <input
                                            {...register("name", { required: true })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                                            placeholder="Nhập họ tên..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            {...register("email", { required: true })}
                                            type="email"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                                            placeholder="example@email.com"
                                            disabled={!!editingUser}
                                        />
                                    </div>
                                    {!editingUser && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                                            <input
                                                {...register("password", { required: !editingUser })}
                                                type="password"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                                                placeholder="••••••"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                                        <select
                                            {...register("role")}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                                        >
                                            <option value="user">Người dùng (User)</option>
                                            <option value="admin">Quản trị viên (Admin)</option>
                                        </select>
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95"
                                        >
                                            {editingUser ? 'Cập nhật' : 'Thêm mới'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;
