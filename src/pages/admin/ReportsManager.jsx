import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { AlertTriangle, Check, X, Shield, Trash2, UserX, MessageSquare, ArrowUpRight } from 'lucide-react';
import { logAdminAction } from '../../services/adminService';
import { MODERATION_ACTIONS } from '../../utils/moderation';
import { useAuth } from '../../context/AuthContext';

const ReportsManager = () => {
    const { user: currentUser } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // pending, resolved, dismissed

    useEffect(() => {
        fetchReports();
    }, [filter]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/reports?status=${filter}&_sort=createdAt&_order=desc`);
            setReports(res.data);
        } catch (error) {
            console.error("Failed to fetch reports", error);
            toast.error("Không thể tải danh sách báo cáo");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (report, action) => {
        if (!confirm('Bạn có chắc chắn muốn thực hiện hành động này?')) return;

        try {
            if (action === 'dismiss') {
                await api.patch(`/reports/${report.id}`, { status: 'dismissed' });
                toast.info('Đã bỏ qua báo cáo');
                logAdminAction(MODERATION_ACTIONS.RESOLVE_REPORT, `Report ID: ${report.id}`, "Dismissed report", currentUser.id, currentUser.name);
            } else if (action === 'delete_content') {
                // Determine endpoint
                const endpoint = report.targetType === 'reply' ? '/replies' : '/comments';
                await api.delete(`${endpoint}/${report.targetId}`);
                await api.patch(`/reports/${report.id}`, { status: 'resolved', resolution: 'Content Deleted' });
                toast.success('Đã xóa nội dung vi phạm');
                logAdminAction(MODERATION_ACTIONS.DELETE_COMMENT, `Comment ID: ${report.targetId}`, "Deleted reported content", currentUser.id, currentUser.name);
            } else if (action === 'ban_user') {
                if (report.targetUserId) {
                    await api.patch(`/users/${report.targetUserId}`, { isBanned: true });
                    // Also delete content likely? Optional. Let's just ban for now.
                    await api.patch(`/reports/${report.id}`, { status: 'resolved', resolution: 'User Banned' });
                    toast.success(`Đã khóa tài khoản ${report.targetUserName || report.targetUserId}`);
                    logAdminAction(MODERATION_ACTIONS.BAN_USER, `User ID: ${report.targetUserId}`, "Banned user from report", currentUser.id, currentUser.name);
                } else {
                    toast.error('Không tìm thấy ID người dùng để Ban');
                }
            }

            // Refresh list
            fetchReports();
        } catch (error) {
            console.error("Action failed", error);
            toast.error("Thao tác thất bại");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-gray-200 pb-2">
                {['pending', 'resolved', 'dismissed'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === status
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {status === 'pending' ? 'Chờ xử lý' : status === 'resolved' ? 'Đã giải quyết' : 'Đã bỏ qua'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-12">Đang tải dữ liệu...</div>
            ) : reports.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm text-center">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Không có báo cáo nào trong mục này.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {reports.map(report => (
                        <div key={report.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${report.targetType === 'comment'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                        }`}>
                                        {report.targetType}
                                    </span>
                                    <span className="text-sm text-gray-400">•</span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(report.createdAt).toLocaleString('vi-VN')}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">Người báo cáo</span>
                                        <span className="font-medium text-gray-900">{report.reporterName}</span>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                        <span className="text-xs font-semibold text-red-400 uppercase block mb-1">Lý do báo cáo</span>
                                        <span className="font-medium text-red-700">{report.reason}</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-semibold text-gray-400 uppercase">Nội dung vi phạm</span>
                                        <Link
                                            to={`/story/${report.storyId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                                        >
                                            Xem trong truyện <ArrowUpRight size={12} />
                                        </Link>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-800 relative group-hover:border-red-200 transition-colors">
                                        "{report.targetContent || 'Nội dung không khả dụng'}"

                                        <div className="absolute top-0 right-0 -mt-3 -mr-2 bg-gray-100 text-xs px-2 py-1 rounded border border-gray-200 text-gray-500">
                                            Bởi: {report.targetUserName} (ID: {report.targetUserId})
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {filter === 'pending' && (
                                <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase hidden md:block mb-2">Hành động</h4>

                                    <button
                                        onClick={() => handleAction(report, 'dismiss')}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        <X size={16} /> Bỏ qua
                                    </button>

                                    <button
                                        onClick={() => handleAction(report, 'delete_content')}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} /> Xóa nội dung
                                    </button>

                                    <button
                                        onClick={() => handleAction(report, 'ban_user')}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        <UserX size={16} /> Khóa tài khoản
                                    </button>
                                </div>
                            )}
                            {filter !== 'pending' && (
                                <div className="border-l border-gray-100 pl-6 flex items-center justify-center">
                                    <span className="text-sm text-gray-500 italic">
                                        {report.resolution || 'Đã xử lý'}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReportsManager;
