import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ClientLayout from './layouts/ClientLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Client Pages
import Home from './pages/client/Home'
import StoryDetail from './pages/client/StoryDetail'
import Library from './pages/client/Library'
import Profile from './pages/client/Profile'
import WriteStory from './pages/client/WriteStory'
import ChapterReader from './pages/client/ChapterReader'
import ExternalLibrary from './pages/client/ExternalLibrary'
import History from './pages/client/History';
import NotFound from './pages/client/NotFound'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import StoryManager from './pages/admin/StoryManager'
import CategoryManager from './pages/admin/CategoryManager'
import UserManager from './pages/admin/UserManager'
import ReportsManager from './pages/admin/ReportsManager';
import AdminLogin from './pages/admin/AdminLogin';

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/register" element={<Register />} />
                <Route path="/register" element={<Register />} />

                {/* Client Routes */}
                <Route element={<ClientLayout />}>
                    <Route index element={<Home />} />
                    <Route path="/story/:storyId" element={<StoryDetail />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="/external-library" element={<ExternalLibrary />} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/write" element={<WriteStory />} />
                    <Route path="/history" element={<History />} />
                </Route>

                {/* Standalone Routes (Reader) */}
                <Route path="/story/:storyId/chapter/:chapterId" element={<ChapterReader />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
                    {/* Note: In real app better to separate AdminGuard */}
                    <Route index element={<AdminDashboard />} />
                    <Route path="stories" element={<StoryManager />} />
                    <Route path="categories" element={<CategoryManager />} />
                    <Route path="users" element={<UserManager />} />
                    <Route path="reports" element={<ReportsManager />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
    );
}

export default App
