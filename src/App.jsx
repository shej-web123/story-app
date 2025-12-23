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

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import StoryManager from './pages/admin/StoryManager'
import CategoryManager from './pages/admin/CategoryManager'
import UserManager from './pages/admin/UserManager'

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Client Routes */}
                <Route element={<ClientLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/story/:id" element={<StoryDetail />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="/external-library" element={<ExternalLibrary />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/write" element={<WriteStory />} />
                </Route>

                {/* Standalone Routes (Reader) */}
                <Route path="/story/:storyId/chapter/:chapterId" element={<ChapterReader />} />

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="stories" element={<StoryManager />} />
                        <Route path="categories" element={<CategoryManager />} />
                        <Route path="users" element={<UserManager />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    )
}

export default App
