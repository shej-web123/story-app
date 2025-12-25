import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Settings, Image, Bell, Power, Plus, Trash2, Save, X, Loader } from 'lucide-react';

const SystemSettings = () => {
    const [activeTab, setActiveTab] = useState('banners'); // banners, notifications, maintenance
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [systemConfig, setSystemConfig] = useState({ maintenanceMode: false, maintenanceMessage: '' });
    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        if (activeTab === 'banners') fetchBanners();
        if (activeTab === 'maintenance') fetchSystemConfig();
    }, [activeTab]);

    const fetchSystemConfig = async () => {
        try {
            const res = await api.get('/system_config');
            setSystemConfig(res.data);
        } catch (error) {
            console.error("Failed to config", error);
        }
    };

    const toggleMaintenance = async () => {
        try {
            const newConfig = {
                ...systemConfig,
                maintenanceMode: !systemConfig.maintenanceMode
            };
            // Since json-server /system_config returns the object directly if it's not an array,
            // we update it. But wait, json-server treats top-level objects as singular resources.
            // We usually PUT to /system_config.
            await api.put('/system_config', newConfig);
            setSystemConfig(newConfig);
            toast.success(`Đã ${newConfig.maintenanceMode ? 'BẬT' : 'TẮT'} chế độ bảo trì`);
        } catch (error) {
            toast.error("Lỗi cập nhật cấu hình");
        }
    };

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await api.get('/banners?_sort=order&_order=asc');
            setBanners(res.data);
        } catch (error) {
            toast.error("Lỗi tải banner");
        } finally {
            setLoading(false);
        }
    };

    const onSubmitBanner = async (data) => {
        try {
            data.order = Number(data.order);
            data.isActive = Boolean(data.isActive);
            if (editingBanner) {
                await api.put(`/banners/${editingBanner.id}`, data);
                toast.success("Cập nhật banner thành công");
            } else {
                await api.post('/banners', data);
                toast.success("Thêm banner mới thành công");
            }
            fetchBanners();
            setEditingBanner(null);
            reset();
        } catch (error) {
            toast.error("Lỗi lưu banner");
        }
    };

    const deleteBanner = async (id) => {
        if (!confirm("Xóa banner này?")) return;
        try {
            await api.delete(`/banners/${id}`);
            fetchBanners();
            toast.success("Đã xóa banner");
        } catch (error) {
            toast.error("Lỗi xóa banner");
        }
    };

    const loadBannerForEdit = (banner) => {
        setEditingBanner(banner);
        setValue('title', banner.title);
        setValue('description', banner.description);
        setValue('imageUrl', banner.imageUrl);
        setValue('link', banner.link);
        setValue('order', banner.order);
        setValue('isActive', banner.isActive);
    };

    const cancelEdit = () => {
        setEditingBanner(null);
        reset();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <Settings className="text-indigo-600" />
                Cấu hình hệ thống
            </h1>

            {/* Tabs */}
            <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-fit">
                <button
                    onClick={() => setActiveTab('banners')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'banners' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <Image size={18} /> Quản lý Banner
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'notifications' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <Bell size={18} /> Thông báo hệ thống
                </button>
                <button
                    onClick={() => setActiveTab('maintenance')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'maintenance' ? 'bg-red-100 text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <Power size={18} /> Chế độ bảo trì
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                {activeTab === 'banners' && (
                    <div className="space-y-8">
                        {/* Banner List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {banners.map((banner) => (
                                <div key={banner.id} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all">
                                    <div className="aspect-video relative">
                                        <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button onClick={() => loadBannerForEdit(banner)} className="p-2 bg-white rounded-full text-indigo-600 hover:bg-gray-100"><Settings size={18} /></button>
                                            <button onClick={() => deleteBanner(banner.id)} className="p-2 bg-white rounded-full text-red-600 hover:bg-gray-100"><Trash2 size={18} /></button>
                                        </div>
                                        {!banner.isActive && (
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-gray-900/80 text-white text-xs rounded font-bold">Ẩn</div>
                                        )}
                                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                                            Thứ tự: {banner.order}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-800 truncate">{banner.title}</h3>
                                        <p className="text-sm text-gray-500 truncate">{banner.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Edit/Create Form */}
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-200 border-dashed">
                            <h3 className="font-bold text-lg mb-4 text-gray-800">{editingBanner ? 'Cập nhật Banner' : 'Thêm Banner Mới'}</h3>
                            <form onSubmit={handleSubmit(onSubmitBanner)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                                    <input {...register('title', { required: true })} className="input-field" placeholder="Tiêu đề banner" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Link chuyển hướng</label>
                                    <input {...register('link')} className="input-field" placeholder="/chapter/1" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Ảnh URL</label>
                                    <input {...register('imageUrl', { required: true })} className="input-field" placeholder="https://..." />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Mô tả</label>
                                    <input {...register('description')} className="input-field" placeholder="Mô tả ngắn..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Thứ tự hiển thị</label>
                                    <input type="number" {...register('order')} className="input-field" defaultValue={1} />
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" {...register('isActive')} className="w-5 h-5 accent-indigo-600 rounded" defaultChecked />
                                        <span className="font-medium text-gray-700">Hiển thị ngay</span>
                                    </label>
                                </div>
                                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                                    {editingBanner && (
                                        <button type="button" onClick={cancelEdit} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300">Hủy</button>
                                    )}
                                    <button type="submit" className="btn btn-primary flex items-center gap-2">
                                        <Save size={18} /> {editingBanner ? 'Lưu thay đổi' : 'Thêm mới'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="text-center py-12 text-gray-500">
                        Tính năng Quản lý Thông báo đang được phát triển...
                    </div>
                )}

                {activeTab === 'maintenance' && (
                    <div className="max-w-xl mx-auto text-center py-12">
                        <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 transition-colors ${systemConfig.maintenanceMode ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            <Power size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {systemConfig.maintenanceMode ? 'Hệ thống đang BẢO TRÌ' : 'Hệ thống đang hoạt động'}
                        </h2>
                        <p className="text-gray-500 mb-8">
                            {systemConfig.maintenanceMode
                                ? 'Người dùng thường sẽ không thể truy cập trang web. Chỉ Admin mới có thể truy cập.'
                                : 'Trang web hoạt động bình thường.'}
                        </p>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 text-left">
                            <label className="block text-sm font-medium mb-2">Thông báo bảo trì</label>
                            <textarea
                                className="input-field min-h-[100px]"
                                value={systemConfig.maintenanceMessage}
                                onChange={(e) => setSystemConfig({ ...systemConfig, maintenanceMessage: e.target.value })}
                                placeholder="Nhập tin nhắn thông báo..."
                            ></textarea>
                        </div>

                        <button
                            onClick={toggleMaintenance}
                            className={`btn px-8 py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 w-full transition-all ${systemConfig.maintenanceMode
                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30'
                                : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30'
                                }`}
                        >
                            <Power size={24} />
                            {systemConfig.maintenanceMode ? 'Tắt chế độ bảo trì' : 'Bật chế độ bảo trì'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemSettings;
