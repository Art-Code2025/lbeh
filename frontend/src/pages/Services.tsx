import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  Truck, 
  Wrench, 
  ArrowLeft,
  ArrowRight,
  Search,
  Filter,
  Grid,
  List,
  Package,
  CheckCircle,
  Award,
  Users,
  AlertCircle,
  Calendar,
  Shield
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// تعريف نوع الخدمة
interface Service {
  id: number;
  name: string;
  category: string;
  categoryName: string;
  homeShortDescription: string;
  detailsShortDescription: string;
  description: string;
  mainImage: string;
  detailedImages: string[];
  imageDetails: string[];
  features: string[];
  duration?: string;
  availability?: string;
  price?: string;
}

// تعريف فئات الخدمات
interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  color: string;
  services: Service[];
}

const services = [
  {
    id: 'local-delivery',
    title: 'مشاوير داخلية',
    description: 'خدمة توصيل سريعة وموثوقة داخل المدينة',
    icon: '🚗',
    color: 'cyan'
  },
  {
    id: 'external-delivery',
    title: 'مشاوير خارجية',
    description: 'خدمة توصيل آمنة وسريعة بين المدن',
    icon: '🚚',
    color: 'blue'
  },
  {
    id: 'maintenance',
    title: 'صيانة شاملة',
    description: 'خدمات صيانة متكاملة لمنزلك وسيارتك',
    icon: '🔧',
    color: 'teal'
  }
];

function Services() {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // جلب الخدمات من الخادم
  useEffect(() => {
    fetchServices();
  }, []);

  // تطبيق فلتر الفئة من URL
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // فلترة الخدمات حسب الفئة والبحث
  useEffect(() => {
    let filtered = services;
    
    // فلترة حسب الفئة
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    
    // فلترة حسب البحث
    if (searchTerm.trim()) {
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredServices(filtered);
  }, [services, selectedCategory, searchTerm]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/services');
      if (!response.ok) {
        throw new Error('فشل في جلب الخدمات');
      }
      const data = await response.json();
      setServices(data);
      
      // تجميع الخدمات حسب الفئات
      const categories = groupServicesByCategory(data);
      setServiceCategories(categories);
      
    } catch (error: any) {
      setError(error.message || 'حدث خطأ أثناء جلب الخدمات');
      toast.error(error.message || 'حدث خطأ أثناء جلب الخدمات');
    } finally {
      setLoading(false);
    }
  };

  // تجميع الخدمات حسب الفئات
  const groupServicesByCategory = (services: Service[]): ServiceCategory[] => {
    const categoryMap = new Map<string, ServiceCategory>();
    
    services.forEach(service => {
      if (!categoryMap.has(service.category)) {
        let icon: JSX.Element;
        let color: string;
        
        switch (service.category) {
          case 'daily_services':
            icon = <Truck className="w-6 h-6" />;
            color = 'blue';
            break;
          case 'external_errands':
            icon = <MapPin className="w-6 h-6" />;
            color = 'green';
            break;
          case 'home_maintenance':
            icon = <Wrench className="w-6 h-6" />;
            color = 'orange';
            break;
          default:
            icon = <Star className="w-6 h-6" />;
            color = 'gray';
        }
        
        categoryMap.set(service.category, {
          id: service.category,
          name: service.categoryName,
          description: '',
          icon,
          color,
          services: []
        });
      }
      
      categoryMap.get(service.category)!.services.push(service);
    });
    
    return Array.from(categoryMap.values());
  };

  const getImageSrc = (image: string) => {
    if (image.startsWith('/images/')) {
      return `http://localhost:3001${image}`;
    }
    return image;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-lg">جاري تحميل الخدمات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-navy-gradient flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-white text-lg mb-6">{error}</p>
          <button 
            onClick={fetchServices}
            className="btn-primary-modern"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-cyan-50 to-white pt-32 pb-16">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">خدماتنا المميزة</h1>
            <p className="text-slate-600 text-lg mb-8">
              نقدم لكم مجموعة متكاملة من الخدمات المنزلية والمشاوير بأعلى معايير الجودة والاحترافية
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <Link
                key={service.id}
                to={`/service/${service.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100"
              >
                <div className="relative h-64">
                  <img
                    src={getImageSrc(service.mainImage)}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 right-4 left-4">
                    <h3 className="text-white text-xl font-semibold mb-2">{service.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-white/90">{service.categoryName}</span>
                      <span className="bg-white text-cyan-600 px-3 py-1 rounded-full text-sm font-medium">
                        {service.price}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 line-clamp-2">{service.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-cyan-600 font-medium">اطلب الخدمة</span>
                    <span className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-cyan-600" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-white to-cyan-50">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">خدمة متميزة</h3>
              <p className="text-slate-600">نقدم أفضل مستوى من الخدمة مع ضمان رضا العملاء</p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">سرعة في التنفيذ</h3>
              <p className="text-slate-600">نصل إليك في أسرع وقت ممكن مع الحفاظ على جودة الخدمة</p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ضمان الجودة</h3>
              <p className="text-slate-600">نقدم ضمان شامل على جميع خدماتنا لراحة بالك</p>
            </div>
          </div>
        </div>
      </section>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default Services; 