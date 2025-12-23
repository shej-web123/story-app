# 🚀 PUSH TO GITHUB SCRIPT (AUTO-DETECT GIT)

$gitPath = "C:\Program Files\Git\cmd\git.exe"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PUSH CODE TO GITHUB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $gitPath)) {
    Write-Host "❌ Không tìm thấy Git tại: $gitPath" -ForegroundColor Red
    exit
}

Write-Host "👉 Hãy tạo repository trên GitHub trước: https://github.com/new" -ForegroundColor Yellow
Write-Host "   (Không tích 'Initialize with README')" -ForegroundColor Yellow
Write-Host ""
$repoUrl = Read-Host "🔗 Nhập URL repository của bạn (ví dụ: https://github.com/user/repo.git)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "❌ URL không hợp lệ!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Dang cau hinh remote..." -ForegroundColor Yellow
& $gitPath remote remove origin 2>$null
& $gitPath remote add origin $repoUrl

Write-Host "Dang doi nhanh sang main..." -ForegroundColor Yellow
& $gitPath branch -M main

Write-Host "Dang push code (ban co the can dang nhap)..." -ForegroundColor Yellow
& $gitPath push -u origin main

Write-Host ""
if ($?) {
    Write-Host "✅ THÀNH CÔNG! Code đã lên GitHub." -ForegroundColor Green
    Write-Host "👉 Giờ hãy thêm collaborator 'Soetiee2207' trong phần Settings của repo nhé!" -ForegroundColor Cyan
}
else {
    Write-Host "❌ Có lỗi xảy ra khi push." -ForegroundColor Red
}

pause
