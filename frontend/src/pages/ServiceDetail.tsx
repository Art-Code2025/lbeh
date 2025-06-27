import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, MapPin, CheckCircle, Package, Truck, Wrench, User, Phone, Home, MessageSquare, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface Service {
  id: string; // تغيير من number إلى string
  name: string;
  category: string;
  categoryName: string;
  description: string;
  mainImage: string;
  detailedImages: string[];
  features: string[];
  duration: string;
  availability: string;
  price: string;
  homeShortDescription: string;
}

// خيارات مخصصة لكل فئة
const categoryOptions = {
  'internal_delivery': {
    name: 'خدمة توصيل أغراض داخلي',
    price: '20 ريال',
    options: ['صيدلية', 'بقالة', 'مستشفى', 'توصيلات أونلاين']
  },
  'external_trips': {
    name: 'مشاوير خارجية',
    destinations: {
      'خميس مشيط': { price: '250 ريال', duration: '9 ساعات كحد أقصى' },
      'أبها': { price: '300 ريال', duration: '9 ساعات كحد أقصى' }
    },
    options: ['حجز مستشفى', 'حجز مشغل', 'الحدائق', 'المرافق العامة', 'المطار']
  },
  'home_maintenance': {
    name: 'صيانة منزلية',
    price: 'على حسب المطلوب',
    options: ['سباكة', 'كهرباء', 'نظافة عامة']
  }
};

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    serviceDetails: '',
    // خيارات مخصصة حسب الفئة
    selectedOption: '',
    selectedDestination: '',
    startLocation: '',
    appointmentTime: '',
    urgentDelivery: false,
    returnTrip: false,
    passengers: 1,
    urgencyLevel: 'medium',
    preferredTime: 'morning'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // جلب الخدمة من Firebase مباشرة
        const { initializeApp } = await import('firebase/app');
        const { getFirestore, collection, getDocs } = await import('firebase/firestore');
        
        const firebaseConfig = {
          apiKey: "AIzaSyCU3gkAwZGeyww7XjcODeEjl-kS9AcOyio",
          authDomain: "lbeh-81936.firebaseapp.com",
          projectId: "lbeh-81936",
          storageBucket: "lbeh-81936.firebasestorage.app",
          messagingSenderId: "225834423678",
          appId: "1:225834423678:web:5955d5664e2a4793c40f2f"
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        // البحث عن الخدمة بـ ID
        const servicesRef = collection(db, 'services');
        const servicesSnapshot = await getDocs(servicesRef);
        let foundService: Service | null = null;
        
        servicesSnapshot.forEach((doc) => {
          if (doc.id === id) {
            const serviceData = doc.data();
            foundService = {
              id: doc.id,
              name: serviceData.name || '',
              category: serviceData.categoryId || serviceData.category || '',
              categoryName: serviceData.categoryName || '',
              description: serviceData.description || serviceData.homeShortDescription || getDetailedDescription(serviceData.categoryId || serviceData.category || ''),
              mainImage: serviceData.mainImage || getDefaultImage(serviceData.categoryId || serviceData.category || ''),
              detailedImages: serviceData.detailedImages || [],
              features: serviceData.features || getDefaultFeatures(serviceData.categoryId || serviceData.category || ''),
              duration: serviceData.duration || getDefaultDuration(serviceData.categoryId || serviceData.category || ''),
              availability: serviceData.availability || "متاح 24/7",
              price: serviceData.price || serviceData.pricing || getDefaultPrice(serviceData.categoryId || serviceData.category || ''),
              homeShortDescription: serviceData.homeShortDescription || ''
            };
          }
        });

        if (foundService) {
          setService(foundService);
        } else {
          setError('الخدمة غير موجودة');
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        setError('فشل في تحميل الخدمة');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  // Helper functions
  function getDefaultImage(categoryId: string) {
    const images: Record<string, string> = {
      'internal_delivery': 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=500',
      'external_trips': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500',
      'home_maintenance': 'https://images.unsplash.com/photo-1585128792020-803d29415281?w=500'
    };
    return images[categoryId] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500';
  }

  function getDefaultPrice(categoryId: string) {
    const prices: Record<string, string> = {
      'internal_delivery': 'من 20 ريال',
      'external_trips': 'من 250 ريال',
      'home_maintenance': 'حسب الخدمة'
    };
    return prices[categoryId] || 'حسب الطلب';
  }

  function getDefaultDuration(categoryId: string) {
    const durations: Record<string, string> = {
      'internal_delivery': '30-60 دقيقة',
      'external_trips': '2-8 ساعات',
      'home_maintenance': '1-4 ساعات'
    };
    return durations[categoryId] || '1-2 ساعة';
  }

  function getDefaultFeatures(categoryId: string) {
    const features: Record<string, string[]> = {
      'internal_delivery': ['توصيل سريع خلال ساعة', 'خدمة 24/7', 'تتبع الطلب مباشر', 'ضمان الأمان'],
      'external_trips': ['سائقين محترفين', 'سيارات حديثة ومريحة', 'أسعار تنافسية', 'رحلات آمنة'],
      'home_maintenance': ['فنيين معتمدين', 'ضمان على الخدمة', 'قطع غيار أصلية', 'خدمة طوارئ']
    };
    return features[categoryId] || ['خدمة عالية الجودة', 'أسعار مناسبة', 'ضمان الرضا'];
  }

  function getDetailedDescription(categoryId: string) {
    const descriptions: Record<string, string> = {
      'internal_delivery': 'خدمات التوصيل السريعة داخل المدينة مع ضمان الوصول في الوقت المحدد. نوفر خدمات توصيل البقالة، الأدوية، والوثائق بأمان تام.',
      'external_trips': 'رحلات آمنة ومريحة للمسافات البعيدة مع سائقين محترفين. نغطي جميع المحافظات مع إمكانية الحجز المسبق والرحلات العاجلة.',
      'home_maintenance': 'خدمات صيانة شاملة للمنازل والمكاتب مع فنيين متخصصين. نقدم خدمات السباكة، الكهرباء، التكييف، والدهانات بضمان الجودة.'
    };
    return descriptions[categoryId] || 'خدمة متميزة بجودة عالية';
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!service) return;
    
    // التحقق من البيانات المطلوبة
    if (!formData.fullName || !formData.phoneNumber || !formData.address) {
      toast.error('يرجى ملء جميع البيانات المطلوبة');
      return;
    }

    try {
      setSubmitting(true);
      
      // إعداد بيانات الحجز
      const bookingData = {
        serviceId: service.id,
        serviceName: service.name,
        serviceCategory: service.category,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        serviceDetails: formData.serviceDetails,
        status: 'pending',
        createdAt: new Date().toISOString(),
        // بيانات مخصصة حسب الفئة
        ...(service.category === 'internal_delivery' && {
          selectedOption: formData.selectedOption,
          urgentDelivery: formData.urgentDelivery
        }),
        ...(service.category === 'external_trips' && {
          selectedOption: formData.selectedOption,
          selectedDestination: formData.selectedDestination,
          startLocation: formData.startLocation,
          appointmentTime: formData.appointmentTime,
          returnTrip: formData.returnTrip,
          passengers: formData.passengers
        }),
        ...(service.category === 'home_maintenance' && {
          selectedOption: formData.selectedOption,
          urgencyLevel: formData.urgencyLevel,
          preferredTime: formData.preferredTime
        })
      };

      // إرسال البيانات إلى Firebase
      const { initializeApp } = await import('firebase/app');
      const { getFirestore, collection, addDoc } = await import('firebase/firestore');
      
      const firebaseConfig = {
        apiKey: "AIzaSyCU3gkAwZGeyww7XjcODeEjl-kS9AcOyio",
        authDomain: "lbeh-81936.firebaseapp.com",
        projectId: "lbeh-81936",
        storageBucket: "lbeh-81936.firebasestorage.app",
        messagingSenderId: "225834423678",
        appId: "1:225834423678:web:5955d5664e2a4793c40f2f"
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      
      await addDoc(collection(db, 'bookings'), bookingData);
      
      toast.success('تم إرسال طلب الحجز بنجاح! سنتواصل معك قريباً');
      setShowBookingForm(false);
      
      // إعادة تعيين النموذج
      setFormData({
        fullName: '',
        phoneNumber: '',
        address: '',
        serviceDetails: '',
        selectedOption: '',
        selectedDestination: '',
        startLocation: '',
        appointmentTime: '',
        urgentDelivery: false,
        returnTrip: false,
        passengers: 1,
        urgencyLevel: 'medium',
        preferredTime: 'morning'
      });
      
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('فشل في إرسال طلب الحجز. حاول مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'internal_delivery': return <Truck className="w-6 h-6" />;
      case 'external_trips': return <MapPin className="w-6 h-6" />;
      case 'home_maintenance': return <Wrench className="w-6 h-6" />;
      default: return <Package className="w-6 h-6" />;
    }
  };

  const getCategoryOptions = () => {
    if (!service) return null;
    return categoryOptions[service.category as keyof typeof categoryOptions];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">جاري تحميل تفاصيل الخدمة...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl p-8 max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">عذراً</h2>
          <p className="text-gray-300 mb-6">{error || 'الخدمة غير موجودة'}</p>
          <Link
            to="/services"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
          >
            العودة للخدمات
          </Link>
        </div>
      </div>
    );
  }

  const options = getCategoryOptions();

  return (
    <div dir="rtl" className="min-h-screen bg-gray-900 text-white">
      {/* Breadcrumb */}
      <div className="bg-gray-800 py-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors">الرئيسية</Link>
            <ArrowRight className="w-4 h-4 text-gray-500 transform rotate-180" />
            <Link to="/services" className="text-gray-400 hover:text-white transition-colors">الخدمات</Link>
            <ArrowRight className="w-4 h-4 text-gray-500 transform rotate-180" />
            <span className="text-white">{service.name}</span>
          </nav>
        </div>
      </div>

      {/* Service Details */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Service Image */}
            <div className="space-y-6">
              <div className="relative h-96 rounded-2xl overflow-hidden bg-gray-800">
                {service.mainImage ? (
                  <img
                    src={service.mainImage}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Additional Images */}
              {service.detailedImages && service.detailedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {service.detailedImages.slice(0, 3).map((image, index) => (
                    <div key={index} className="h-24 rounded-lg overflow-hidden bg-gray-800">
                      <img
                        src={image}
                        alt={`${service.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                    {getCategoryIcon(service.category)}
                  </div>
                  <span className="text-gray-400 text-sm">{service.categoryName}</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">{service.name}</h1>
                <p className="text-gray-300 text-lg leading-relaxed">{service.description}</p>
              </div>

              {/* Service Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-400 text-sm">المدة المتوقعة</span>
                  </div>
                  <p className="text-white font-semibold">{service.duration}</p>
                </div>
                
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-400 text-sm">السعر</span>
                  </div>
                  <p className="text-white font-semibold">{service.price}</p>
                </div>
              </div>

              {/* Features */}
              {service.features && service.features.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">مميزات الخدمة</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Options */}
              {options && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">خيارات الخدمة</h3>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {options.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300 text-sm">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Button */}
              <button
                onClick={() => setShowBookingForm(true)}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg"
              >
                احجز الآن
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">حجز خدمة: {service.name}</h2>
              <button
                onClick={() => setShowBookingForm(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* البيانات الأساسية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    الاسم الكريم *
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full pr-10 pl-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    رقم الجوال *
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full pr-10 pl-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                      placeholder="05xxxxxxxx"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  العنوان بالتفصيل *
                </label>
                <div className="relative">
                  <Home className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full pr-10 pl-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                    placeholder="أدخل عنوانك بالتفصيل"
                    required
                  />
                </div>
              </div>

              {/* خيارات مخصصة حسب الفئة */}
              {options && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      نوع الخدمة
                    </label>
                    <select
                      name="selectedOption"
                      value={formData.selectedOption}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    >
                      <option value="">اختر نوع الخدمة</option>
                      {options.options.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* خيارات خاصة بالتوصيل الداخلي */}
                  {service.category === 'internal_delivery' && (
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="urgentDelivery"
                        name="urgentDelivery"
                        checked={formData.urgentDelivery}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded"
                      />
                      <label htmlFor="urgentDelivery" className="text-sm text-gray-300">
                        توصيل عاجل (+10 ريال)
                      </label>
                    </div>
                  )}

                  {/* خيارات خاصة بالمشاوير الخارجية */}
                  {service.category === 'external_trips' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            نقطة الانطلاق
                          </label>
                          <input
                            type="text"
                            name="startLocation"
                            value={formData.startLocation}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                            placeholder="من أين تريد الانطلاق؟"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            الوجهة
                          </label>
                          <select
                            name="selectedDestination"
                            value={formData.selectedDestination}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                          >
                            <option value="">اختر الوجهة</option>
                            {service.category === 'external_trips' && 'destinations' in categoryOptions.external_trips && 
                              Object.entries(categoryOptions.external_trips.destinations).map(([dest, info]) => (
                                <option key={dest} value={dest}>{dest} - {info.price}</option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            وقت الموعد
                          </label>
                          <input
                            type="datetime-local"
                            name="appointmentTime"
                            value={formData.appointmentTime}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            عدد المسافرين
                          </label>
                          <input
                            type="number"
                            name="passengers"
                            value={formData.passengers}
                            onChange={handleInputChange}
                            min="1"
                            max="8"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="returnTrip"
                          name="returnTrip"
                          checked={formData.returnTrip}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded"
                        />
                        <label htmlFor="returnTrip" className="text-sm text-gray-300">
                          رحلة ذهاب وعودة
                        </label>
                      </div>
                    </>
                  )}

                  {/* خيارات خاصة بالصيانة المنزلية */}
                  {service.category === 'home_maintenance' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          مستوى الاستعجال
                        </label>
                        <select
                          name="urgencyLevel"
                          value={formData.urgencyLevel}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                        >
                          <option value="low">عادي</option>
                          <option value="medium">متوسط</option>
                          <option value="high">عاجل</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          الوقت المفضل
                        </label>
                        <select
                          name="preferredTime"
                          value={formData.preferredTime}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                        >
                          <option value="morning">صباحاً (8-12)</option>
                          <option value="afternoon">ظهراً (12-4)</option>
                          <option value="evening">مساءً (4-8)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  تفاصيل إضافية
                </label>
                <div className="relative">
                  <MessageSquare className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    name="serviceDetails"
                    value={formData.serviceDetails}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full pr-10 pl-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 resize-none"
                    placeholder="أي تفاصيل إضافية تريد إضافتها..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'جاري الإرسال...' : 'تأكيد الحجز'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl font-semibold transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}