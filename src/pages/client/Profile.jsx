import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, Save, Camera, Clock, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Profile = () => {
    const { user } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
        }
    });

    const onSubmit = async (data) => {
        try {
            // In a real app, we would call API to update user profile
            // await api.put(`/users/${user.id}`, data);
            toast.success("Cập nhật thông tin thành công!");
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật.");
        }
    };

    const [readingHistory, setReadingHistory] = useState([]);

    useState(() => {
        const history = JSON.parse(localStorage.getItem('readingHistory') || '[]');
        setReadingHistory(history);
    }, []);

    const readingGoal = 5;
    const currentProgress = readingHistory.length;
    const progressPercentage = Math.min((currentProgress / readingGoal) * 100, 100);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
                {/* Cover Image */}
                <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                    <div className="absolute -bottom-16 left-8 md:left-12">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 p-1 shadow-xl">
                                <div className="w-full h-full rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors shadow-lg">
                                <Camera size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-20 px-8 md:px-12 pb-12">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400">{user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-8">

                            {/* Reading Challenge */}
                            <section className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Award size={100} />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <Award size={24} className="text-yellow-300" />
                                        Thử thách đọc sách
                                    </h3>
                                    <p className="text-indigo-100 mb-4">Đọc {readingGoal} truyện trong tháng này để nhận huy hiệu "Mọt Sách"!</p>

                                    <div className="flex justify-between text-sm font-medium mb-2">
                                        <span>Tiến độ</span>
                                        <span>{currentProgress}/{readingGoal} truyện</span>
                                    </div>
                                    <div className="w-full bg-black/20 rounded-full h-3 backdrop-blur-sm">
                                        <div
                                            className="bg-yellow-400 h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                    {currentProgress >= readingGoal && (
                                        <div className="mt-4 bg-white/20 backdrop-blur-md rounded-lg p-3 text-sm font-medium flex items-center gap-2 animate-bounce">
                                            🎉 Chúc mừng! Bạn đã hoàn thành thử thách!
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <User size={20} className="text-indigo-600" />
                                    Thông tin cá nhân
                                </h3>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Họ và tên</label>
                                            <div className="relative">
                                                <input
                                                    {...register('name', { required: "Vui lòng nhập họ tên" })}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                                                />
                                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                            </div>
                                            {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                            <div className="relative">
                                                <input
                                                    {...register('email')}
                                                    disabled
                                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                                />
                                                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button type="submit" className="btn btn-primary px-6 py-2.5 flex items-center gap-2 shadow-lg shadow-indigo-500/30">
                                            <Save size={18} /> Lưu thay đổi
                                        </button>
                                    </div>
                                </form>
                            </section>

                            {/* Reading History Section */}
                            <section className="pt-8 border-t border-gray-100 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Save size={20} className="text-indigo-600" />
                                    Lịch sử đọc ({readingHistory.length})
                                </h3>
                                {readingHistory.length > 0 ? (
                                    <div className="space-y-4">
                                        {readingHistory.map((item, index) => (
                                            <div key={index} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 transition-all group">
                                                <img
                                                    src={item.coverUrl}
                                                    alt={item.title}
                                                    className="w-16 h-24 object-cover rounded-lg shadow-sm"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Đang đọc: <span className="text-indigo-600 dark:text-indigo-400 font-medium">{item.lastReadChapterTitle}</span></p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <Clock size={14} />
                                                        <span>{new Date(item.lastReadAt).toLocaleDateString('vi-VN')}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <a
                                                        href={`/story/${item.id}/chapter/${item.lastReadChapterId}`}
                                                        className="px-4 py-2 bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-300 rounded-lg text-sm font-medium shadow-sm border border-gray-200 dark:border-gray-500 hover:bg-indigo-50 dark:hover:bg-gray-500 transition-colors"
                                                    >
                                                        Đọc tiếp
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                                        Bạn chưa đọc truyện nào gần đây.
                                    </div>
                                )}
                            </section>

                            <section className="pt-8 border-t border-gray-100 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Lock size={20} className="text-indigo-600" />
                                    Đổi mật khẩu
                                </h3>
                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mật khẩu hiện tại</label>
                                            <input type="password" class="input-field dark:bg-gray-700/50 dark:border-gray-600 dark:text-white" placeholder="••••••••" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mật khẩu mới</label>
                                            <input type="password" class="input-field dark:bg-gray-700/50 dark:border-gray-600 dark:text-white" placeholder="••••••••" />
                                        </div>
                                    </div>
                                    <button type="button" className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                        Cập nhật mật khẩu
                                    </button>
                                </form>
                            </section>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Thống kê đọc truyện</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Truyện đã đọc</span>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{readingHistory.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Bình luận</span>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">45</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Giờ đọc</span>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">128h</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
