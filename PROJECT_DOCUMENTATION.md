# TÀI LIỆU DỰ ÁN STORY APP (FULL)

Tài liệu này tổng hợp toàn bộ thông tin về dự án Story App, bao gồm: Tổng quan; Công nghệ; Kiến trúc; Phân tích mã nguồn chuyên sâu; và Báo cáo kiểm thử tính năng mới nhất.

---

# PHẦN 1: BÁO CÁO TOÀN DIỆN DỰ ÁN

## 1. Giới thiệu Dự án
**Story App** là một nền tảng web ứng dụng đọc truyện trực tuyến hiện đại, hỗ trợ đa nền tảng. Dự án được phát triển với mục tiêu cung cấp trải nghiệm đọc truyện mượt mà, giao diện đẹp mắt và hệ thống quản trị nội dung mạnh mẽ.

### Các tính năng chính:
*   **Phía Người dùng (Client)**:
    *   Đăng ký/Đăng nhập (Authentication).
    *   Tìm kiếm, lọc truyện theo thể loại.
    *   Đọc truyện (hỗ trợ chuyển chương, lưu lịch sử đọc).
    *   Thư viện cá nhân (truyện yêu thích).
    *   Bình luận và trả lời bình luận.
    *   Báo cáo vi phạm (bình luận xấu).
    *   Hồ sơ cá nhân và thống kê đọc.
*   **Phía Quản trị (Admin)**:
    *   Dashboard thống kê tổng quan.
    *   Quản lý Truyện (Thêm/Sửa/Xóa).
    *   Quản lý Người dùng (Khóa/Mở khóa tài khoản).
    *   Hệ thống Báo cáo & Kiểm duyệt (Nhận thông báo, Xử lý vi phạm).

## 2. Công nghệ Sử dụng (Tech Stack)

