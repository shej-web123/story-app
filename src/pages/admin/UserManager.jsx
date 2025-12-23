import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Pencil, Trash2, Plus, X, User, Shield, ShieldCheck } from 'lucide-react';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
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

    const openModal = (user = null) => {
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
                            <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-bold text-gray-900">{user.name}</span>
                                    </div>
                                </td>
                                <td className="p-5 text-gray-600">{user.email}</td>
                                <td className="p-5">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                            : 'bg-green-100 text-green-700 border border-green-200'
                                        }`}>
                                        {user.role === 'admin' ? <ShieldCheck size={14} /> : <User size={14} />}
                                        {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                                    </span>
                                </td>
                                <td className="p-5 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openModal(user)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-slide-up">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-bold text-gray-900">{editingUser ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ tên</label>
                                <input
                                    {...register('name', { required: true })}
                                    className="input-field"
                                    placeholder="Họ và tên"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    {...register('email', { required: true })}
                                    className="input-field"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu {editingUser && <span className="text-gray-400 font-normal">(Để trống nếu không đổi)</span>}</label>
                                <input
                                    type="password"
                                    {...register('password', { required: !editingUser })}
                                    className="input-field"
                                    placeholder="********"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vai trò</label>
                                <select
                                    {...register('role')}
                                    className="input-field"
                                >
                                    <option value="user">Thành viên (User)</option>
                                    <option value="admin">Quản trị viên (Admin)</option>
                                </select>
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
                                    {editingUser ? 'Lưu thay đổi' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;
