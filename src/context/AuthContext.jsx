import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pendingNavigation, setPendingNavigation] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                setUser(JSON.parse(storedUser));
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    // Handle navigation after user state is set
    useEffect(() => {
        if (pendingNavigation && user) {
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
            setPendingNavigation(null);
        }
    }, [user, pendingNavigation, navigate]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            const { accessToken, user } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            setPendingNavigation('login'); // Trigger navigation via useEffect
            toast.success('Đăng nhập thành công!');
            return true;
        } catch (error) {
            toast.error(error.response?.data || 'Đăng nhập thất bại');
            return false;
        }
    };

    const register = async (email, password, name) => {
        try {
            const response = await api.post('/register', { email, password, name, role: 'user' });
            const { accessToken, user } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            toast.success('Đăng ký thành công!');

            // Always navigate to home for regular users
            navigate('/');
            return true;
        } catch (error) {
            toast.error(error.response?.data || 'Đăng ký thất bại');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
        toast.info('Đã đăng xuất');
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