### 2.1. Frontend (Giao diện)
Dự án được xây dựng dựa trên các công nghệ web hiện đại nhất hiện nay:
*   **Core Framework**: [ReactJS 18](https://react.dev/) - Thư viện UI phổ biến nhất, sử dụng Hooks.
*   **Build Tool**: [Vite 5](https://vitejs.dev/) - Công cụ build siêu tốc, thay thế Create React App.
*   **Ngôn ngữ**: JavaScript (ES6+).
*   **Routing**: [React Router DOM v6](https://reactrouter.com/) - Quản lý điều hướng trang (Client-side routing).
*   **State Management**:
    *   `Context API`: Quản lý trạng thái đăng nhập (`AuthContext`).
    *   `React Hooks` (`useState`, `useEffect`): Quản lý trạng thái cục bộ.

### 2.2. Styling (Giao diện & CSS)
*   **CSS Framework**: [Tailwind CSS 3](https://tailwindcss.com/) - Utility-first CSS framework giúp thiết kế nhanh và nhất quán.
*   **Icons**: [Lucide React](https://lucide.dev/) - Bộ icon hiện đại, nhẹ và đẹp.
*   **UI Helpers**:
    *   `clsx` / `tailwind-merge`: Xử lý class động.
    *   `react-toastify`: Hiển thị thông báo (Toast notification) đẹp mắt.

### 2.3. Backend & Database (Giả lập)
Để phát triển nhanh (Rapid Prototyping), dự án sử dụng Mock Backend mạnh mẽ:
*   **Server**: [JSON Server](https://github.com/typicode/json-server) - Giả lập REST API đầy đủ chức năng.
*   **Authentication**: [JSON Server Auth](https://www.npmjs.com/package/json-server-auth) - Middleware hỗ trợ đăng ký, đăng nhập, bảo vệ route bẳng JWT (JSON Web Token).
*   **HTTP Client**: [Axios](https://axios-http.com/) - Thư viện gọi API chuyên nghiệp.

## 3. Kiến trúc Database (Cơ sở dữ liệu)

Database của dự án là một file JSON (`db.json`) đóng vai trò như một cơ sở dữ liệu NoSQL thu nhỏ.

### 3.1. Cấu trúc File `db.json`
File Database bao gồm các bảng (collections) chính sau:

1.  **`users`**: Lưu thông tin người dùng.
    *   `id`, `email`, `password` (đã mã hóa bcrypt), `name`, `role` ("user" hoặc "admin"), `avatar`, `bio`.
2.  **`stories`**: Lưu thông tin truyện.
    *   `id`, `title`, `description`, `author`, `coverUrl`, `status`, `categoryId`.
3.  **`chapters`**: Lưu nội dung chương truyện.
    *   `id`, `storyId`, `title`, `content` (HTML/Text), `order` (thứ tự chương).
4.  **`categories`**: Danh mục truyện (Tiên hiệp, Ngôn tình...).
5.  **`comments`**: Bình luận của người dùng.
    *   `id`, `userId`, `storyId`, `content`, `createdAt`.
6.  **`replies`**: Trả lời bình luận.
7.  **`reports`**: Dữ liệu báo cáo vi phạm.
    *   `id`, `reporterId` (người báo cáo), `targetId` (ID bình luận bị báo cáo), `reason`, `status` ("pending", "resolved"), `targetContent` (nội dung vi phạm).
8.  **`notifications`**: Thông báo hệ thống.
    *   `id`, `userId` (người nhận), `type` ("report", "system"), `message`, `isRead` (trạng thái đọc).
9.  **`favorites`**: Danh sách truyện yêu thích của user.
10. **`readingHistory`**: Lịch sử đọc truyện (Lưu vị trí chương đang đọc).

### 3.2. Cơ chế Hoạt động
*   Khi ứng dụng chạy lệnh `npm run server`, **JSON Server** sẽ khởi động ở cổng `3000`.
*   Nó tự động tạo ra các REST API endpoints tương ứng với các key trong `db.json`:
    *   `GET /users`: Lấy danh sách user.
    *   `POST /stories`: Tạo truyện mới.
    *   `GET /stories/1?_embed=chapters`: Lấy truyện ID 1 kèm theo danh sách chương (nhờ tính năng relationship của json-server).
*   **JSON Server Auth** can thiệp vào các request `POST /register` và `POST /login` để cấp phát JWT Token, giúp bảo mật các API cần quyền (như `/admin/*`).

## 4. Hướng dẫn Cài đặt & Vận hành (Build & Run)

### 4.1. Yêu cầu Hệ thống
*   **Node.js**: Phiên bản 16 trở lên (Khuyến nghị 18+).
*   **Trình quản lý gói**: npm hoặc yarn.

### 4.2. Cài đặt Dependencies
Mở terminal tại thư mục gốc dự án và chạy:
```bash
npm install
```
Lệnh này sẽ đọc file `package.json` và tải tất cả thư viện cần thiết vào thư mục `node_modules`.

### 4.3. Khởi chạy Môi trường Phát triển (Development)
Dự án cần chạy 2 tiến trình song song (2 cửa sổ terminal):

**Terminal 1: Chạy Mock Database Server**
```bash
npm run server
```
*   Server API sẽ chạy tại: `http://localhost:3000`
*   Đây là nơi lưu trữ dữ liệu thực tế.

**Terminal 2: Chạy Frontend App**
```bash
npm run dev
```
*   Ứng dụng React sẽ chạy tại: `http://localhost:5173`
*   Truy cập trình duyệt theo địa chỉ này để sử dụng web.

### 4.4. Build cho Môi trường Production
Để đóng gói ứng dụng thành các file tĩnh (HTML, CSS, JS) để deploy lên hosting (Vercel, Netlify...):
```bash
npm run build
```
Kết quả build sẽ nằm trong thư mục `dist/`. Bạn có thể upload thư mục này lên bất kỳ Web Server nào.

*Lưu ý: Khi deploy production, bạn cần thay thế JSON Server bằng một Backend thực thụ (Node.js/Express + MongoDB/MySQL) hoặc deploy JSON Server lên một dịch vụ cloud riêng (như Render/Glitch).*

---

# PHẦN 2: BÁO CÁO PHÂN TÍCH MÃ NGUỒN CHUYÊN SÂU

Tài liệu này đi sâu vào các hàm (functions) và logic cốt lõi giúp vận hành hệ thống.

## 1. Hệ thống Xác thực (Authentication System)

Nằm tại: `src/context/AuthContext.jsx`

Hệ thống sử dụng **JWT (JSON Web Token)** để quản lý phiên đăng nhập.

### 1.1. Hàm `login(email, password)`
Hàm này chịu trách nhiệm gửi thông tin đăng nhập lên server và lưu trữ token nếu thành công.

```javascript
const login = async (email, password) => {
    try {
        // 1. Gửi request POST đến endpoint /login (do json-server-auth cung cấp)
        const response = await api.post('/login', { email, password });
        const { accessToken, user } = response.data;

        // 2. Kiểm tra trạng thái bị khóa (BANNED)
        if (user.isBanned) {
            toast.error('Tài khoản của bạn đã bị khóa...');
            return false;
        }

        // 3. Lưu Token và User vào LocalStorage để duy trì đăng nhập khi refresh trang
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // 4. Cập nhật State toàn ứng dụng
        setUser(user);
        return true;
    } catch (error) {
        // ... xử lý lỗi
    }
};
```

### 1.2. Cơ chế tự động đăng nhập (`checkAuth`)
Khi người dùng F5 tải lại trang, ứng dụng sẽ không bắt đăng nhập lại nhờ `useEffect` này:

```javascript
useEffect(() => {
    const checkAuth = async () => {
        // Lấy token từ bộ nhớ trình duyệt
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        // Nếu tồn tại, khôi phục lại session ngay lập tức
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    };
    checkAuth();
}, []);
```

## 2. Lớp Giao tiếp API (API Service Layer)

Nằm tại: `src/services/api.js`

Chúng ta sử dụng kỹ thuật **Interceptors** (đánh chặn) của Axios để tự động đính kèm Token vào mọi request. Điều này giúp code gọn gàng, không cần thủ công thêm header `Authorization` ở từng nơi gọi API.

```javascript
// Tạo instance axios cơ sở
const api = axios.create({
    baseURL: 'http://127.0.0.1:3000',
    // ...
});

// Middleware đánh chặn Request
api.interceptors.request.use(
    (config) => {
        // Lấy token hiện tại
        const token = localStorage.getItem('accessToken');
        
        // Nếu có token, đính kèm vào Header: Authorization: Bearer <token>
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
```

## 3. Logic Đọc & Đồng bộ Trạng thái (Story Logic)

Nằm tại: `src/pages/client/StoryDetail.jsx`

Ứng dụng có cơ chế thông minh để đồng bộ tiến độ đọc giữa `LocalStorage` (cho khách) và `Database` (cho thành viên).

### 3.1. Hàm `checkReadingProgress`
```javascript
const checkReadingProgress = async () => {
    // ƯU TIÊN 1: Kiểm tra nhanh từ LocalStorage (cho trải nghiệm tức thì)
    const localHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]');
    const localProgress = localHistory.find(h => h.id === Number(id));
    if (localProgress) setReadingProgress(localProgress);

    // ƯU TIÊN 2: Nếu đã đăng nhập, gọi API để lấy dữ liệu chuẩn xác nhất từ Server
    if (user) {
        try {
            const res = await api.get(`/reading_history?userId=${user.id}&storyId=${id}`);
            if (res.data.length > 0) {
                setReadingProgress(res.data[0]); // Ghi đè bằng dữ liệu server nếu có
            }
        } catch (error) { console.error(...) }
    }
};
```

## 4. Hệ thống Báo cáo & Thông báo (Notification System)

Đây là tính năng phức tạp nhất, liên kết giữa Client và Admin Panel.

### 4.1. Kích hoạt Báo cáo (`handleReport`)
Nằm tại: `src/components/CommentSection.jsx`

Hàm này thực hiện 2 việc cùng lúc: Lưu báo cáo và Bắn thông báo cho Admin.

```javascript
const handleReport = async () => {
    // BƯỚC 1: Lưu bản ghi Report vào DB
    await api.post('/reports', {
        reporterId: user.id,
        reason: reportReason,
        status: 'pending',
        // ...
    });

    // BƯỚC 2: Tìm và gửi thông báo cho TẤT CẢ Admin
    // Lấy danh sách admin
    const adminsRes = await api.get('/users?role=admin');
    const admins = adminsRes.data;

    // Tạo notification cho từng người
    const notificationPromises = admins.map(admin => 
        api.post('/notifications', {
            userId: admin.id,      // Người nhận (Admin)
            type: 'report',
            message: `${user.name} đã báo cáo một bình luận...`,
            link: '/admin/reports', // Link đích khi click vào
            isRead: false
        })
    );
    await Promise.all(notificationPromises); // Chạy song song cho nhanh
};
```

### 4.2. Hiển thị Thông báo Real-time (Thời gian thực)
Nằm tại: `src/layouts/AdminLayout.jsx`

Sử dụng kỹ thuật **Polling** (Hỏi trộm server) để cập nhật thông báo mới mà không cần F5.

```javascript
useEffect(() => {
    const fetchData = async () => {
        // Gọi API lấy thông báo mới nhất của admin đang đăng nhập
        if (user) {
            const notifRes = await api.get(`/notifications?userId=${user.id}&_sort=createdAt&_order=desc`);
            setNotifications(notifRes.data);
        }
    };

    fetchData(); // Gọi ngay lần đầu
    
    // Cài đặt chu kỳ lặp lại mỗi 30 giây (30000ms)
    const interval = setInterval(fetchData, 30000);
    
    // Dọn dẹp memory khi component bị hủy (unmount)
    return () => clearInterval(interval);
}, [user]);
```

---

# PHẦN 3: BÁO CÁO KIỂM THỬ (LATEST VERIFICATION)

## 1. Sửa lỗi trang Profile (Profile Page Fix)
**Trạng thái**: Đã xác minh (Verified)
Lỗi trang Profile bị trắng đã được khắc phục hoàn toàn.
- **Nguyên nhân**: Do sử dụng `useState` sai cách để gọi API và lỗi render `ProtectedRoute`.
- **Khắc phục**: Sửa lại Hook `useEffect` và cập nhật logic router.
- **Kết quả**: Trang hiển thị đúng thông tin: "Xin chào, [User]", thống kê đọc, lịch sử đọc.

## 2. Hệ thống Thông báo Admin (Admin Notification System)
**Trạng thái**: Đã triển khai (Implemented)
Hệ thống thông báo báo cáo vi phạm đã hoạt động.
- **Luồng**: Người dùng báo cáo -> Admin nhận thông báo -> Click thông báo -> Chuyển đến trang Quản lý Báo cáo.
- **Mã nguồn**: Cập nhật `CommentSection.jsx`, `AdminLayout.jsx`.

## 3. Sửa lỗi Reports Manager
**Trạng thái**: Đã sửa (Fixed)
Khắc phục lỗi đường dẫn "Xem trong truyện" bị sai (404) trong trang Quản lý Báo cáo.
- **Cập nhật**: Chuyển link từ `/stories/:id` sang `/story/:id`.

## Hướng dẫn Kiểm tra thủ công
1.  **User**: Vào đọc truyện -> Báo cáo bình luận.
2.  **Admin**: Kiểm tra icon chuông -> Click thông báo -> Duyệt báo cáo.
