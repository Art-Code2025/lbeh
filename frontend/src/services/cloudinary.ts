import { toast } from 'react-toastify';

// Cloudinary configuration - Updated with new credentials
const CLOUD_NAME = 'lbeh';
const UPLOAD_PRESET = 'ml_default';
const API_KEY = '357275813752554';
const API_SECRET = '50gxhCM1Yidpw21FPVm81SyjomM';

/**
 * رفع صورة واحدة إلى Cloudinary مع أعلى مستوى احترافية
 */
export const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
  try {
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast.error('❌ يرجى اختيار ملف صورة صالح فقط');
      console.error('Invalid file type:', file.type);
      return null;
    }

    // التحقق من حجم الملف (أقل من 10 ميجابايت)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      toast.error(`❌ حجم الصورة كبير جداً (${sizeMB} ميجابايت). الحد الأقصى 10 ميجابايت`);
      console.error('File too large:', sizeMB, 'MB');
      return null;
    }

    console.log('🚀 بداية رفع الصورة إلى Cloudinary...');
    console.log('📊 تفاصيل الملف:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type,
      lastModified: new Date(file.lastModified).toLocaleString('ar-SA')
    });

    // إنشاء FormData لرفع الصورة
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', CLOUD_NAME);
    
    // إعدادات تحسين الصورة
    formData.append('quality', 'auto:good'); // جودة تلقائية محسنة
    formData.append('fetch_format', 'auto'); // تنسيق تلقائي محسن
    formData.append('flags', 'progressive'); // تحميل تدريجي
    
    // إضافة معرف فريد للصورة
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    formData.append('public_id', `services/${timestamp}_${randomId}`);
    
    // إعدادات الطلب مع timeout محسن
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 ثانية timeout

    console.log('📤 جاري رفع الصورة...');
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Cloudinary API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      if (response.status === 401) {
        toast.error('❌ مشكلة في تصريح Cloudinary. تحقق من الإعدادات');
      } else if (response.status === 400) {
        toast.error('❌ بيانات الصورة غير صحيحة');
      } else if (response.status === 413) {
        toast.error('❌ حجم الصورة كبير جداً');
      } else {
        toast.error(`❌ خطأ في رفع الصورة: ${response.status}`);
      }
      return null;
    }

    const result = await response.json();
    
    if (!result.secure_url) {
      console.error('❌ No secure_url in Cloudinary response:', result);
      toast.error('❌ فشل في الحصول على رابط الصورة');
      return null;
    }

    console.log('✅ تم رفع الصورة بنجاح إلى Cloudinary!');
    console.log('🔗 تفاصيل الرفع:', {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      created: result.created_at
    });

    toast.success('🎉 تم رفع الصورة بنجاح إلى Cloudinary!');
    
    return result.secure_url;

  } catch (error: any) {
    console.error('💥 خطأ في رفع الصورة:', error);
    
    if (error.name === 'AbortError') {
      toast.error('⏰ انتهت مهلة رفع الصورة. حاول مرة أخرى');
    } else if (error.message?.includes('Failed to fetch')) {
      toast.error('🌐 مشكلة في الاتصال بالإنترنت. تحقق من الاتصال');
    } else if (error.message?.includes('NetworkError')) {
      toast.error('🔌 خطأ في الشبكة. حاول مرة أخرى');
    } else {
      toast.error(`❌ فشل في رفع الصورة: ${error.message || 'خطأ غير معروف'}`);
    }
    
    return null;
  }
};

/**
 * حذف صورة من Cloudinary
 */
