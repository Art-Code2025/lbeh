import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, User, Clock, Package, Truck, Wrench, Star, Send, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { createBooking } from '../services/bookingsApi';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: any;
}

// تعريف الخدمات المفصلة حسب الفئات
const CATEGORY_SERVICES = {
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
  },
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
  },
  home_maintenance: {
    name: 'صيانة منزلية',
    icon: '🔧',
    price: 'على حسب المطلوب',
    options: [
      { id: 'plumbing', name: 'سباكة', icon: '🚿' },
      { id: 'electrical', name: 'كهرباء', icon: '⚡' },
      { id: 'general_cleaning', name: 'نظافة عامة', icon: '🧹' }
    ]
  }
};

function BookingModal({ isOpen, onClose, service }: BookingModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    serviceDetails: '',
    selectedOptions: [] as string[],
    selectedDestination: '',
    startLocation: '',
    endLocation: '',
    appointmentTime: '',
    urgencyLevel: 'medium' as 'low' | 'medium' | 'high',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [estimatedPrice, setEstimatedPrice] = useState<string>('');

  // تحديد فئة الخدمة عند فتح المودال
  useEffect(() => {
    if (isOpen) {
      if (service && service.category) {
        setSelectedCategory(service.category);
      } else {
        setSelectedCategory('');
      }
      // إعادة تعيين النموذج
      setFormData({
        fullName: '',
        phoneNumber: '',
        address: '',
        serviceDetails: '',
        selectedOptions: [],
        selectedDestination: '',
        startLocation: '',
        endLocation: '',
        appointmentTime: '',
        urgencyLevel: 'medium',
        notes: ''
      });
    }
  }, [isOpen, service]);

  // حساب السعر المتوقع
  useEffect(() => {
    if (selectedCategory === 'internal_delivery') {
      setEstimatedPrice('20 ريال');
    } else if (selectedCategory === 'external_trips' && formData.selectedDestination) {
      const destination = CATEGORY_SERVICES.external_trips.destinations.find(
        d => d.id === formData.selectedDestination
      );
      if (destination) {
        setEstimatedPrice(`${destination.price} ريال`);
      }
    } else if (selectedCategory === 'home_maintenance') {
      setEstimatedPrice('سعر متغير - حسب نوع الصيانة');
    } else {
      setEstimatedPrice('');
    }
  }, [selectedCategory, formData.selectedDestination]);

  const handleOptionToggle = (optionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedOptions: prev.selectedOptions.includes(optionId)
        ? prev.selectedOptions.filter(id => id !== optionId)
        : [...prev.selectedOptions, optionId]
    }));
  };

  const handleDestinationSelect = (destinationId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedDestination: destinationId
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      toast.error('❌ يرجى اختيار نوع الخدمة أولاً');
      return;
    }

    if (!formData.fullName || !formData.phoneNumber || !formData.address) {
      toast.error('❌ يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // التحقق من الحقول المطلوبة حسب نوع الخدمة
    if (selectedCategory === 'external_trips') {
      if (!formData.selectedDestination) {
        toast.error('❌ يرجى اختيار وجهة للمشوار الخارجي');
        return;
      }
      if (!formData.startLocation || !formData.endLocation) {
        toast.error('❌ يرجى تحديد نقطة الانطلاق ونقطة الوصول');
        return;
      }
    }

    if (selectedCategory === 'home_maintenance' && !formData.serviceDetails) {
      toast.error('❌ يرجى وصف نوع الصيانة المطلوبة');
      return;
    }

    try {
      setSubmitting(true);
      
      // تحضير بيانات الحجز
      const bookingData = {
        serviceId: service?.id || 'quick-booking',
        serviceName: service?.name || CATEGORY_SERVICES[selectedCategory as keyof typeof CATEGORY_SERVICES]?.name || 'حجز سريع',
        serviceCategory: selectedCategory,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        serviceDetails: formData.serviceDetails,
        status: 'pending' as const,
        estimatedPrice: estimatedPrice,
        
        // تفاصيل إضافية حسب نوع الخدمة
        ...(selectedCategory === 'external_trips' && {
          startLocation: formData.startLocation,
          destination: formData.endLocation,
          selectedDestination: formData.selectedDestination,
          appointmentTime: formData.appointmentTime,
          tripDuration: CATEGORY_SERVICES.external_trips.destinations.find(d => d.id === formData.selectedDestination)?.duration || ''
        }),
        
        ...(selectedCategory === 'home_maintenance' && {
          maintenanceType: formData.selectedOptions.join(', '),
          issueDescription: formData.serviceDetails,
          urgencyLevel: formData.urgencyLevel,
          preferredTime: formData.appointmentTime
        }),
        
        ...(selectedCategory === 'internal_delivery' && {
          deliveryType: formData.selectedOptions.join(', '),
          deliveryLocation: formData.address,
          urgentDelivery: formData.urgencyLevel === 'high'
        }),

        selectedOptions: formData.selectedOptions,
        notes: formData.notes
      };

      await createBooking(bookingData);
      
      toast.success('✅ تم إرسال طلب الحجز بنجاح! سنتواصل معك قريباً');
      onClose();
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('❌ فشل في إرسال طلب الحجز، يرجى المحاولة مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const categoryConfig = selectedCategory ? CATEGORY_SERVICES[selectedCategory as keyof typeof CATEGORY_SERVICES] : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-400" />
            حجز سريع وفوري
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اختيار نوع الخدمة */}
          {!service && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                اختر نوع الخدمة *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(CATEGORY_SERVICES).map(([key, serviceType]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedCategory(key)}
                    className={`p-4 rounded-lg border transition-all duration-200 text-center ${
                      selectedCategory === key
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-2xl mb-2">{serviceType.icon}</div>
                    <div className="text-sm font-medium">{serviceType.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {key === 'internal_delivery' && (serviceType as any).price}
                      {key === 'external_trips' && 'من 250 ريال'}
                      {key === 'home_maintenance' && (serviceType as any).price}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* معلومات الخدمة المختارة */}
          {service && (
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 mb-6 border border-blue-500/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">
                  {service.category === 'internal_delivery' && '🚚'}
                  {service.category === 'external_trips' && '🗺️'}
                  {service.category === 'home_maintenance' && '🔧'}
                </div>
                <div>
                  <h3 className="text-white font-bold">{service.name}</h3>
                  <p className="text-blue-300 text-sm">{service.price}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">{service.homeShortDescription}</p>
            </div>
          )}

          {/* إظهار الحقول فقط عند اختيار فئة */}
          {selectedCategory && (
            <>
              {/* المعلومات الأساسية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    الاسم الكامل *
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    رقم الهاتف *
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="w-full pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="مثال: 0501234567"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  العنوان *
                </label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="العنوان التفصيلي"
                    required
                  />
                </div>
              </div>

              {/* خيارات التوصيل الداخلي */}
              {selectedCategory === 'internal_delivery' && (
                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-400" />
                    اختر نوع التوصيل
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {CATEGORY_SERVICES.internal_delivery.options.map(option => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleOptionToggle(option.id)}
                        className={`p-3 rounded-lg border transition-all duration-200 text-center ${
                          formData.selectedOptions.includes(option.id)
                            ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                            : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-lg mb-1">{option.icon}</div>
                        <div className="text-xs font-medium">{option.name}</div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                    <p className="text-green-300 font-bold text-lg">السعر: 20 ريال</p>
                  </div>
                </div>
              )}

              {/* خيارات المشاوير الخارجية */}
              {selectedCategory === 'external_trips' && (
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-400" />
                    تفاصيل المشوار الخارجي
                  </h3>
                  
                  {/* اختيار الوجهة */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      اختر الوجهة *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {CATEGORY_SERVICES.external_trips.destinations.map(destination => (
                        <button
                          key={destination.id}
                          type="button"
                          onClick={() => handleDestinationSelect(destination.id)}
                          className={`p-4 rounded-lg border transition-all duration-200 text-right ${
                            formData.selectedDestination === destination.id
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
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* نقاط الانطلاق والوصول */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        نقطة الانطلاق *
                      </label>
                      <input
                        type="text"
                        value={formData.startLocation}
                        onChange={(e) => setFormData(prev => ({ ...prev, startLocation: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="مثال: الخارجة - حي السلام"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        نقطة الوصول *
                      </label>
                      <input
                        type="text"
                        value={formData.endLocation}
                        onChange={(e) => setFormData(prev => ({ ...prev, endLocation: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="مثال: خميس مشيط - المستشفى العام"
                        required
                      />
                    </div>
                  </div>

                  {/* خيارات الوجهة */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      اختر نوع الوجهة (اختياري)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {CATEGORY_SERVICES.external_trips.options.map(option => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleOptionToggle(option.id)}
                          className={`p-2 rounded-lg border transition-all duration-200 text-center ${
                            formData.selectedOptions.includes(option.id)
                              ? 'border-green-500 bg-green-500/20 text-green-300'
                              : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-sm mb-1">{option.icon}</div>
                          <div className="text-xs font-medium">{option.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* خيارات الصيانة المنزلية */}
              {selectedCategory === 'home_maintenance' && (
                <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-orange-400" />
                    نوع الصيانة المطلوبة
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    {CATEGORY_SERVICES.home_maintenance.options.map(option => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleOptionToggle(option.id)}
                        className={`p-3 rounded-lg border transition-all duration-200 text-center ${
                          formData.selectedOptions.includes(option.id)
                            ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                            : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-lg mb-1">{option.icon}</div>
                        <div className="text-sm font-medium">{option.name}</div>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      وصف المشكلة بالتفصيل *
                    </label>
                    <textarea
                      value={formData.serviceDetails}
                      onChange={(e) => setFormData(prev => ({ ...prev, serviceDetails: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="وصف مفصل للمشكلة أو نوع الصيانة المطلوبة..."
                      rows={3}
                      required
                    />
                    <p className="text-orange-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      يرجى وصف المشكلة بالتفصيل لتحديد نوع الصيانة والسعر المناسب
                    </p>
                  </div>
                </div>
              )}

              {/* السعر المتوقع */}
              {estimatedPrice && (
                <div className={`rounded-xl p-4 border ${
                  selectedCategory === 'home_maintenance' 
                    ? 'bg-orange-500/20 border-orange-500/30' 
                    : 'bg-green-500/20 border-green-500/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <DollarSign className={`w-6 h-6 ${
                      selectedCategory === 'home_maintenance' ? 'text-orange-400' : 'text-green-400'
                    }`} />
                    <div>
                      <h4 className={`font-semibold ${
                        selectedCategory === 'home_maintenance' ? 'text-orange-300' : 'text-green-300'
                      }`}>
                        السعر المتوقع
                      </h4>
                      <p className={`text-lg font-bold ${
                        selectedCategory === 'home_maintenance' ? 'text-orange-200' : 'text-green-200'
                      }`}>
                        {estimatedPrice}
                      </p>
                      {selectedCategory === 'home_maintenance' && (
                        <p className="text-orange-200 text-sm mt-1">
                          سيتم تحديد السعر النهائي بعد معاينة العمل المطلوب
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* معلومات إضافية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    الوقت المفضل
                  </label>
                  <div className="relative">
                    <Clock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="datetime-local"
                      value={formData.appointmentTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                      className="w-full pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    مستوى الأولوية
                  </label>
                  <select
                    value={formData.urgencyLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, urgencyLevel: e.target.value as any }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">عادي</option>
                    <option value="medium">متوسط</option>
                    <option value="high">عاجل</option>
                  </select>
                </div>
              </div>

              {/* ملاحظات إضافية */}
              {selectedCategory !== 'home_maintenance' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ملاحظات إضافية
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="أي تفاصيل إضافية أو ملاحظات خاصة..."
                    rows={2}
                  />
                </div>
              )}
            </>
          )}

          {/* أزرار التحكم */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedCategory}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'جاري الإرسال...' : 'إرسال طلب الحجز'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingModal; 