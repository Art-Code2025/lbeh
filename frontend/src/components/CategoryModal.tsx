import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Tag } from 'lucide-react';
import { toast } from 'react-toastify';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  serviceCount: number;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSave: (category: Category) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, category, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    icon: '📦',
    color: 'blue'
  });
  const [loading, setLoading] = useState(false);

  const colorOptions = [
    { value: 'blue', label: 'أزرق', bg: 'bg-blue-500' },
    { value: 'green', label: 'أخضر', bg: 'bg-green-500' },
    { value: 'orange', label: 'برتقالي', bg: 'bg-orange-500' },
    { value: 'purple', label: 'بنفسجي', bg: 'bg-purple-500' },
    { value: 'red', label: 'أحمر', bg: 'bg-red-500' },
    { value: 'yellow', label: 'أصفر', bg: 'bg-yellow-500' },
    { value: 'pink', label: 'وردي', bg: 'bg-pink-500' },
    { value: 'indigo', label: 'نيلي', bg: 'bg-indigo-500' }
  ];

  const iconOptions = [
    '📦', '🚚', '🏠', '🔧', '⚡', '🛠️', '🎯', '📱', 
    '💼', '🌟', '🎨', '🎵', '📚', '🏃‍♂️', '🍽️', '🛒'
  ];

  useEffect(() => {
    if (category) {
      setFormData({
        id: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color
      });
    } else {
      setFormData({
        id: '',
        name: '',
        description: '',
        icon: '📦',
        color: 'blue'
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    setLoading(true);
    
    try {
      // Generate ID if creating new category
      if (!formData.id) {
        formData.id = formData.name.toLowerCase().replace(/\s+/g, '_');
      }

      const newCategory: Category = {
        ...formData,
        serviceCount: category?.serviceCount || 0
      };

      onSave(newCategory);
      toast.success(category ? 'تم تحديث الفئة بنجاح' : 'تم إضافة الفئة بنجاح');
      onClose();
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ الفئة');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {category ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
              </h2>
              <p className="text-gray-400 text-sm">أدخل تفاصيل الفئة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              اسم الفئة *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              placeholder="مثال: الخدمات اليومية"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              وصف الفئة *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 resize-none"
              placeholder="اكتب وصف مختصر للفئة..."
              required
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              أيقونة الفئة
            </label>
            <div className="grid grid-cols-8 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`p-3 text-2xl rounded-lg border-2 transition-all duration-200 ${
                    formData.icon === icon
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              لون الفئة
            </label>
            <div className="grid grid-cols-4 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.color === color.value
                      ? 'border-white bg-gray-700'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${color.bg}`}></div>
                  <span className="text-white text-sm">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">معاينة الفئة</h3>
            <div className="flex items-center gap-4">
              <div className={`text-3xl p-3 bg-${formData.color}-500/20 rounded-lg border border-${formData.color}-500/30`}>
                {formData.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white">
                  {formData.name || 'اسم الفئة'}
                </h4>
                <p className="text-sm text-gray-400">
                  {formData.description || 'وصف الفئة'}
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl font-semibold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {category ? 'تحديث الفئة' : 'إضافة الفئة'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal; 