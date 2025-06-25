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
    if (!services) return;

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
      const response = await fetch('/.netlify/functions/services');
      if (!response.ok) {
        throw new Error('فشل في جلب الخدمات');
      }
      const data = await response.json();
      setServices(data || []);
      
      // تجميع الخدمات حسب الفئات
      const categories = groupServicesByCategory(data || []);
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
    const categories: ServiceCategory[] = [
      {
        id: 'daily_services',
        name: 'الخدمات اليومية / المشاوير الداخلية',
        description: 'خدمات التوصيل والمشاوير اليومية داخل المدينة',
        icon: <Truck className="w-6 h-6" />,
        color: 'blue',
        services: []
      },
      {
        id: 'external_errands',
        name: 'المشاوير الخارجية',
        description: 'المشاوير والتوصيل للمسافات البعيدة بين المدن',
        icon: <MapPin className="w-6 h-6" />,
        color: 'green',
        services: []
      },
      {
        id: 'home_maintenance',
        name: 'الأعمال المنزلية والفنية',
        description: 'خدمات الصيانة والإصلاح المنزلي المتخصصة',
        icon: <Wrench className="w-6 h-6" />,
        color: 'orange',
        services: []
      }
    ];

    services.forEach(service => {
      const category = categories.find(cat => cat.id === service.category);
      if (category) {
        category.services.push(service);
      }
    });

    return categories;
  };

  const getImageSrc = (image: string) => {
    return image;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">جاري تحميل الخدمات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl p-8 max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">عذراً</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Link to="/" className="hover:text-white transition-colors">الرئيسية</Link>
                <ArrowLeft className="w-4 h-4" />
                <span className="text-white">الخدمات</span>
              </nav>
              <h1 className="text-3xl font-bold text-white">خدماتنا</h1>
              <p className="text-gray-400 mt-1">اكتشف مجموعة خدماتنا المتنوعة</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في الخدمات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pr-10 pl-4 py-2 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                />
              </div>
              <div className="flex gap-1 bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-gray-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-gray-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              جميع الخدمات
            </button>
            {serviceCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">لا توجد خدمات</h3>
            <p className="text-gray-400">
              لم يتم العثور على خدمات تطابق معايير البحث
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className={`bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden transition-transform duration-200 hover:scale-[1.02] ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                <div className={viewMode === 'list' ? 'w-1/3' : ''}>
                  {service.mainImage ? (
                    <img
                      src={getImageSrc(service.mainImage)}
                      alt={service.name}
                      className={`w-full ${viewMode === 'list' ? 'h-full' : 'h-48'} object-cover`}
                    />
                  ) : (
                    <div className={`w-full ${viewMode === 'list' ? 'h-full' : 'h-48'} bg-gray-700 flex items-center justify-center`}>
                      <Package className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                </div>
                
                <div className={`p-6 ${viewMode === 'list' ? 'w-2/3' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {service.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        {service.homeShortDescription}
                      </p>
                    </div>
                    {service.price && (
                      <div className="text-right">
                        <span className="text-sm text-gray-400">يبدأ من</span>
                        <p className="text-lg font-semibold text-white">{service.price}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 mb-6">
                    {service.duration && (
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {service.duration}
                      </div>
                    )}
                    {service.availability && (
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {service.availability}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-400">
                      {service.categoryName}
                    </span>
                    <Link
                      to={`/service/${service.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                    >
                      التفاصيل
                      <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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