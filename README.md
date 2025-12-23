# StoryApp - Nền Tảng Đọc & Viết Truyện Online

Chào mừng bạn đến với StoryApp! Đây là một ứng dụng web hiện đại cho phép người dùng đọc truyện, viết truyện và quản lý nội dung.

## 🚀 Cài Đặt & Chạy Dự Án

Để bắt đầu, hãy đảm bảo bạn đã cài đặt [Node.js](https://nodejs.org/).

1.  **Cài đặt thư viện:**
    Mở terminal tại thư mục gốc của dự án và chạy:
    ```bash
    npm install
    ```

2.  **Khởi động Backend (Mock API):**
    Mở một terminal mới và chạy:
    ```bash
    npm run server
    ```
    *Server sẽ chạy tại: `http://localhost:3000`*

3.  **Khởi động Frontend:**
    Mở thêm một terminal khác và chạy:
    ```bash
    npm run dev
    ```
    *Ứng dụng sẽ chạy tại: `http://localhost:5173`*

---

## 🔑 Tài Khoản Quản Trị (Admin)

Sử dụng tài khoản sau để truy cập các tính năng quản trị:

*   **Email:** `admin@example.com` hoặc `admin@test.com`
*   **Mật khẩu:** `admin123`

---

## 📚 Hướng Dẫn Sử Dụng

### 1. Dành Cho Người Đọc (Client)
*   **Trang Chủ:** Khám phá truyện mới, truyện online cập nhật từ nguồn bên ngoài.
*   **Đọc Truyện:** Giao diện đọc truyện tối ưu, hỗ trợ chuyển chương dễ dàng.
*   **Tủ Sách:** Lưu truyện yêu thích để đọc sau.
*   **Kho Sách Online:** Tìm kiếm và đọc truyện từ thư viện mở rộng (Gutendex).

### 2. Dành Cho Tác Giả
*   **Viết Truyện:** Truy cập mục "Viết truyện" để sáng tác tác phẩm của riêng bạn.
*   **Quản Lý Chương:** Thêm, sửa, xóa các chương truyện.

### 3. Dành Cho Quản Trị Viên (Admin)
Sau khi đăng nhập bằng tài khoản Admin, bạn có thể truy cập **Admin Dashboard** từ menu bên trái.

*   **Dashboard (Bảng Điều Khiển):**
    *   Xem thống kê tổng quan: Số lượng truyện, người dùng, danh mục, lượt xem.
    *   **Biểu đồ:** Theo dõi phân bố truyện theo danh mục.
    *   **Hoạt động gần đây:** Xem các truyện vừa được cập nhật.

*   **Quản Lý Truyện:** Duyệt, chỉnh sửa hoặc xóa các truyện vi phạm.
*   **Quản Lý Danh Mục:** Thêm hoặc sửa đổi các thể loại truyện.
*   **Quản Lý Người Dùng:**
    *   Xem danh sách người dùng.
    *   Phân quyền (Chuyển đổi giữa `user` và `admin`).

---

## 🛠 Công Nghệ Sử Dụng
*   **Frontend:** React, Vite, Tailwind CSS
*   **Backend:** JSON Server, JSON Server Auth
*   **Icons:** Lucide React

---

## 📦 Di Chuyển & Triển Khai (Git/ZIP)

### 1. Sử Dụng Git
Khi đẩy code lên Git (GitHub/GitLab...), lưu ý:
*   File `.gitignore` đã được cấu hình để **bỏ qua** thư mục `node_modules` và các file build.
*   **Không** commit folder `node_modules` (vì nó rất nặng và có thể cài đặt lại được).
*   File `db.json` chứa dữ liệu local. Nếu bạn muốn giữ dữ liệu mẫu cho người khác, hãy commit nó. Nếu dữ liệu là riêng tư, hãy thêm `db.json` vào `.gitignore`.

### 2. Gửi File ZIP
Nếu bạn muốn nén dự án để gửi cho người khác:
1.  **Xóa thư mục `node_modules`** trước khi nén (Điều này giúp giảm dung lượng từ hàng trăm MB xuống còn vài MB).
2.  Nén toàn bộ thư mục dự án thành file `.zip`.
3.  **Người nhận:**
    *   Giải nén file.
    *   Mở terminal tại thư mục vừa giải nén.
    *   Chạy `npm install` để tải lại các thư viện.
    *   Chạy `npm run server` và `npm run dev` như bình thường.
