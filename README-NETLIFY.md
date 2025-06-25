# 🚀 لبيه - منصة الخدمات المنزلية

<div align="center">

![لبيه](https://img.shields.io/badge/لبيه-منصة_الخدمات-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?style=for-the-badge&logo=typescript)
![Netlify](https://img.shields.io/badge/Netlify-Functions-00C7B7?style=for-the-badge&logo=netlify)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase)

**منصة احترافية لخدمات التوصيل والصيانة المنزلية**

[تشغيل محلي](#-تشغيل-محلي) • [النشر](#-النشر) • [المميزات](#-المميزات) • [الدعم](#-الدعم)

</div>

---

## 📋 نظرة عامة

**لبيه** هي منصة حديثة ومتطورة لتقديم خدمات التوصيل والصيانة المنزلية لأهالي الخارجة والمناطق المحيطة. تم تطويرها باستخدام أحدث التقنيات لضمان تجربة مستخدم استثنائية.

### 🛠️ التقنيات المستخدمة
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Animations
- **Backend**: Netlify Serverless Functions
- **Database**: Firebase Firestore
- **Hosting**: Netlify (Auto-Deploy)
- **Icons**: Lucide React

---

## ⚡ تشغيل محلي

### الطريقة السريعة:
```bash
# 1. تثبيت التبعيات
npm run install-all

# 2. تشغيل الموقع
npm run dev:netlify
```

### أو باستخدام الملف المخصص:
```bash
./run-netlify.sh
```

**الموقع سيعمل على**: http://localhost:8888

---

## 🌐 API Endpoints

### Local Development:
- **Categories**: `http://localhost:8888/.netlify/functions/categories`
- **Services**: `http://localhost:8888/.netlify/functions/services`

### Production:
- **Categories**: `https://your-site.netlify.app/.netlify/functions/categories`
- **Services**: `https://your-site.netlify.app/.netlify/functions/services`

---

## 📦 النشر على Netlify

### 🎯 الطريقة الموصى بها:

1. **ادفع إلى GitHub**:
```bash
git add .
git commit -m "Deploy to Netlify"
git push origin main
```

2. **ربط مع Netlify**:
   - اذهب إلى [Netlify Dashboard](https://app.netlify.com)
   - اختر "New site from Git"
   - اربط مع GitHub Repository

3. **إعدادات البناء**:
   - **Build command**: `cd frontend && npm run build`
   - **Publish directory**: `frontend/dist`
   - **Functions directory**: `netlify/functions`

### 🚀 النشر المباشر:
```bash
# تسجيل الدخول
netlify login

# ربط المشروع
netlify init

# النشر
netlify deploy --prod
```

---

## 🎨 المميزات

### ✨ واجهة المستخدم:
- 🎨 **تصميم عصري**: واجهة احترافية بألوان متناسقة
- 📱 **متجاوب**: يعمل بشكل مثالي على جميع الأجهزة
- ⚡ **سريع**: تحميل سريع وأداء محسن
- 🌟 **أنيميشن**: تأثيرات بصرية جذابة
- 🧭 **سهل الاستخدام**: تجربة مستخدم بديهية

### 🔧 التقنيات:
- ⚡ **Serverless**: بدون خادم، توسع تلقائي
- 🔥 **Firebase**: قاعدة بيانات سحابية موثوقة
- 🌐 **CDN**: شبكة توصيل محتوى عالمية
- 🔒 **آمن**: حماية متقدمة للبيانات
- 📊 **تحليلات**: إحصائيات مفصلة

### 📱 الصفحات:
- 🏠 **الرئيسية**: عرض شامل للخدمات والمميزات
- 📂 **الفئات**: تصفح الخدمات حسب الفئة
- 🛠️ **الخدمات**: تفاصيل كاملة لكل خدمة
- 📞 **اتصل بنا**: معلومات التواصل والموقع
- ℹ️ **من نحن**: معلومات عن الشركة

---

## 📊 الحالة الحالية

### ✅ جاهز ويعمل:
- [x] **Firebase**: متصل وجاهز (3 فئات، 10 خدمات)
- [x] **API**: Netlify Functions تعمل بشكل مثالي
- [x] **Frontend**: واجهة كاملة ومحسنة
- [x] **البيانات**: تم نقل البيانات بنجاح
- [x] **التصميم**: واجهة احترافية ومتجاوبة
- [x] **الأداء**: محسن للسرعة والكفاءة

### 🚀 جاهز للإنتاج:
الموقع **جاهز 100%** للنشر والاستخدام المباشر!

---

## 🗂️ بنية المشروع

```
mawasiem-main/
├── 📁 netlify/
│   └── functions/
│       ├── categories.js    # API الفئات
│       └── services.js      # API الخدمات
├── 📁 frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx     # الصفحة الرئيسية
│   │   │   ├── Categories.tsx
│   │   │   └── Contact.tsx
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── services/
│   │       └── api.ts       # API Client
│   ├── public/
│   │   └── coverr.png       # الصورة الرئيسية
│   └── dist/                # Build Output
├── 📄 netlify.toml         # إعدادات Netlify
├── 📄 firebase.config.js   # إعدادات Firebase
├── 📄 run-netlify.sh       # ملف التشغيل السريع
└── 📄 QUICK-START.md       # دليل التشغيل السريع
```

---

## 🔍 اختبار API

```bash
# اختبار الفئات
curl http://localhost:8888/.netlify/functions/categories

# اختبار الخدمات
curl http://localhost:8888/.netlify/functions/services

# اختبار خدمات فئة معينة
curl "http://localhost:8888/.netlify/functions/services?category=daily_services"
```

---

## 🎯 الخدمات المتاحة

### 🚚 مشاوير داخلية
- توصيل البقالة
- توصيل من الصيدلية
- مشاوير سريعة

### 🗺️ مشاوير خارجية
- توصيل مستندات لمسافات بعيدة
- مشاوير خارج المدينة

### 🔧 صيانة شاملة
- خدمات سباكة
- خدمات كهرباء
- خدمات دهانات
- خدمات تركيب وصيانة

---

## 📞 الدعم

### 🛠️ استكشاف الأخطاء:
1. **تأكد من Netlify CLI**: `netlify --version`
2. **تحقق من Firebase**: راجع Console للأخطاء
3. **اختبر API**: استخدم `curl` لاختبار الـ endpoints
4. **تحقق من البيانات**: راجع Firebase Console

### 📧 التواصل:
- **الموقع**: الخارجة، محافظة الوادي الجديد
- **الهاتف**: 0123-456-789
- **البريد**: info@labeeh.com

---

## 📜 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

<div align="center">

**🎉 تم تطوير الموقع بـ ❤️ لخدمة أهالي الخارجة 🎉**

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/your-site/deploys)

</div> 