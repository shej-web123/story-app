# 🚀 STORY APP - GITHUB SETUP SCRIPT
# Chạy script này sau khi cài Git

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STORY APP - GIT INITIALIZATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Git
Write-Host "Kiểm tra Git..." -ForegroundColor Yellow
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git chưa được cài đặt!" -ForegroundColor Red
    Write-Host "Tải Git: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Sau khi cài xong, khởi động lại PowerShell và chạy script này again!" -ForegroundColor Yellow
    pause
    exit
}

Write-Host "✅ Git đã được cài đặt!" -ForegroundColor Green
Write-Host ""

# Cấu hình Git (sẽ hỏi user)
Write-Host "Cấu hình Git User..." -ForegroundColor Yellow
$userName = Read-Host "Nhập tên của bạn (ví dụ: Nguyen Van A)"
$userEmail = Read-Host "Nhập email GitHub (ví dụ: your@email.com)"

git config --global user.name "$userName"
git config --global user.email "$userEmail"

Write-Host "✅ Đã cấu hình Git!" -ForegroundColor Green
Write-Host ""

# Khởi tạo Git
Write-Host "Khởi tạo Git repository..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "⚠️  Git repository đã tồn tại, bỏ qua..." -ForegroundColor Yellow
} else {
    git init
    Write-Host "✅ Đã tạo Git repository!" -ForegroundColor Green
}
Write-Host ""

# Add files
Write-Host "Thêm tất cả files..." -ForegroundColor Yellow
git add .
Write-Host "✅ Đã thêm files!" -ForegroundColor Green
Write-Host ""

# Commit
Write-Host "Commit files..." -ForegroundColor Yellow
git commit -m "Initial commit: Story Reading App with Comments & Replies system"
Write-Host "✅ Đã commit!" -ForegroundColor Green
Write-Host ""

# Hướng dẫn tiếp theo
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BƯỚC TIẾP THEO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Tạo repository mới trên GitHub:" -ForegroundColor Yellow
Write-Host "   👉 https://github.com/new" -ForegroundColor White
Write-Host ""
Write-Host "2. Tên repository nên đặt: story-reading-app" -ForegroundColor Yellow
Write-Host "   (hoặc tên bạn thích)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. KHÔNG tích 'Initialize with README'" -ForegroundColor Red
Write-Host ""
Write-Host "4. Sau khi tạo xong, GitHub sẽ hiển thị URL." -ForegroundColor Yellow
Write-Host "   Copy URL đó (dạng: https://github.com/username/repo.git)" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Chạy lệnh sau (thay YOUR_REPO_URL):" -ForegroundColor Yellow
Write-Host ""
Write-Host "   git remote add origin YOUR_REPO_URL" -ForegroundColor Green
Write-Host "   git branch -M main" -ForegroundColor Green
Write-Host "   git push -u origin main" -ForegroundColor Green
Write-Host ""
Write-Host "6. Thêm collaborator 'Soetiee2207':" -ForegroundColor Yellow
Write-Host "   - Vào Settings → Collaborators" -ForegroundColor Gray
Write-Host "   - Add people → Nhập 'Soetiee2207'" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Hoàn tất! Code đã sẵn sàng push 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

pause
