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
    price: '',
    customQuestions: [] as CustomQuestion[]
  });

  // UI state
  const [newFeature, setNewFeature] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Custom question type
  interface CustomQuestion {
    id: string;
    question: string;
    type: 'text' | 'number' | 'select_single' | 'select_multiple' | 'date' | 'file';
    required: boolean;
    options?: string[];
    placeholder?: string;
  }

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
          price: editingService.price || '',
          customQuestions: editingService.customQuestions || []
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
          price: '',
          customQuestions: []
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
    
    // Set automatic price based on category
    let autoPrice = '';
    if (name === 'category') {
      const selectedCategory = categories.find(c => c.id === value);
      if (selectedCategory) {
        if (value === 'internal_delivery') {
          autoPrice = '20 ريال';
        } else if (value === 'external_trips') {
          autoPrice = 'خميس مشيط: 250 ريال | أبها: 300 ريال';
        } else if (value === 'home_maintenance') {
          autoPrice = 'على حسب المطلوب';
        }
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
      categoryName: name === 'category' ? categories.find(c => c.id === value)?.name || '' : prev.categoryName,
      price: name === 'category' ? autoPrice : prev.price
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

  // Functions to manage custom questions
  const addCustomQuestion = () => {
    const newQ: CustomQuestion = {
      id: `q_${Date.now()}`,
      question: '',
      type: 'text',
      required: false,
      placeholder: ''
    };
    setFormData(prev => ({ ...prev, customQuestions: [...prev.customQuestions, newQ] }));
  };
  const removeCustomQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((_, i) => i !== index)
    }));
  };
  const updateCustomQuestion = (index: number, field: keyof CustomQuestion, value: any) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.map((q, i) => i === index ? { ...q, [field]: value } : q)
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
      isCloudinaryMainImage: !!formData.mainImage && formData.mainImage.includes('cloudinary'),
      customQuestions: formData.customQuestions
    };

    onSave(serviceData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
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
          {/* اختيار الفئة */}
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

          {/* اسم الخدمة */}
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

          {/* وصف مختصر */}
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

          {/* وصف تفصيلي */}
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

          {/* السعر - يتم تعيينه تلقائياً */}
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
                placeholder="سيتم تعيين السعر تلقائياً حسب الفئة"
                readOnly
              />
            </div>
            <p className="text-gray-400 text-xs mt-1">
              يتم تحديد السعر تلقائياً حسب فئة الخدمة المختارة
            </p>
          </div>

          {/* رفع الصورة */}
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

          {/* المميزات */}
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

          {/* Custom Questions Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">الأسئلة المخصصة</label>
            <div className="space-y-3">
              {formData.customQuestions.map((q, idx) => (
                <div key={q.id} className="bg-gray-700/40 p-4 rounded-lg border border-gray-600 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-medium">سؤال {idx + 1}</span>
                    <button type="button" onClick={() => removeCustomQuestion(idx)} className="text-red-400 hover:bg-red-500/20 p-1 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={q.question}
                    onChange={e => updateCustomQuestion(idx,'question',e.target.value)}
                    placeholder="نص السؤال"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={q.type}
                      onChange={e=>updateCustomQuestion(idx,'type',e.target.value)}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      <option value="text">نص</option>
                      <option value="number">رقم</option>
                      <option value="select_single">اختيار واحد</option>
                      <option value="select_multiple">اختيار متعدد</option>
                      <option value="date">تاريخ</option>
                      <option value="file">مرفق</option>
                    </select>
                    <label className="inline-flex items-center text-gray-300 text-sm">
                      <input type="checkbox" checked={q.required} onChange={e=>updateCustomQuestion(idx,'required',e.target.checked)} className="mr-2" />
                      إجباري
                    </label>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addCustomQuestion} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                <Plus className="w-4 h-4" />
                إضافة سؤال
              </button>
            </div>
          </div>

          {/* أزرار التحكم */}
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