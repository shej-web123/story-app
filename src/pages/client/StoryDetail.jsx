import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, User, Tag, MessageSquare, Send, ThumbsUp, Star, List, PlayCircle, Clock, Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import Rating from '../../components/Rating';
import CommentSection from '../../components/CommentSection';
import { useAuth } from '../../context/AuthContext';

const StoryDetail = () => {
  const { storyId: id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [category, setCategory] = useState(null);
  const [relatedStories, setRelatedStories] = useState([]);
  const [readingProgress, setReadingProgress] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || id === 'undefined') {
      setError("ID truyện không hợp lệ");
      return;
    }
    // Reset states
    setStory(null);
    setError(null);

    fetchStory();
    fetchChapters();
    checkReadingProgress();
    checkIfSaved();
    fetchRatings();
    window.scrollTo(0, 0);
  }, [id, user]);

  const fetchRatings = async () => {
    try {
      const res = await api.get(`/ratings?storyId=${id}`);
      const ratings = res.data;

      if (user) {
        const userRatingData = ratings.find(r => r.userId === user.id);
        if (userRatingData) {
          setUserRating(userRatingData.value);
        } else {
          setUserRating(0);
        }
      } else {
        setUserRating(0);
      }

      if (ratings.length > 0) {
        const total = ratings.reduce((sum, r) => sum + r.value, 0);
        setAverageRating(total / ratings.length);
        setTotalRatings(ratings.length);
      } else {
        setAverageRating(0);
        setTotalRatings(0);
      }
    } catch (error) {
      console.error("Failed to fetch ratings", error);
    }
  };

  // Re-implement handleRate
  const handleRate = async (value) => {
    if (!user) return;
    try {
      // Check if user already rated
      const existingRating = await api.get(`/ratings?userId=${user.id}&storyId=${id}`);

      if (existingRating.data.length > 0) {
        // Update
        await api.patch(`/ratings/${existingRating.data[0].id}`, { value });
        toast.success("Đã cập nhật đánh giá!");
      } else {
        // Create new
        await api.post('/ratings', {
          userId: user.id,
          storyId: Number(id),
          value,
          createdAt: new Date().toISOString()
        });
        toast.success("Cảm ơn bạn đã đánh giá!");
      }
      // Refresh ratings
      fetchRatings();
      setUserRating(value);
    } catch (error) {
      console.error("Rate error:", error);
      toast.error("Không thể gửi đánh giá");
    }
  };

  const checkReadingProgress = async () => {
    // 1. Check LocalStorage (Fast check)
    const localHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]');
    const localProgress = localHistory.find(h => h.id === Number(id) || h.id === String(id));
    if (localProgress) {
      setReadingProgress(localProgress);
    }

    // 2. Check API if logged in (Source of Truth)
    if (user) {
      try {
        const res = await api.get(`/reading_history?userId=${user.id}&storyId=${id}`);
        if (res.data.length > 0) {
          const data = res.data[0];
          setReadingProgress({
            ...data,
            lastReadChapterId: data.chapterId,
            lastReadChapterTitle: data.chapterTitle
          });
        }
      } catch (error) {
        console.error("Failed to sync reading progress", error);
      }
    }
  };

  const fetchStory = async () => {
    try {
      const res = await api.get(`/stories/${id}`);
      setStory(res.data);
      if (res.data.categoryId) {
        fetchCategory(res.data.categoryId);
        fetchRelatedStories(res.data.categoryId, res.data.id);
      }
    } catch (error) {
      console.error("Failed to fetch story", error);
      setError("Không tìm thấy thông tin truyện hoặc truyện đã bị xóa.");
    }
  };

  const fetchChapters = async () => {
    try {
      const res = await api.get(`/chapters?storyId=${id}&_sort=order&_order=asc`);
      setChapters(res.data);
    } catch (error) {
      console.error("Failed to fetch chapters", error);
    }
  };

  const fetchCategory = async (catId) => {
    try {
      const res = await api.get(`/categories/${catId}`);
      setCategory(res.data);
    } catch (error) {
      console.error("Failed to fetch category", error);
    }
  };

  const fetchRelatedStories = async (catId, currentStoryId) => {
    try {
      const res = await api.get(`/stories?categoryId=${catId}&_limit=4`);
      setRelatedStories(res.data.filter(s => s.id !== currentStoryId).slice(0, 3));
    } catch (error) {
      console.error("Failed to fetch related stories", error);
    }
  };

  const checkIfSaved = async () => {
    if (!user) {
      setIsSaved(false);
      setFavoriteId(null);
      return;
    }
    try {
      const res = await api.get(`/favorites?userId=${user.id}&storyId=${id}`);
      if (res.data.length > 0) {
        setIsSaved(true);
        setFavoriteId(res.data[0].id);
      } else {
        setIsSaved(false);
        setFavoriteId(null);
      }
    } catch (error) {
      console.error("Failed to check favorites", error);
    }
  };

  const handleSaveStory = async () => {
    if (!user) {
      toast.warning('Đăng nhập để lưu truyện vào tủ sách!');
      navigate('/login');
      return;
    }

    try {
      if (isSaved && favoriteId) {
        // Remove from favorites
        await api.delete(`/favorites/${favoriteId}`);
        setIsSaved(false);
        setFavoriteId(null);
        toast.info('Đã xóa khỏi tủ sách');
      } else {
        // Add to favorites
        const storyToSave = {
          userId: user.id,
          storyId: Number(id),
          title: story.title,
          coverUrl: story.coverUrl,
          author: story.author,
          savedAt: new Date().toISOString()
        };
        const res = await api.post('/favorites', storyToSave);
        setIsSaved(true);
        setFavoriteId(res.data.id);
        toast.success('Đã thêm vào tủ sách!');
      }
    } catch (error) {
      console.error('Error saving story:', error);
      toast.error('Có lỗi xảy ra khi lưu truyện');
    }
  };

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <p className="text-xl text-red-500 font-bold mb-4">{error}</p>
      <button onClick={() => navigate('/')} className="text-indigo-600 hover:underline">Quay về trang chủ</button>
    </div>
  );

  if (!story) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl text-gray-500 dark:text-gray-400 animate-pulse">Đang tải thông tin truyện...</div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-20">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-900 mb-10">
        <div className="absolute inset-0">
          <img
            src={story.coverUrl}
            alt={story.title}
            className="w-full h-full object-cover opacity-40 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
        </div>

        <div className="relative z-10 p-6 md:p-12 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-48 md:w-64 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl border-4 border-white/10 mx-auto md:mx-0">
            <img
              src={story.coverUrl}
              alt={story.title}
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="flex-1 text-white text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20">
              <ArrowLeft size={18} /> Quay lại trang chủ
            </Link>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{story.title}</h1>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-6 text-sm md:text-base">
              <span className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg backdrop-blur-md border border-white/10">
                <User size={18} className="text-indigo-400" />
                <span className="text-gray-200">Tác giả:</span>
                <span className="font-semibold">{story.author}</span>
              </span>
              {category && (
                <span className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg backdrop-blur-md border border-white/10">
                  <Tag size={18} className="text-pink-400" />
                  <span className="text-gray-200">Thể loại:</span>
                  <span className="font-semibold">{category.name}</span>
                </span>
              )}
              <span className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${story.status === 'Completed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                {story.status}
              </span>
            </div>

            <div className="flex gap-4 justify-center md:justify-start">
              {chapters.length > 0 ? (
                <Link
                  to={readingProgress ? `/story/${story.id}/chapter/${readingProgress.lastReadChapterId}` : `/story/${story.id}/chapter/${chapters[0].id}`}
                  className="btn bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-indigo-500/30 font-bold text-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <PlayCircle size={24} />
                  {readingProgress ? `Đọc tiếp: ${readingProgress.lastReadChapterTitle}` : 'Đọc ngay'}
                </Link>
              ) : (
                <button disabled className="btn bg-gray-600 text-gray-300 px-8 py-3 rounded-xl font-bold text-lg cursor-not-allowed">
                  Chưa có chương
                </button>
              )}
              <button
                onClick={handleSaveStory}
                className={`btn px-6 py-3 rounded-xl backdrop-blur-sm font-medium transition-all flex items-center gap-2 ${isSaved
                  ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
              >
                {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                {isSaved ? 'Đã lưu' : 'Lưu vào tủ sách'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-8 bg-indigo-600 rounded-full"></span>
              Giới thiệu
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-lg">{story.description}</p>
          </section>

          {/* Chapter List */}
          <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <List size={24} className="text-indigo-600" />
                Danh sách chương ({chapters.length})
              </h3>
            </div>

            {chapters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chapters.map(chapter => (
                  <Link
                    key={chapter.id}
                    to={`/story/${story.id}/chapter/${chapter.id}`}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-between group"
                  >
                    <span className="font-medium truncate">{chapter.title}</span>
                    <span className="text-xs text-gray-400 group-hover:text-indigo-400">Đọc ngay</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Chưa có chương nào được đăng tải.
              </div>
            )}
          </section>

          {/* Comments Section - Real Database Integration */}
          <CommentSection storyId={story.id} />

          {/* Related Stories */}
          {relatedStories.length > 0 && (
            <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-8 bg-pink-500 rounded-full"></span>
                Có thể bạn sẽ thích
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedStories.map(story => (
                  <Link key={story.id} to={`/story/${story.id}`} className="group block">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3">
                      <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{story.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{story.author}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">Thông tin thêm</h3>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-50 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Đánh giá</span>
                <div className="flex flex-col items-end">
                  <div className="flex flex-col items-end">
                    <Rating initialRating={averageRating} readonly />
                    <span className="text-xs text-gray-400 mt-1">({totalRatings} lượt)</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-50 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Lượt xem</span>
                <span className="font-medium dark:text-gray-200">1,234</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-50 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Cập nhật</span>
                <span className="font-medium dark:text-gray-200">2 giờ trước</span>
              </div>

              <div className="pt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Đánh giá của bạn:</p>
                <div className="flex justify-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex justify-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    {user ? (
                      <Rating initialRating={userRating} onRate={handleRate} />
                    ) : (
                      <span className="text-xs text-gray-400 cursor-pointer hover:text-indigo-500 transition-colors" onClick={() => navigate('/login')}>Đăng nhập để đánh giá</span>
                    )}
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

export default StoryDetail;
