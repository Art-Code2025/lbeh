import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
    detailedImages: [] as string[],
    imageDetails: [] as string[],
    features: [] as string[],
    duration: '',
    availability: '',
    price: ''
  });

  const [newFeature, setNewFeature] = useState('');
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [detailedImageFiles, setDetailedImageFiles] = useState<File[]>([]);

  useEffect(() => {
    if (editingService) {
      setFormData(editingService);
    }
  }, [editingService]);

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          mainImage: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetailedImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const imagePromises = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      const base64Images = await Promise.all(imagePromises);
      setFormData(prev => ({
        ...prev,
        detailedImages: [...prev.detailedImages, ...base64Images]
      }));
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
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {editingService ? 'تعديل خدمة' : 'إضافة خدمة جديدة'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                اسم الخدمة
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الفئة
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
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

          {/* Descriptions */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                وصف مختصر (الصفحة الرئيسية)
              </label>
              <input
                type="text"
                name="homeShortDescription"
                value={formData.homeShortDescription}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                وصف مختصر (صفحة التفاصيل)
              </label>
              <input
                type="text"
                name="detailsShortDescription"
                value={formData.detailsShortDescription}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الوصف الكامل
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="form-textarea"
                required
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الصورة الرئيسية
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  className="hidden"
                  id="mainImage"
                />
                <label
                  htmlFor="mainImage"
                  className="btn-secondary flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  اختر صورة
                </label>
                {formData.mainImage && (
                  <img
                    src={formData.mainImage}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                صور تفصيلية
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleDetailedImagesChange}
                  className="hidden"
                  id="detailedImages"
                />
                <label
                  htmlFor="detailedImages"
                  className="btn-secondary flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  اختر صور
                </label>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                {formData.detailedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Detailed ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          detailedImages: prev.detailedImages.filter((_, i) => i !== index)
                        }));
                        setDetailedImageFiles(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              المميزات
            </label>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                className="form-input flex-1"
                placeholder="أضف ميزة جديدة"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="btn-secondary"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-2">
              {formData.features.map((feature, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                المدة
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="form-input"
                placeholder="مثال: 30-60 دقيقة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                التوفر
              </label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                className="form-input"
                placeholder="مثال: 24/7"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                السعر
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="form-input"
                placeholder="مثال: يبدأ من 50 ريال"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {editingService ? 'حفظ التغييرات' : 'إضافة الخدمة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal; 