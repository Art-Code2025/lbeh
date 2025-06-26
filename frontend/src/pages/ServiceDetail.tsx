import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AlertCircle, ChevronRight, Clock, MapPin, Calendar, Star, Shield, Award, Users } from 'lucide-react';
import CustomBookingForm from '../components/CustomBookingForm';
import 'react-toastify/dist/ReactToastify.css';

interface Service {
  id: number;
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
}

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/.netlify/functions/services/${id}`);
      if (!response.ok) {
        throw new Error('فشل في جلب بيانات الخدمة');
      }
      const data = await response.json();
      setService(data);
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (formData: any) => {
    try {
      setSubmitting(true);
      const response = await fetch('/.netlify/functions/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('فشل في إرسال الطلب');
      }

      const result = await response.json();
      toast.success('تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً');
      setShowBookingModal(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">جاري تحميل بيانات الخدمة...</p>
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
          <p className="text-gray-300 mb-6">{error || 'لم يتم العثور على الخدمة'}</p>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
            العودة إلى الخدمات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Link to="/" className="hover:text-white transition-colors">الرئيسية</Link>
                <ChevronRight className="w-4 h-4" />
                <Link to="/services" className="hover:text-white transition-colors">الخدمات</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">{service.name}</span>
              </nav>
              <h1 className="text-3xl font-bold text-white">{service.name}</h1>
              <p className="text-gray-400 mt-1">{service.categoryName}</p>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold shadow-lg transition-all duration-200"
            >
              احجز الآن
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Image */}
            {service.mainImage && (
              <div className="rounded-2xl overflow-hidden border border-gray-700">
                <img
                  src={service.mainImage}
                  alt={service.name}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Description */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">وصف الخدمة</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>

            {/* Features */}
            {service.features && service.features.length > 0 && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">مميزات الخدمة</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-xl border border-gray-600"
                    >
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-200">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {service.detailedImages && service.detailedImages.length > 0 && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">معرض الصور</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {service.detailedImages.map((image, index) => (
                    <div key={index} className="rounded-xl overflow-hidden border border-gray-700">
                      <img
                        src={image}
                        alt={`${service.name} - ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Service Info Card */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">معلومات الخدمة</h3>
              <div className="space-y-4">
                {service.price && (
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl border border-gray-600">
                    <span className="text-gray-300">السعر</span>
                    <span className="font-semibold text-white">{service.price}</span>
                  </div>
                )}
                {service.duration && (
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl border border-gray-600">
                    <span className="text-gray-300">المدة المتوقعة</span>
                    <span className="font-semibold text-white">{service.duration}</span>
                  </div>
                )}
                {service.availability && (
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl border border-gray-600">
                    <span className="text-gray-300">ساعات العمل</span>
                    <span className="font-semibold text-white">{service.availability}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Features List */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">لماذا تختارنا؟</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-xl border border-gray-600">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">خدمة موثوقة وآمنة</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-xl border border-gray-600">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">جودة عالية</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-xl border border-gray-600">
                  <Users className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">فريق محترف</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">طلب خدمة: {service.name}</h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <CustomBookingForm
                serviceId={service.id.toString()}
                serviceName={service.name}
                category={service.category}
                categoryName={service.categoryName}
                onSubmit={handleBookingSubmit}
                loading={submitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}