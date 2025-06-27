# إعداد Firebase Storage - حل مشكلة CORS

## 🚨 المشكلة الحالية:
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' 
has been blocked by CORS policy
```

## 🔧 الحلول:

### الحل الأول: إعداد Firebase Storage Rules (الأسهل)

1. **اذهب إلى Firebase Console:**
   - https://console.firebase.google.com
   - اختر مشروع `lbeh-81936`

2. **اذهب إلى Storage:**
   - من القائمة الجانبية → Storage
   - انقر على "Rules"

3. **حدث القواعد:**
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

4. **انقر "Publish"**

### الحل الثاني: إعداد CORS عبر Google Cloud (متقدم)

إذا لم يعمل الحل الأول، استخدم Google Cloud Console:

1. **تثبيت Google Cloud CLI:**
```bash
# macOS
brew install google-cloud-sdk

# أو تحميل من الموقع
# https://cloud.google.com/sdk/docs/install
```

2. **تسجيل الدخول:**
```bash
gcloud auth login
gcloud config set project lbeh-81936
```

3. **إنشاء ملف cors.json:**
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "x-goog-resumable"]
  }
]
```

4. **تطبيق إعدادات CORS:**
```bash
gsutil cors set cors.json gs://lbeh-81936.firebasestorage.app
```

### الحل الثالث: استخدام Firebase Admin SDK (الأفضل للإنتاج)

إذا كنت تريد حل أكثر أماناً، يمكن استخدام Firebase Admin SDK من الخادم:

1. **إنشاء Netlify Function لرفع الصور:**
```javascript
// netlify/functions/upload-image.js
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      // مفاتيح Firebase Admin
    }),
    storageBucket: 'lbeh-81936.firebasestorage.app'
  });
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { image, fileName } = JSON.parse(event.body);
    const bucket = admin.storage().bucket();
    const file = bucket.file(`services/${fileName}`);
    
    const buffer = Buffer.from(image, 'base64');
    await file.save(buffer, {
      metadata: { contentType: 'image/jpeg' }
    });
    
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491'
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ url })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

## 🎯 الحل السريع (مؤقت):

إذا كنت تريد حل سريع للتطوير، يمكن تعطيل أمان CORS مؤقتاً:

### Chrome مع تعطيل CORS (للتطوير فقط):
```bash
# macOS/Linux
google-chrome --disable-web-security --user-data-dir="/tmp/chrome_dev_session"

# Windows
chrome.exe --disable-web-security --user-data-dir="c:\temp\chrome_dev_session"
```

⚠️ **تحذير:** لا تستخدم هذا في الإنتاج!

## ✅ التحقق من الحل:

بعد تطبيق أي من الحلول:

1. امسح cache المتصفح
2. اعد تحميل الصفحة
3. جرب رفع صورة
4. يجب أن تظهر رسالة: "✅ تم رفع الصورة بنجاح"

## 🔍 تشخيص المشاكل:

### تحقق من إعدادات Firebase:
1. Storage Rules
2. Authentication (إذا كانت مفعلة)
3. Project Configuration

### تحقق من الشبكة:
1. افتح Developer Tools → Network
2. ابحث عن طلبات فاشلة
3. تحقق من رسائل الخطأ

---

**💡 نصيحة:** الحل الأول (Storage Rules) هو الأسرع والأسهل للبدء. 