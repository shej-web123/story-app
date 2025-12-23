import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Trash2, Edit2, Save, X, MessageCircle, MessageSquare, Reply, Flag, AlertTriangle } from 'lucide-react';

const BAD_WORDS = ['cmn', 'đm', 'vcl', 'đéo', 'ngu', 'chó', 'dm', 'con mẹ', 'chết', 'giết'];

const filterContent = (text) => {
    let filtered = text;
    BAD_WORDS.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filtered = filtered.replace(regex, '***');
    });
    return filtered;
};

const CommentSection = ({ storyId, chapterId = null }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [replyingId, setReplyingId] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    // Reporting State
    const [reportModal, setReportModal] = useState({ open: false, targetType: null, targetId: null, targetUserId: null });
    const [reportReason, setReportReason] = useState('');

    useEffect(() => {
        fetchComments();
    }, [storyId, chapterId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/comments?storyId=${storyId}&_sort=createdAt&_order=desc&_embed=replies`);
            // Client-side filtering:
            // If chapterId provided -> show only that chapter's comments
            // If NO chapterId -> show only general story comments (where chapterId is null/undefined)
            const filteredComments = response.data.filter(c =>
                chapterId ? c.chapterId === parseInt(chapterId) : !c.chapterId
            );
            setComments(filteredComments);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
            toast.error('Không thể tải bình luận');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.warning('Vui lòng đăng nhập để bình luận');
            return;
        }
        if (!newComment.trim()) {
            toast.warning('Nội dung bình luận không được để trống');
            return;
        }

        setSubmitting(true);
        try {
            const commentData = {
                storyId: parseInt(storyId),
                userId: user.id,
                userName: user.name,
                content: filterContent(newComment.trim()),
                chapterId: chapterId ? parseInt(chapterId) : null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const response = await api.post('/comments', commentData);
            setComments([response.data, ...comments]);
            setNewComment('');
            toast.success('Đã đăng bình luận!');
        } catch (error) {
            console.error('Failed to post comment:', error);
            toast.error('Không thể đăng bình luận');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReplySubmit = async (commentId) => {
        if (!user) {
            toast.warning('Vui lòng đăng nhập để trả lời');
            return;
        }
        if (!replyContent.trim()) {
            toast.warning('Nội dung trả lời không được để trống');
            return;
        }

        setSubmittingReply(true);
        try {
            const replyData = {
                commentId: commentId,
                userId: user.id,
                userName: user.name,
                content: filterContent(replyContent.trim()),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const response = await api.post('/replies', replyData);

            // Create notification if replying to someone else
            const parentComment = comments.find(c => c.id === commentId);
            if (parentComment && parentComment.userId !== user.id) {
                try {
                    await api.post('/notifications', {
                        userId: parentComment.userId, // Receiver
                        triggerUserId: user.id, // Sender
                        triggerUserName: user.name,
                        type: 'reply',
                        message: `${user.name} đã trả lời bình luận của bạn`,
                        link: `/story/${storyId}`, // Simple link for now
                        isRead: false,
                        createdAt: new Date().toISOString()
                    });
                } catch (notifError) {
                    console.error('Failed to create notification:', notifError);
                }
            }

            // Update UI by adding new reply to the specific comment
            setComments(comments.map(c => {
                if (c.id === commentId) {
                    return {
                        ...c,
                        replies: [...(c.replies || []), response.data]
                    };
                }
                return c;
            }));

            setReplyingId(null);
            setReplyContent('');
            toast.success('Đã trả lời bình luận!');
        } catch (error) {
            console.error('Failed to post reply:', error);
            toast.error('Không thể đăng câu trả lời');
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editContent.trim()) {
            toast.warning('Nội dung bình luận không được để trống');
            return;
        }

        try {
            const updatedComment = {
                content: editContent.trim(),
                updatedAt: new Date().toISOString()
            };

            await api.patch(`/comments/${commentId}`, updatedComment);
            setComments(comments.map(c =>
                c.id === commentId ? { ...c, ...updatedComment } : c
            ));
            setEditingId(null);
            setEditContent('');
            toast.success('Đã cập nhật bình luận!');
        } catch (error) {
            console.error('Failed to edit comment:', error);
            toast.error('Không thể cập nhật bình luận');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;

        try {
            await api.delete(`/comments/${commentId}`);
            setComments(comments.filter(c => c.id !== commentId));
            toast.success('Đã xóa bình luận!');
        } catch (error) {
            console.error('Failed to delete comment:', error);
            toast.error('Không thể xóa bình luận');
        }
    };

    const handleDeleteReply = async (commentId, replyId) => {
        if (!confirm('Bạn có chắc muốn xóa câu trả lời này?')) return;

        try {
            await api.delete(`/replies/${replyId}`);
            setComments(comments.map(c => {
                if (c.id === commentId) {
                    return {
                        ...c,
                        replies: (c.replies || []).filter(r => r.id !== replyId)
                    };
                }
                return c;
            }));
            toast.success('Đã xóa câu trả lời!');
        } catch (error) {
            console.error('Failed to delete reply:', error);
            toast.error('Không thể xóa câu trả lời');
        }
    };

    const startEditing = (comment) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
        setReplyingId(null); // Cancel reply if editing
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditContent('');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const handleReport = async () => {
        if (!reportReason.trim()) return toast.warning('Vui lòng nhập lý do báo cáo');

        try {
            const reportData = {
                reporterId: user.id,
                reporterName: user.name,
                targetType: reportModal.targetType,
                targetId: reportModal.targetId,
                targetUserId: reportModal.targetUserId,
                reason: reportReason,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            await api.post('/reports', reportData);

            // Notify all admins
            try {
                const adminsRes = await api.get('/users?role=admin');
                const admins = adminsRes.data;

                const notificationPromises = admins.map(admin =>
                    api.post('/notifications', {
                        userId: admin.id,
                        triggerUserId: user.id,
                        triggerUserName: user.name,
                        type: 'report',
                        message: `${user.name} đã báo cáo một ${reportModal.targetType === 'comment' ? 'bình luận' : 'câu trả lời'}`,
                        link: '/admin/reports',
                        isRead: false,
                        createdAt: new Date().toISOString()
                    })
                );
                await Promise.all(notificationPromises);
            } catch (notifError) {
                console.error('Failed to notify admins:', notifError);
            }

            toast.success('Đã gửi báo cáo cho Admin');
            setReportModal({ open: false, targetType: null, targetId: null, targetUserId: null });
            setReportReason('');
        } catch (error) {
            toast.error('Gửi báo cáo thất bại');
        }
    };

    const openReportModal = (type, item) => {
        if (!user) return toast.warning('Cần đăng nhập để báo cáo');
        setReportModal({
            open: true,
            targetType: type,
            targetId: item.id,
            targetUserId: item.userId
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8">
            {/* Report Modal */}
            {reportModal.open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-4 text-red-600">
                            <AlertTriangle size={24} />
                            <h3 className="text-xl font-bold">Báo cáo vi phạm</h3>
                        </div>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                            Bạn đang báo cáo {reportModal.targetType === 'comment' ? 'bình luận' : 'câu trả lời'} này. Hãy cho chúng tôi biết lý do:
                        </p>
                        <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="w-full p-3 border rounded-lg mb-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Ví dụ: Ngôn từ đả kích, spam, ..."
                            rows={3}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setReportModal({ open: false, targetType: null, targetId: null, targetUserId: null })}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleReport}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                            >
                                Gửi báo cáo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2 mb-6">
                <MessageCircle className="text-indigo-600 dark:text-indigo-400" size={24} />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Bình luận ({comments.length})
                </h3>
            </div>

            {/* Comment Form */}
            {user ? (
                <form onSubmit={handleSubmitComment} className="mb-8">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Viết bình luận của bạn..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                        rows="4"
                        disabled={submitting}
                    />
                    <div className="mt-3 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {submitting ? 'Đang đăng...' : 'Đăng bình luận'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-300">
                        Vui lòng <a href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">đăng nhập</a> để bình luận
                    </p>
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải bình luận...</p>
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-12">
                    <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {comment.userName}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(comment.createdAt)}
                                            {comment.updatedAt !== comment.createdAt && ' (đã chỉnh sửa)'}
                                        </span>
                                    </div>

                                    {editingId === comment.id ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
                                                rows="3"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditComment(comment.id)}
                                                    className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                                                >
                                                    <Save size={14} /> Lưu
                                                </button>
                                                <button
                                                    onClick={cancelEditing}
                                                    className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                                                >
                                                    <X size={14} /> Hủy
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                            {comment.content}
                                        </p>
                                    )}
                                </div>

                                {user && user.id === comment.userId && editingId !== comment.id && (
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => startEditing(comment)}
                                            className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                                            title="Sửa"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-2 ml-2 flex items-center gap-4">
                                <button
                                    onClick={() => setReplyingId(replyingId === comment.id ? null : comment.id)}
                                    className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-colors"
                                >
                                    <Reply size={14} /> Trả lời
                                </button>
                                <button
                                    onClick={() => openReportModal('comment', comment)}
                                    className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Báo cáo"
                                >
                                    <Flag size={14} />
                                </button>
                            </div>

                            {/* Reply Input */}
                            {replyingId === comment.id && (
                                <div className="mt-4 ml-8 animate-fade-in">
                                    <div className="flex gap-2">
                                        <textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder={`Trả lời ${comment.userName}...`}
                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
                                            rows="2"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="mt-2 flex justify-end gap-2">
                                        <button
                                            onClick={() => setReplyingId(null)}
                                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium dark:bg-gray-600 dark:text-gray-300"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={() => handleReplySubmit(comment.id)}
                                            disabled={!replyContent.trim() || submittingReply}
                                            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                                        >
                                            {submittingReply ? 'Đang gửi...' : 'Gửi'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Replies List */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-4 ml-8 space-y-4 border-l-2 border-gray-100 dark:border-gray-700 pl-4">
                                    {comment.replies.map(reply => (
                                        <div key={reply.id} className="flex items-start justify-between bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                                        {reply.userName}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDate(reply.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                    {reply.content}
                                                </p>
                                            </div>
                                            {user && user.id === reply.userId ? (
                                                <button
                                                    onClick={() => handleDeleteReply(comment.id, reply.id)}
                                                    className="flex items-center gap-1 text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={14} /> Xóa
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => openReportModal('reply', reply)}
                                                    className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors ml-auto"
                                                    title="Báo cáo"
                                                >
                                                    <Flag size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentSection;
