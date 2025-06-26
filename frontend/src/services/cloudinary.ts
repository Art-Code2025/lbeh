import { toast } from 'react-toastify';

// Cloudinary configuration - بيانات حقيقية
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'lbeh';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'labeeh-images';

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * رفع صورة واحدة إلى Cloudinary
 */
export const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
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

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('فشل في رفع الصورة');
    }

    const data: CloudinaryResponse = await response.json();
    console.log('✅ تم رفع الصورة بنجاح:', data.secure_url);
    
    return data.secure_url;
  } catch (error) {
    console.error('❌ خطأ في رفع الصورة:', error);
    toast.error('فشل في رفع الصورة. يرجى المحاولة مرة أخرى');
    return null;
  }
};

/**
 * رفع عدة صور إلى Cloudinary
 */
export const uploadMultipleImagesToCloudinary = async (files: File[]): Promise<string[]> => {
  try {
    if (files.length === 0) {
      return [];
    }

    if (files.length > 10) {
      toast.error('يمكن رفع 10 صور كحد أقصى');
      return [];
    }

    toast.info(`جاري رفع ${files.length} صورة...`);

    const uploadPromises = files.map(file => uploadImageToCloudinary(file));
    const results = await Promise.all(uploadPromises);
    
    // تصفية النتائج الفارغة
    const successfulUploads = results.filter(url => url !== null) as string[];
    
    if (successfulUploads.length === files.length) {
      toast.success(`تم رفع جميع الصور بنجاح (${successfulUploads.length})`);
    } else {
      toast.warning(`تم رفع ${successfulUploads.length} من ${files.length} صورة`);
    }

    return successfulUploads;
  } catch (error) {
    console.error('❌ خطأ في رفع الصور:', error);
    toast.error('فشل في رفع الصور');
    return [];
  }
};

/**
 * حذف صورة من Cloudinary
 */
export const deleteImageFromCloudinary = async (imageUrl: string): Promise<boolean> => {
  try {
    // استخراج public_id من الرابط
    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) {
      console.error('لا يمكن استخراج public_id من الرابط');
      return false;
    }

    // ملاحظة: حذف الصور يتطلب API Key و Secret
    // هذا يجب أن يتم من الخادم (Backend) لأسباب الأمان
    console.log('حذف الصورة يتطلب API من الخادم:', publicId);
    
    return true;
  } catch (error) {
    console.error('❌ خطأ في حذف الصورة:', error);
    return false;
  }
};

/**
 * استخراج public_id من رابط Cloudinary
 */
const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return null;
    
    const pathParts = parts.slice(uploadIndex + 2); // تخطي 'upload' و version
    const fileName = pathParts.join('/');
    
    // إزالة امتداد الملف
    return fileName.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
};

/**
 * تحسين جودة الصورة باستخدام Cloudinary transformations
 */
export const optimizeImageUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
} = {}): string => {
  if (!url.includes('cloudinary.com')) {
    return url; // إذا لم تكن صورة من Cloudinary
  }

  const {
    width,
    height,
    quality = 80,
    format = 'auto'
  } = options;

  try {
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    let transformations = [];
    
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);
    
    const transformationString = transformations.join(',');
    
    return `${parts[0]}/upload/${transformationString}/${parts[1]}`;
  } catch {
    return url;
  }
}; 