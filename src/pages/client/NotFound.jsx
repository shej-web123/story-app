import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <div className="bg-red-50 text-red-500 p-6 rounded-full mb-6 animate-bounce">
                <AlertCircle size={48} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404 - Không tìm thấy trang</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
            </p>
            <Link
                to="/"
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 hover:-translate-y-1"
            >
                <Home size={20} />
                Về trang chủ
            </Link>
        </div>
    );
};

export default NotFound;
