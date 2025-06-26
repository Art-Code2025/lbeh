# إعداد Cloudinary لرفع الصور

## 1. إنشاء حساب Cloudinary

1. اذهب إلى [cloudinary.com](https://cloudinary.com)
2. أنشئ حساب مجاني
3. ادخل إلى Dashboard

## 2. الحصول على بيانات الاعتماد

من لوحة التحكم، ستجد:
- **Cloud Name** (اسم السحابة)
- **API Key** (مفتاح API)
- **API Secret** (سر API)

## 3. إنشاء Upload Preset

1. اذهب إلى Settings → Upload
2. انقر على "Add upload preset"
3. اختر:
   - **Preset name**: `labeeh-images`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `labeeh/services` (اختياري)
   - **Format**: `Auto`
   - **Quality**: `Auto`
   - **Max file size**: `10MB`

4. احفظ الإعدادات

## 4. إعداد متغيرات البيئة

أنشئ ملف `.env.local` في مجلد `frontend` وأضف:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=labeeh-images
```

## 5. اختبار الرفع

1. شغل المشروع: `npm run dev`
2. اذهب إلى Dashboard → إدارة الخدمات
3. أضف خدمة جديدة مع صورة
4. تأكد من ظهور "☁️ Cloudinary" على الصورة

## 6. مميزات Cloudinary

- ✅ رفع تلقائي للصور
- ✅ ضغط وتحسين تلقائي
- ✅ CDN سريع عالمياً
- ✅ تحويل تلقائي للتنسيقات الحديثة (WebP)
- ✅ حماية من الروابط المباشرة
- ✅ إحصائيات مفصلة

## 7. حل المشاكل الشائعة

### خطأ "Invalid cloud name"
- تأكد من صحة `VITE_CLOUDINARY_CLOUD_NAME`
- تأكد من عدم وجود مسافات

### خطأ "Invalid upload preset"
- تأكد من إنشاء Upload Preset بنفس الاسم
- تأكد من أن Signing Mode = "Unsigned"

### الصور لا ترفع
- تحقق من حجم الصورة (أقل من 10MB)
- تحقق من نوع الملف (صور فقط)
- تحقق من اتصال الإنترنت

## 8. للإنتاج

للنشر على Netlify أو Vercel، أضف متغيرات البيئة في إعدادات المنصة:

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=labeeh-images
```

## 9. الأمان

- ❌ لا تضع API Secret في Frontend
- ✅ استخدم Upload Presets غير موقعة فقط
- ✅ حدد أحجام وأنواع الملفات المسموحة
- ✅ استخدم Folders لتنظيم الصور 