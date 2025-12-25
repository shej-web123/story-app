import { useState, useEffect } from 'react';
import { fetchAuditLogs } from '../../services/adminService';
import { ClipboardList, User, BookOpen, MessageSquare, ShieldAlert } from 'lucide-react';

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        const data = await fetchAuditLogs(50);
        setLogs(data);
        setLoading(false);
    };

    const getIcon = (action) => {
        if (action.includes('USER')) return <User size={16} className="text-blue-500" />;
        if (action.includes('STORY')) return <BookOpen size={16} className="text-green-500" />;
        if (action.includes('COMMENT')) return <MessageSquare size={16} className="text-gray-500" />;
        return <ShieldAlert size={16} className="text-red-500" />;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <ClipboardList className="text-indigo-600" />
                Nhật ký hoạt động
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Đang tải nhật ký...</div>
                ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Chưa có hoạt động nào được ghi lại.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-4">Thời gian</th>
                                    <th className="px-6 py-4">Admin</th>
                                    <th className="px-6 py-4">Hành động</th>
                                    <th className="px-6 py-4">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {log.adminName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getIcon(log.action)}
                                                <span className="font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                                                    {log.action}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {log.details}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLog;
