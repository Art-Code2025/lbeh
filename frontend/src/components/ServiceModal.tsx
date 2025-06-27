import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Loader2, Image as ImageIcon, DollarSign, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import { uploadImageToCloudinary, isCloudinaryUrl } from '../services/cloudinary';
import { Service, Category } from '../services/servicesApi';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: any) => void;
  editingService: any | null;
  categories: Category[];
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingService,
  categories
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    categoryName: '',
    homeShortDescription: '',
    detailsShortDescription: '',
    description: '',
    mainImage: '',
    features: [] as string[],
    price: ''
  });

  // UI state
  const [newFeature, setNewFeature] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Initialize form when modal opens or editing service changes
  useEffect(() => {
    if (isOpen) {
      if (editingService) {
        // Load existing service data
        setFormData({
          name: editingService.name || '',
          category: editingService.category || '',
          categoryName: editingService.categoryName || '',
          homeShortDescription: editingService.homeShortDescription || '',
          detailsShortDescription: editingService.detailsShortDescription || '',
          description: editingService.description || '',
          mainImage: editingService.mainImage || '',
          features: editingService.features || [],
          price: editingService.price || ''
        });
        setImagePreview(editingService.mainImage || null);
      } else {
        // Reset for new service
        setFormData({
          name: '',
          category: '',
          categoryName: '',
          homeShortDescription: '',
          detailsShortDescription: '',
          description: '',
          mainImage: '',
          features: [],
          price: ''
        });
        setImagePreview(null);
      }
    }
  }, [isOpen, editingService]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUploading(false);
      setNewFeature('');
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      categoryName: name === 'category' ? categories.find(c => c.id === value)?.name || '' : prev.categoryName
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      if (imageUrl) {
        setFormData(prev => ({ ...prev, mainImage: imageUrl }));
        setImagePreview(imageUrl);
        toast.success('تم رفع الصورة بنجاح!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('فشل في رفع الصورة');
    } finally {
      setUploading(false);
      // Reset input
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, mainImage: '' }));
    setImagePreview(null);
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
    
    if (uploading) {
      toast.error('يرجى انتظار انتهاء رفع الصورة');
      return;
    }

    if (!formData.name || !formData.category || !formData.homeShortDescription) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const serviceData = {
      ...formData,
      isCloudinaryMainImage: !!formData.mainImage && formData.mainImage.includes('cloudinary')
    };

    onSave(serviceData);
    onClose();
  };

  if (!isOpen) return null;

  const selectedCategory = categories.find(cat => cat.id === formData.category);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-400" />
            {editingService ? 'تحديث الخدمة' : 'إضافة خدمة جديدة'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* الحقول الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                اسم الخدمة *
              </label>
              <input
                id="name"
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
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                required
              >
                <option value="">اختر الفئة</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
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
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 resize-none"
              placeholder="وصف تفصيلي للخدمة..."
            />
          </div>

          {/* السعر */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
              السعر
            </label>
            <div className="relative">
              <DollarSign className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="price"
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full pl-4 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                placeholder="مثال: 20 ريال أو حسب الطلب"
              />
            </div>
            <p className="text-gray-400 text-xs mt-1">
              يمكن ترك هذا الحقل فارغاً إذا كان السعر متغير حسب الطلب
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              الصورة الرئيسية
            </label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                  id="imageUpload"
                />
                <label
                  htmlFor="imageUpload"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                    uploading 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      اختر صورة
                    </>
                  )}
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    حذف الصورة
                  </button>
                )}
              </div>

              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="معاينة الصورة"
                    className="w-64 h-40 object-cover rounded-xl border border-gray-600"
                  />
                  {isCloudinaryUrl(imagePreview) && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Cloudinary
                    </div>
                  )}
                </div>
              )}
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
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
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

          {/* Actions */}
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