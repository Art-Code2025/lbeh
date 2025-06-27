# 🚨 حل مشكلة CORS في Firebase Storage

## المشكلة:
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' 
has been blocked by CORS policy
```

## ✅ الحل السريع (5 دقائق):

### 1. اذهب إلى Firebase Console:
- افتح: https://console.firebase.google.com
- اختر مشروع: `lbeh-81936`

### 2. اذهب إلى Storage:
- من القائمة الجانبية → **Storage**
- انقر على تبويب **"Rules"**

### 3. استبدل القواعد الحالية بهذه:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

### 4. انقر "Publish"

### 5. انتظر دقيقة واحدة ثم اختبر النظام

---

## 🔍 التحقق من الحل:

1. **في Dashboard:**
   - انقر على "تشخيص Firebase Storage"
   - يجب أن تظهر: "✅ Firebase Storage يعمل بشكل مثالي!"

2. **اختبار رفع صورة:**
   - اذهب إلى الخدمات → إضافة خدمة جديدة
   - ارفع صورة
   - يجب أن تظهر: "✅ تم رفع الصورة بنجاح"

---

## 🛠️ إذا لم يعمل الحل:

### الحل البديل - Google Cloud CLI:

1. **تثبيت Google Cloud CLI:**
```bash
# macOS
brew install google-cloud-sdk
```

2. **تسجيل الدخول:**
```bash
gcloud auth login
gcloud config set project lbeh-81936
```

3. **تطبيق إعدادات CORS:**
```bash
gsutil cors set cors.json gs://lbeh-81936.firebasestorage.app
```

---

## 📞 المساعدة:

إذا استمرت المشكلة:
1. تأكد من أن Firebase Project ID صحيح: `lbeh-81936`
2. تحقق من أن Storage مُفعل في Firebase Console
3. امسح cache المتصفح وأعد المحاولة

---

**⏰ الوقت المتوقع للحل: 2-5 دقائق** 