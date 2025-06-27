# دليل حل مشاكل Netlify

## المشاكل الشائعة وحلولها:

### 1. مشكلة "Module not found"
**السبب**: ملفات مفقودة أو مسارات استيراد خاطئة
**الحل**: 
- تأكد من أن جميع الملفات المستوردة موجودة
- تحقق من مسارات الاستيراد
- تشغيل `npm run build` محلياً للتأكد من عدم وجود أخطاء

### 2. مشكلة "Build failed"
**السبب**: أخطاء في TypeScript أو مشاكل في التبعيات
**الحل**:
```bash
# تنظيف وإعادة تثبيت التبعيات
rm -rf node_modules frontend/node_modules
npm run clean
npm run install-all
npm run build
```

### 3. مشكلة متغيرات البيئة
**السبب**: متغيرات البيئة غير مضبوطة في Netlify
**الحل**: إضافة المتغيرات في Site Settings > Environment variables

### 4. مشكلة إعدادات البناء
**الحل**: التأكد من إعدادات `netlify.toml`:
```toml
[build]
  publish = "frontend/dist"
  command = "cd frontend && npm install && npm run build"
```

### 5. مشكلة الصور والملفات الثابتة
**السبب**: مسارات الصور خاطئة بعد البناء
**الحل**: استخدام مسارات نسبية أو Cloudinary

## خطوات التشخيص:

1. **اختبار البناء محلياً**:
   ```bash
   npm run build
   ```

2. **فحص السجلات**:
   - اذهب إلى Netlify Dashboard
   - Site overview > Production deploys
   - انقر على آخر deploy فاشل
   - اقرأ Build log بالكامل

3. **اختبار التبعيات**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

4. **فحص ملفات الإنتاج**:
   ```bash
   cd frontend/dist
   ls -la
   ```

## إعدادات Netlify الصحيحة:

### Build settings:
- **Build command**: `cd frontend && npm install && npm run build`
- **Publish directory**: `frontend/dist`
- **Node version**: 18 أو أحدث

### Deploy settings:
- **Branch to deploy**: `main` أو `master`
- **Auto-deploy**: تفعيل

## نصائح للتحسين:

1. **تحسين حجم البناء**:
   - استخدام dynamic imports
   - تقسيم الكود إلى chunks صغيرة

2. **تحسين الأداء**:
   - ضغط الصور
   - استخدام CDN للملفات الثابتة

3. **مراقبة الأخطاء**:
   - فحص Console في المتصفح
   - مراجعة Netlify Function logs

## الحالة الحالية للمشروع:

✅ **تم إصلاح**:
- مشاكل الاستيراد من `services/api`
- أخطاء TypeScript
- إعدادات البناء

✅ **يعمل بنجاح**:
- البناء المحلي
- إعدادات Firebase
- إعدادات Cloudinary
- جميع المكونات الأساسية

🔧 **جاهز للنشر**: المشروع جاهز الآن للنشر على Netlify بدون أخطاء. 