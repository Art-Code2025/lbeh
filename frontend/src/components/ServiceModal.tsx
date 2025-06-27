import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Loader2, Image as ImageIcon, MapPin, Clock, DollarSign, Package, Truck, Wrench } from 'lucide-react';
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

// تعريف الخدمات المفصلة
interface ServiceOption {
  id: string;
  name: string;
  icon: string;
}

interface Destination {
  id: string;
  name: string;
  price: number;
  duration: string;
}

interface BaseService {
  name: string;
  icon: string;
  options: ServiceOption[];
}

interface SimpleService extends BaseService {
  price: string;
}

interface ComplexService extends BaseService {
  basePrice: number;
  destinations: Destination[];
}

interface MaintenanceService extends BaseService {
  price: string;
}

const DETAILED_SERVICES = {
  internal_delivery: {
    name: 'خدمة توصيل أغراض داخلي',
    icon: '🚚',
    price: '20 ريال',
    options: [
      { id: 'pharmacy', name: 'صيدلية', icon: '💊' },
      { id: 'grocery', name: 'بقالة', icon: '🛒' },
      { id: 'hospital', name: 'مستشفى', icon: '🏥' },
      { id: 'online_delivery', name: 'توصيلات أونلاين', icon: '📦' }
    ]
  } as SimpleService,
  external_trips: {
    name: 'مشاوير خارجية',
    icon: '🗺️',
    basePrice: 250,
    destinations: [
      { id: 'khamis_mushait', name: 'خميس مشيط', price: 250, duration: '9 ساعات كحد أقصى' },
      { id: 'abha', name: 'أبها', price: 300, duration: '9 ساعات كحد أقصى' }
    ],
    options: [
      { id: 'hospital_booking', name: 'حجز مستشفى', icon: '🏥' },
      { id: 'salon_booking', name: 'حجز مشغل', icon: '💇' },
      { id: 'gardens', name: 'الحدائق', icon: '🌳' },
      { id: 'public_facilities', name: 'المرافق العامة', icon: '🏛️' },
      { id: 'airport', name: 'المطار', icon: '✈️' }
    ]
  } as ComplexService,
  home_maintenance: {
    name: 'صيانة منزلية',
    icon: '🔧',
    price: 'على حسب المطلوب',
    options: [
      { id: 'plumbing', name: 'سباكة', icon: '🚿' },
      { id: 'electrical', name: 'كهرباء', icon: '⚡' },
      { id: 'general_cleaning', name: 'نظافة عامة', icon: '🧹' }
    ]
  } as MaintenanceService
};

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
    serviceType: '', // internal_delivery, external_trips, home_maintenance
    serviceOptions: [] as string[], // Selected options
    destinations: [] as string[], // For external trips
    startLocation: '', // For external trips
    endLocation: '', // For external trips
    urgencyLevel: 'medium' as 'low' | 'medium' | 'high'
  });

  // UI state
  const [newFeature, setNewFeature] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<string>('');

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
          serviceType: editingService.serviceType || '',
          serviceOptions: editingService.serviceOptions || [],
          destinations: editingService.destinations || [],
          startLocation: editingService.startLocation || '',
          endLocation: editingService.endLocation || '',
          urgencyLevel: editingService.urgencyLevel || 'medium'
        });
        setImagePreview(editingService.mainImage || null);
        setSelectedServiceType(editingService.serviceType || '');
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
          serviceType: '',
          serviceOptions: [],
          destinations: [],
          startLocation: '',
          endLocation: '',
          urgencyLevel: 'medium'
        });
        setImagePreview(null);
        setSelectedServiceType('');
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

  const handleServiceTypeChange = (serviceType: string) => {
    setSelectedServiceType(serviceType);
    const serviceConfig = DETAILED_SERVICES[serviceType as keyof typeof DETAILED_SERVICES];
    
    let priceText = '';
    if ('price' in serviceConfig) {
      priceText = serviceConfig.price;
    } else if ('basePrice' in serviceConfig) {
      priceText = `من ${serviceConfig.basePrice} ريال`;
    }
    
    setFormData(prev => ({
      ...prev,
      serviceType,
      name: serviceConfig.name,
      price: priceText,
      serviceOptions: [],
      destinations: []
    }));
  };

  const handleOptionToggle = (optionId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceOptions: prev.serviceOptions.includes(optionId)
        ? prev.serviceOptions.filter(id => id !== optionId)
        : [...prev.serviceOptions, optionId]
    }));
  };

  const handleDestinationToggle = (destinationId: string) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.includes(destinationId)
        ? prev.destinations.filter(id => id !== destinationId)
        : [...prev.destinations, destinationId]
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

    // التحقق من الحقول المطلوبة حسب نوع الخدمة
    if (selectedServiceType === 'external_trips') {
      if (!formData.startLocation || !formData.endLocation) {
        toast.error('يرجى تحديد نقطة الانطلاق ونقطة الوصول للمشاوير الخارجية');
        return;
      }
      if (formData.destinations.length === 0) {
        toast.error('يرجى اختيار وجهة واحدة على الأقل');
        return;
      }
    }

    // تحديث السعر بناءً على الوجهات المختارة للمشاوير الخارجية
    let finalPrice = formData.price;
    if (selectedServiceType === 'external_trips' && formData.destinations.length > 0) {
      const selectedDestinations = formData.destinations.map(destId => {
        const dest = DETAILED_SERVICES.external_trips.destinations.find(d => d.id === destId);
        return dest ? `${dest.name}: ${dest.price} ريال` : '';
      }).filter(Boolean);
      finalPrice = selectedDestinations.join(' | ');
    }

    const serviceData = {
      ...formData,
      price: finalPrice,
      isCloudinaryMainImage: !!formData.mainImage && formData.mainImage.includes('cloudinary')
    };

    onSave(serviceData);
    onClose();
  };

  if (!isOpen) return null;

  const selectedCategory = categories.find(cat => cat.id === formData.category);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
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
          {/* اختيار نوع الخدمة */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              نوع الخدمة *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(DETAILED_SERVICES).map(([key, service]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleServiceTypeChange(key)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-right ${
                    selectedServiceType === key
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">{service.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-sm">{service.name}</h3>
                      <p className="text-gray-400 text-xs">
                        {'price' in service ? service.price : `من ${service.basePrice} ريال`}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* خيارات الخدمة */}
          {selectedServiceType && (
            <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                {selectedServiceType === 'internal_delivery' && <Truck className="w-5 h-5 text-blue-400" />}
                {selectedServiceType === 'external_trips' && <MapPin className="w-5 h-5 text-green-400" />}
                {selectedServiceType === 'home_maintenance' && <Wrench className="w-5 h-5 text-orange-400" />}
                خيارات {DETAILED_SERVICES[selectedServiceType as keyof typeof DETAILED_SERVICES].name}
              </h3>
              
              {/* خيارات الخدمة */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {DETAILED_SERVICES[selectedServiceType as keyof typeof DETAILED_SERVICES].options.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleOptionToggle(option.id)}
                    className={`p-3 rounded-lg border transition-all duration-200 text-center ${
                      formData.serviceOptions.includes(option.id)
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-lg mb-1">{option.icon}</div>
                    <div className="text-xs font-medium">{option.name}</div>
                  </button>
                ))}
              </div>

              {/* خيارات المشاوير الخارجية */}
              {selectedServiceType === 'external_trips' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      الوجهات المتاحة *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {DETAILED_SERVICES.external_trips.destinations.map(destination => (
                        <button
                          key={destination.id}
                          type="button"
                          onClick={() => handleDestinationToggle(destination.id)}
                          className={`p-4 rounded-lg border transition-all duration-200 text-right ${
                            formData.destinations.includes(destination.id)
                              ? 'border-green-500 bg-green-500/20 text-green-300'
                              : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-semibold text-lg">{destination.name}</div>
                              <div className="text-xs text-gray-400">{destination.duration}</div>
                            </div>
                            <div className="text-yellow-400 font-bold text-xl">{destination.price} ريال</div>
                          </div>
                          <div className="text-xs text-gray-400 text-right">
                            مدة الرحلة: {destination.duration}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        نقطة الانطلاق *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.startLocation}
                          onChange={(e) => setFormData(prev => ({ ...prev, startLocation: e.target.value }))}
                          className="w-full pl-4 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="مثال: الخارجة - حي السلام"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        نقطة الوصول *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.endLocation}
                          onChange={(e) => setFormData(prev => ({ ...prev, endLocation: e.target.value }))}
                          className="w-full pl-4 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="مثال: خميس مشيط - المستشفى العام"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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

          {/* السعر - يظهر فقط للتوصيل الداخلي أو إذا لم يكن مشاوير خارجية */}
          {selectedServiceType !== 'home_maintenance' && (
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                السعر {selectedServiceType === 'external_trips' ? '(سيتم تحديده حسب الوجهة المختارة)' : ''}
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
                  placeholder={selectedServiceType === 'internal_delivery' ? 'مثال: 20 ريال' : 'سيتم تحديده تلقائياً'}
                  readOnly={selectedServiceType === 'external_trips'}
                />
              </div>
            </div>
          )}

          {/* رسالة خاصة للصيانة المنزلية */}
          {selectedServiceType === 'home_maintenance' && (
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Wrench className="w-6 h-6 text-orange-400" />
                <div>
                  <h4 className="text-orange-300 font-semibold">خدمة الصيانة المنزلية</h4>
                  <p className="text-orange-200 text-sm mt-1">
                    السعر يتم تحديده حسب نوع الصيانة المطلوبة والمواد المستخدمة
                  </p>
                </div>
              </div>
            </div>
          )}

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