import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { uploadImageToFirebase, isFirebaseStorageUrl, testFirebaseStorageConnection } from '../services/firebaseStorage';

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
    }
  }, [editingService, isOpen]);

  // اختبار الاتصال عند فتح Modal
  useEffect(() => {
    if (isOpen && !connectionTested) {
      testConnection();
    }
  }, [isOpen]);

  const testConnection = async () => {
    try {
      console.log('🔍 اختبار اتصال Firebase Storage...');
      const isConnected = await testFirebaseStorageConnection();
      if (isConnected) {
        console.log('✅ Firebase Storage جاهز للاستخدام');
        toast.success('Firebase Storage جاهز ومتصل');
      } else {
        console.error('❌ فشل في الاتصال بـ Firebase Storage');
        toast.error('مشكلة في الاتصال بـ Firebase Storage');
      }
      setConnectionTested(true);
    } catch (error) {
      console.error('❌ خطأ في اختبار الاتصال:', error);
      toast.error('خطأ في اختبار الاتصال');
    }
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
      
      console.log('📤 بداية رفع الصورة:', {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type
      });
      
      setUploading(true);
      try {
        const imageUrl = await uploadImageToFirebase(file);
        if (imageUrl) {
          setFormData(prev => ({
            ...prev,
            mainImage: imageUrl
          }));
          console.log('🎉 تم رفع الصورة بنجاح:', imageUrl);
          toast.success('تم رفع الصورة الرئيسية بنجاح');
        } else {
          console.error('❌ فشل في رفع الصورة');
          toast.error('فشل في رفع الصورة');
        }
      } catch (error) {
        console.error('❌ خطأ في رفع الصورة:', error);
        toast.error('فشل في رفع الصورة الرئيسية');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    // التأكد من أن الصور محفوظة في Firebase Storage
    const serviceData = {
      ...formData,
      mainImage: formData.mainImage || '',
    };
    
    console.log('💾 Saving service with Firebase Storage images:', {
      mainImage: serviceData.mainImage ? 'Firebase Storage URL present' : 'No main image',
    });
    
    onSave(serviceData);
    onClose();
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                اسم الخدمة *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                placeholder="أدخل اسم الخدمة"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الفئة *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                وصف مختصر *
              </label>
              <input
                type="text"
                name="homeShortDescription"
                value={formData.homeShortDescription}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                placeholder="وصف مختصر للخدمة"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                وصف تفصيلي
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 resize-none"
                placeholder="وصف تفصيلي للخدمة..."
              />
            </div>
          </div>

          {/* Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                السعر
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                placeholder="مثال: 50 ريال"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                المدة المتوقعة
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                placeholder="مثال: 30 دقيقة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ساعات العمل
              </label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                placeholder="مثال: 24/7"
              />
            </div>
          </div>

          {/* Images */}
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
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الرفع...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        اختر صورة رئيسية
                      </>
                    )}
                  </label>
                  <span className="text-sm text-gray-400">يتم الرفع إلى Firebase Storage - الحد الأقصى: 10 ميجابايت</span>
                </div>
                {formData.mainImage && (
                  <div className="relative inline-block">
                    <img
                      src={formData.mainImage}
                      alt="الصورة الرئيسية"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, mainImage: '' }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      disabled={uploading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {formData.mainImage.includes('firebase.storage') && (
                      <div className="absolute -bottom-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ☁️ Firebase Storage
                      </div>
                    )}
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
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-2">
              {formData.features.map((feature, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg border border-gray-600">
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
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg"
            >
              {editingService ? 'تحديث الخدمة' : 'إضافة الخدمة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal; 