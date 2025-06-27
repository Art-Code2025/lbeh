import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  uploadImageToCloudinary, 
  deleteImageFromCloudinary, 
  isCloudinaryUrl, 
  testCloudinaryConnection,
  compressImageBeforeUpload,
  optimizeCloudinaryUrl 
} from '../services/cloudinary';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: any) => void;
  editingService: any | null;
  categories: any[];
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingService,
  categories
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    categoryName: '',
    homeShortDescription: '',
    detailsShortDescription: '',
    description: '',
    mainImage: '',
    features: [] as string[],
    duration: '',
    availability: '',
    price: ''
  });

  const [newFeature, setNewFeature] = useState('');
  const [uploading, setUploading] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // UseEffect to sync the uploaded image URL to the main form data
  // This solves the stale state issue when saving the form.
  useEffect(() => {
    if (imagePreview && isCloudinaryUrl(imagePreview)) {
      console.log('🔄 تحديث formData.mainImage مع Cloudinary URL:', imagePreview);
      setFormData(prev => ({
        ...prev,
        mainImage: imagePreview
      }));
    }
  }, [imagePreview]);

  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name || '',
        category: editingService.category || '',
        categoryName: editingService.categoryName || '',
        homeShortDescription: editingService.homeShortDescription || '',
        detailsShortDescription: editingService.detailsShortDescription || editingService.homeShortDescription || '',
        description: editingService.description || editingService.homeShortDescription || '',
        mainImage: editingService.mainImage || '',
        features: editingService.features || [],
        duration: editingService.duration || '',
        availability: editingService.availability || '',
        price: editingService.price || ''
      });
      
      // تعيين معاينة الصورة إذا كانت موجودة
      if (editingService.mainImage) {
        setImagePreview(editingService.mainImage);
      }
    } else {
      // Reset form for new service
      setFormData({
        name: '',
        category: '',
        categoryName: '',
        homeShortDescription: '',
        detailsShortDescription: '',
        description: '',
        mainImage: '',
        features: [],
        duration: '',
        availability: '',
        price: ''
      });
      setImagePreview(null);
    }
  }, [editingService, isOpen]);

  // اختبار الاتصال عند فتح Modal
  useEffect(() => {
    if (isOpen && !connectionTested) {
      testConnection();
    }
  }, [isOpen]);

  const testConnection = async () => {
    console.log('🔍 اختبار اتصال Cloudinary...');
    const isConnected = await testCloudinaryConnection();
    console.log('نتيجة الاختبار:', isConnected ? '✅ متصل' : '❌ غير متصل');
    
    if (isConnected) {
      console.log('✅ Cloudinary جاهز للاستخدام');
      toast.success('🎉 Cloudinary جاهز ومتصل بنجاح!');
    } else {
      console.error('❌ فشل في الاتصال بـ Cloudinary');
      toast.error('❌ مشكلة في الاتصال بـ Cloudinary - تحقق من Upload Presets');
    }
    setConnectionTested(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      categoryName: name === 'category' ? categories.find(c => c.id === value)?.name || '' : prev.categoryName
    }));
  };

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      console.log('📤 بداية رفع الصورة إلى Cloudinary:', {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type
      });
      
      setUploading(true);
      setUploadProgress(0);
      
      try {
        // إنشاء معاينة فورية للصورة
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        
        // محاكاة تقدم الرفع
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);
        
        // ضغط الصورة إذا كانت كبيرة
        let fileToUpload = file;
        if (file.size > 2 * 1024 * 1024) { // أكبر من 2 ميجابايت
          console.log('🗜️ ضغط الصورة قبل الرفع...');
          toast.info('🗜️ جاري ضغط الصورة لتحسين الأداء...');
          fileToUpload = await compressImageBeforeUpload(file, 1920, 1080, 0.85);
        }
        
        const imageUrl = await uploadImageToCloudinary(fileToUpload);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (imageUrl) {
          // Re-enable optimization and set the preview directly.
          // The useEffect hook will handle syncing the final, optimized URL to formData.
          const optimizedUrl = optimizeCloudinaryUrl(imageUrl, {
            quality: 'auto',
            format: 'auto'
          });

          setImagePreview(optimizedUrl);
          
          // تحديث formData مباشرة للتأكد من الحفظ الصحيح
          setFormData(prev => ({
            ...prev,
            mainImage: optimizedUrl
          }));
          
          console.log('🎉 Upload successful, optimized URL generated:', optimizedUrl);
          console.log('📋 تم تحديث formData.mainImage:', optimizedUrl);
          toast.success('🎉 تم رفع الصورة بنجاح!');

        } else {
          console.error('❌ فشل في رفع الصورة');
          toast.error('❌ فشل في رفع الصورة');
          setImagePreview(null);
        }
      } catch (error) {
        console.error('❌ خطأ في رفع الصورة:', error);
        toast.error('❌ فشل في رفع الصورة الرئيسية');
        setImagePreview(null);
      } finally {
        setUploading(false);
        setUploadProgress(0);
        // إعادة تعيين input للسماح بإعادة اختيار نفس الملف
        if (e.target) {
          e.target.value = '';
        }
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, mainImage: '' }));
    setImagePreview(null);
    toast.info('🗑️ تم حذف الصورة');
  };

  const handleChangeImage = () => {
    // تشغيل input الملف لاختيار صورة جديدة
    const fileInput = document.getElementById('mainImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
      toast.success('✅ تم إضافة الميزة');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
    toast.info('🗑️ تم حذف الميزة');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      toast.error('❌ يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    // التأكد من أن الصور محفوظة في Cloudinary
    const serviceData = {
      ...formData,
      mainImage: formData.mainImage || '',
    };
    
    console.log('🔍 تفاصيل البيانات قبل الحفظ:', {
      imagePreview: imagePreview,
      formDataMainImage: formData.mainImage,
      serviceDataMainImage: serviceData.mainImage,
      isCloudinaryPreview: imagePreview ? isCloudinaryUrl(imagePreview) : false,
      isCloudinaryFormData: formData.mainImage ? isCloudinaryUrl(formData.mainImage) : false
    });
    
    console.log('💾 حفظ الخدمة مع صور Cloudinary:', {
      mainImage: serviceData.mainImage ? 'Cloudinary URL موجود' : 'لا توجد صورة رئيسية',
      isCloudinaryMainImage: serviceData.mainImage ? isCloudinaryUrl(serviceData.mainImage) : false,
      featuresCount: serviceData.features.length
    });
    
    onSave(serviceData);
    onClose();
    
    toast.success('🎉 تم حفظ الخدمة بنجاح!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {editingService ? 'تعديل خدمة' : 'إضافة خدمة جديدة'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                اسم الخدمة *
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                autoComplete="organization-title"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                placeholder="أدخل اسم الخدمة"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                الفئة *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                autoComplete="off"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                required
              >
                <option value="" className="bg-gray-700">اختر الفئة</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id} className="bg-gray-700">
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-4">
            <div>
              <label htmlFor="homeShortDescription" className="block text-sm font-medium text-gray-300 mb-2">
                وصف مختصر *
              </label>
              <input
                id="homeShortDescription"
                type="text"
                name="homeShortDescription"
                value={formData.homeShortDescription}
                onChange={handleInputChange}
                autoComplete="off"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                placeholder="وصف مختصر للخدمة"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                وصف تفصيلي
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                autoComplete="off"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 resize-none"
                placeholder="وصف تفصيلي للخدمة..."
              />
            </div>
          </div>

          {/* Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                السعر
              </label>
              <input
                id="price"
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                autoComplete="off"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                placeholder="مثال: 50 ريال"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
                المدة المتوقعة
              </label>
              <input
                id="duration"
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                autoComplete="off"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                placeholder="مثال: 30 دقيقة"
              />
            </div>

            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-300 mb-2">
                ساعات العمل
              </label>
              <input
                id="availability"
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                autoComplete="off"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                placeholder="مثال: 24/7"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الصورة الرئيسية
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="hidden"
                    id="mainImage"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="mainImage"
                    className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg cursor-pointer transition-colors ${
                      uploading 
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الرفع... {uploadProgress}%
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        اختر صورة رئيسية
                      </>
                    )}
                  </label>
                  <span className="text-sm text-gray-400">
                    يتم الرفع إلى Cloudinary - الحد الأقصى: 10 ميجابايت
                  </span>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative inline-block group">
                    <img
                      src={imagePreview}
                      alt="معاينة الصورة الرئيسية"
                      className="w-64 h-40 object-cover rounded-xl border border-gray-600 shadow-lg transition-all duration-300 group-hover:shadow-xl"
                    />
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleChangeImage}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg"
                        disabled={uploading}
                      >
                        <Upload className="w-4 h-4" />
                        تغيير
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg"
                        disabled={uploading}
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </button>
                    </div>
                    
                    {/* Cloudinary Badge */}
                    {formData.mainImage && isCloudinaryUrl(formData.mainImage) && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <span>☁️</span>
                        <span>Cloudinary</span>
                      </div>
                    )}
                    
                    {/* Upload Progress Overlay */}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center">
                        <div className="text-center text-white">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                          <p className="text-sm">جاري الرفع... {uploadProgress}%</p>
                          <div className="w-32 bg-gray-700 rounded-full h-2 mt-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* No Image Placeholder */}
                {!imagePreview && !uploading && (
                  <div className="w-64 h-40 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center hover:border-gray-500 transition-colors cursor-pointer group"
                       onClick={() => document.getElementById('mainImage')?.click()}>
                    <div className="text-center text-gray-400 group-hover:text-gray-300 transition-colors">
                      <ImageIcon className="w-12 h-12 mx-auto mb-3" />
                      <p className="text-sm font-medium">انقر لإضافة صورة</p>
                      <p className="text-xs">أو اسحب الصورة هنا</p>
                    </div>
                  </div>
                )}

                {/* Upload Progress Bar (when no preview) */}
                {uploading && !imagePreview && (
                  <div className="w-64 space-y-3">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">جاري رفع الصورة... {uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              المميزات
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                placeholder="أضف ميزة جديدة"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                aria-label="New feature"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-2">
              {formData.features.map((feature, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                  <span className="text-white">{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl font-semibold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'جاري الرفع...' : editingService ? 'تحديث الخدمة' : 'إضافة الخدمة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal; 