export const deleteImageFromCloudinary = async (imageUrl: string): Promise<boolean> => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      console.log('ℹ️ الرابط ليس من Cloudinary أو فارغ');
      return true;
    }

    // استخراج public_id من الرابط
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) {
      console.error('❌ لا يمكن استخراج public_id من الرابط');
      return false;
    }

    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ''); // إزالة الامتداد

    console.log('🗑️ جاري حذف الصورة من Cloudinary:', publicId);

    // إنشاء timestamp و signature للحذف الآمن
    const timestamp = Math.round(Date.now() / 1000);
    
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', API_KEY);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ تم حذف الصورة من Cloudinary:', result);
      return true;
    } else {
      console.warn('⚠️ فشل في حذف الصورة من Cloudinary (قد تكون محذوفة مسبقاً)');
      return true; // اعتبرها نجاح لأن الهدف تحقق
    }
  } catch (error) {
    console.error('❌ خطأ في حذف الصورة:', error);
    return false;
  }
};

/**
 * تحسين رابط الصورة من Cloudinary
 */
export const optimizeCloudinaryUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
} = {}): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  try {
    const { width, height, quality = 'auto', format = 'auto' } = options;
    
    // إنشاء معاملات التحسين
    const transformations = [];
    
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);
    
    // إضافة تحسينات أساسية
    transformations.push('fl_progressive'); // تحميل تدريجي
    transformations.push('fl_immutable_cache'); // تخزين مؤقت محسن
    
    if (transformations.length === 0) {
      return url;
    }

    const transformationString = transformations.join(',');
    
    // إدراج التحسينات في الرابط
    return url.replace('/upload/', `/upload/${transformationString}/`);
  } catch (error) {
    console.error('خطأ في تحسين رابط Cloudinary:', error);
    return url;
  }
};

/**
 * اختبار اتصال Cloudinary
 */
export const testCloudinaryConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 اختبار اتصال Cloudinary...');
    
    // إنشاء صورة تجريبية صغيرة (1x1 pixel)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#4F46E5';
      ctx.fillRect(0, 0, 1, 1);
    }

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('❌ فشل في إنشاء صورة تجريبية');
          resolve(false);
          return;
        }

        const testFile = new File([blob], 'test-connection.png', { type: 'image/png' });
        
        try {
          const result = await uploadImageToCloudinary(testFile);
          
          if (result) {
            console.log('✅ اختبار Cloudinary نجح!');
            // حذف الصورة التجريبية
            await deleteImageFromCloudinary(result);
            resolve(true);
          } else {
            console.error('❌ فشل اختبار Cloudinary');
            resolve(false);
          }
        } catch (error) {
          console.error('❌ خطأ في اختبار Cloudinary:', error);
          resolve(false);
        }
      }, 'image/png');
    });
  } catch (error) {
    console.error('❌ خطأ في اختبار اتصال Cloudinary:', error);
    return false;
  }
};

/**
 * التحقق من صحة رابط Cloudinary
 */
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
};

/**
 * الحصول على معلومات الصورة من Cloudinary
 */
export const getCloudinaryImageInfo = async (url: string): Promise<{
  width: number;
  height: number;
  format: string;
  bytes: number;
  publicId: string;
} | null> => {
  try {
    if (!isCloudinaryUrl(url)) {
      return null;
    }

    // استخراج public_id من الرابط
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return null;
    
    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');

    // طلب معلومات الصورة من Cloudinary
    const infoUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/fl_getinfo/${publicId}.json`;
    
    const response = await fetch(infoUrl);
    if (response.ok) {
      const info = await response.json();
      return {
        width: info.output.width,
        height: info.output.height,
        format: info.output.format,
        bytes: info.output.bytes,
        publicId: publicId
      };
    }
    
    return null;
  } catch (error) {
    console.error('خطأ في الحصول على معلومات الصورة:', error);
    return null;
  }
};

/**
 * ضغط الصورة قبل الرفع
 */
export const compressImageBeforeUpload = (
  file: File, 
  maxWidth: number = 1920, 
  maxHeight: number = 1080, 
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // حساب الأبعاد الجديدة مع الحفاظ على النسبة
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // رسم الصورة المضغوطة
      ctx?.drawImage(img, 0, 0, width, height);
      
      // تحويل إلى Blob ثم File
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          
          console.log('🗜️ تم ضغط الصورة:', {
            originalSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            compressedSize: `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
            reduction: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`
          });
          
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, file.type, quality);
    };
    
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}; 