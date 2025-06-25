import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

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

interface BookingFormData {
  fullName: string;
  phoneNumber: string;
  address: string;
  serviceDetails: string;
}

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    phoneNumber: '',
    address: '',
    serviceDetails: ''
  });

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/services/${id}`);
      if (!response.ok) throw new Error('فشل في تحميل بيانات الخدمة');
      const data = await response.json();
      setService(data);
    } catch (error) {
      toast.error('حدث خطأ في تحميل بيانات الخدمة');
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;

    try {
      const response = await fetch('http://localhost:3001/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          ...formData
        }),
      });

      if (!response.ok) throw new Error('فشل في إرسال طلب الحجز');

      toast.success('تم إرسال طلب الحجز بنجاح');
      setFormData({
        fullName: '',
        phoneNumber: '',
        address: '',
        serviceDetails: ''
      });
    } catch (error) {
      toast.error('حدث خطأ في إرسال طلب الحجز');
    }
  };

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-lg">جاري تحميل بيانات الخدمة...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-cyan-50 to-white pt-24 pb-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-4">{service.name}</h1>
              <p className="text-slate-600 text-lg mb-6">{service.description}</p>
              <div className="flex flex-wrap gap-4 text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
                  {service.duration}
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
                  {service.availability}
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
                  {service.price}
                </span>
              </div>
            </div>
            <div className="relative">
              <img
                src={service.mainImage}
                alt={service.name}
                className="w-full h-[400px] object-cover rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <p className="font-bold text-xl text-cyan-600">{service.price}</p>
                <p className="text-slate-500">السعر يبدأ من</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-12">
              {/* Features */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">مميزات الخدمة</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {service.features.map((feature, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                      <div className="flex items-start gap-3">
                        <span className="text-cyan-600 bg-cyan-50 p-2 rounded-lg">✓</span>
                        <p>{feature}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">معرض الصور</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {service.detailedImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${service.name} ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-sm"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 h-fit sticky top-24">
              <h2 className="text-xl font-semibold mb-6">احجز الخدمة</h2>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    الاسم بالكامل
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    رقم الجوال
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    العنوان
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    تفاصيل إضافية
                  </label>
                  <textarea
                    value={formData.serviceDetails}
                    onChange={(e) => setFormData({ ...formData, serviceDetails: e.target.value })}
                    className="form-textarea"
                    rows={4}
                  />
                </div>

                <button type="submit" className="btn-primary w-full">
                  احجز الآن
                </button>

                <div className="text-center text-sm text-slate-500 mt-4">
                  <p>متوفر: {service.availability}</p>
                  <p className="mt-1">السعر يبدأ من: {service.price}</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}