import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Register = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const { register: registerUser } = useAuth();
    const password = watch("password");

    const onSubmit = async (data) => {
        await registerUser(data.email, data.password, data.name);
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Image */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2028&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/80"></div>
                <div className="relative z-10 flex flex-col justify-center px-12 text-white">
                    <h1 className="text-5xl font-bold mb-6">Tham gia cùng chúng tôi</h1>
                    <p className="text-xl text-indigo-100 leading-relaxed">
                        Tạo tài khoản để lưu truyện yêu thích, bình luận và nhận thông báo mới nhất.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-gray-50">
                <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Đăng ký</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Đã có tài khoản? <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">Đăng nhập ngay</Link>
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                                <input
                                    id="name"
                                    type="text"
                                    {...register("name", { required: "Họ tên là bắt buộc" })}
                                    className="input-field"
                                    placeholder="Nguyễn Văn A"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    {...register("email", { required: "Email là bắt buộc" })}
                                    className="input-field"
                                    placeholder="name@example.com"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                                <input
                                    id="password"
                                    type="password"
                                    {...register("password", { required: "Mật khẩu là bắt buộc", minLength: { value: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" } })}
                                    className="input-field"
                                    placeholder="••••••••"
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    {...register("confirmPassword", {
                                        required: "Vui lòng xác nhận mật khẩu",
                                        validate: value => value === password || "Mật khẩu không khớp"
                                    })}
                                    className="input-field"
                                    placeholder="••••••••"
                                />
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full btn btn-primary py-3 text-lg shadow-indigo-500/20"
                        >
                            Đăng ký
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
