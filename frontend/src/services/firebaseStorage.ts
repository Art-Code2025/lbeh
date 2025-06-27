import { storage } from '../firebase.config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { toast } from 'react-toastify';

/**
 * رفع صورة واحدة إلى Firebase Storage
 */
export const uploadImageToFirebase = async (file: File, folder: string = 'services'): Promise<string | null> => {
  try {
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح');
      return null;
    }

    // التحقق من حجم الملف (أقل من 10 ميجابايت)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت');
      return null;
    }

    // إنشاء اسم فريد للملف
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}_${randomString}.${file.name.split('.').pop()}`;
    
    // إنشاء مرجع للملف
    const storageRef = ref(storage, `${folder}/${fileName}`);
    
    // رفع الملف
    console.log('📤 رفع الصورة إلى Firebase Storage...');
    console.log('📊 معلومات الملف:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type
    });
    
    const snapshot = await uploadBytes(storageRef, file);
    
    // الحصول على رابط التحميل
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('✅ تم رفع الصورة بنجاح:', downloadURL);
    toast.success('تم رفع الصورة بنجاح إلى Firebase Storage');
    
    return downloadURL;
  } catch (error) {
    console.error('❌ خطأ في رفع الصورة:', error);
    toast.error('فشل في رفع الصورة: ' + (error as Error).message);
    return null;
  }
};

/**
 * حذف صورة من Firebase Storage
 */
export const deleteImageFromFirebase = async (imageUrl: string): Promise<boolean> => {
  try {
    // استخراج المسار من الرابط
    const urlParts = imageUrl.split('/');
    const tokenIndex = urlParts.findIndex(part => part.includes('token='));
    
    if (tokenIndex === -1) {
      console.error('Invalid Firebase Storage URL');
      return false;
    }
    
    // استخراج المسار
    const pathPart = urlParts[tokenIndex - 1];
    const decodedPath = decodeURIComponent(pathPart);
    
    // إنشاء مرجع للملف
    const storageRef = ref(storage, decodedPath);
    
    // حذف الملف
    await deleteObject(storageRef);
    
    console.log('✅ تم حذف الصورة بنجاح');
    return true;
  } catch (error) {
    console.error('❌ خطأ في حذف الصورة:', error);
    return false;
  }
};

/**
 * التحقق من صحة رابط Firebase Storage
 */
export const isFirebaseStorageUrl = (url: string): boolean => {
  return url.includes('firebasestorage.googleapis.com');
};

/**
 * اختبار رفع صورة تجريبية للتأكد من عمل النظام
 */
export const testFirebaseStorageConnection = async (): Promise<boolean> => {
  try {
    // إنشاء ملف تجريبي صغير
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#4F46E5';
      ctx.fillRect(0, 0, 100, 100);
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText('Test', 30, 55);
    }
    
    // تحويل إلى blob
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        
        const testFile = new File([blob], 'test-connection.png', { type: 'image/png' });
        
        // محاولة رفع الملف التجريبي
        const result = await uploadImageToFirebase(testFile, 'test');
        
        if (result) {
          console.log('✅ Firebase Storage connection test successful');
          // حذف الملف التجريبي
          await deleteImageFromFirebase(result);
          resolve(true);
        } else {
          console.error('❌ Firebase Storage connection test failed');
          resolve(false);
        }
      }, 'image/png');
    });
  } catch (error) {
    console.error('❌ Firebase Storage connection test error:', error);
    return false;
  }
};

/**
 * ضغط الصورة قبل الرفع (اختياري)
 */
export const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // حساب الأبعاد الجديدة
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // رسم الصورة المضغوطة
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // تحويل إلى Blob ثم File
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file); // إرجاع الملف الأصلي في حالة الفشل
        }
      }, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
}; 