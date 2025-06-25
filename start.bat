@echo off
chcp 65001 >nul
echo.
echo 🚀 بدء تشغيل منصة لبيه للخدمات المتنوعة
echo ===============================================
echo.

:: التحقق من وجود Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js غير مثبت. يرجى تثبيته أولاً
    pause
    exit /b 1
)

:: إنشاء مجلدات ضرورية إذا لم تكن موجودة
echo 📁 إنشاء المجلدات المطلوبة...
if not exist "public\images" mkdir "public\images"

:: بدء الخادم في الخلفية
echo 🔧 بدء تشغيل الخادم الخلفي...
start /b node server.js

:: انتظار قليل للتأكد من تشغيل الخادم
timeout /t 3 /nobreak >nul

echo ✅ الخادم يعمل على http://localhost:3001

:: الانتقال لمجلد frontend
echo 🎨 بدء تشغيل واجهة المستخدم...
cd frontend

:: تثبيت التبعيات إذا لم تكن مثبتة
if not exist "node_modules" (
    echo 📦 تثبيت تبعيات واجهة المستخدم...
    call npm install
)

:: تشغيل frontend
echo 🌟 تشغيل واجهة المستخدم...
start /b npm run dev

:: انتظار قليل للتأكد من تشغيل frontend
timeout /t 5 /nobreak >nul

echo.
echo 🎉 تم تشغيل منصة لبيه بنجاح!
echo ===============================================
echo 🖥️  واجهة المستخدم: http://localhost:5173
echo ⚙️  الخادم الخلفي: http://localhost:3001
echo 🔧 لوحة التحكم: http://localhost:5173/dashboard
echo.
echo للإيقاف: اضغط Ctrl+C في نوافذ الخدمات
echo ===============================================
echo.

:: فتح المتصفح
echo 🌐 فتح المتصفح...
start http://localhost:5173

echo برنامج لبيه جاهز للاستخدام!
echo لإيقاف الخدمات، أغلق نوافذ الخدمات أو أعد تشغيل الجهاز
pause 