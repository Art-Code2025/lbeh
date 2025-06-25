import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Award, 
  Shield,
  Zap,
  Clock,
  Phone,
  Mail,
  MapPin,
  Home as HomeIcon,
  Wrench,
  Truck,
  Settings,
  Heart,
  ThumbsUp,
  Calendar,
  UserCircle,
  Package
} from 'lucide-react';
import { categoriesAPI, servicesAPI, testFirebaseConnection } from '../services/api';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  createdAt?: string;
}

interface Service {
  id: number;
  name: string;
  category: string;
  categoryName: string;
  homeShortDescription: string;
  mainImage?: string;
  price: string;
  duration?: string;
}

const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // اختبار اتصال Firebase أولاً
        console.log('🔥 Testing Firebase connection...');
        const isConnected = await testFirebaseConnection();
        setFirebaseConnected(isConnected);
        
        if (isConnected) {
          console.log('✅ Firebase connected! Fetching data...');
        } else {
          console.log('❌ Firebase connection failed, but will try API...');
        }
        
        // جلب الكاتيجوريز
        const categoriesData = await categoriesAPI.getAll();
        console.log('📁 Categories loaded:', categoriesData.length);
        setCategories(categoriesData || []);

        // جلب الخدمات
        const servicesData = await servicesAPI.getAll();
        console.log('🛠️ Services loaded:', servicesData.length);
        setServices((servicesData || []).slice(0, 6)); // عرض أول 6 خدمات فقط
        
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        // Set empty arrays as fallback
        setCategories([]);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Scroll Animation Hook
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target); // توقف المراقبة بعد أول ظهور لتحسين الأداء
        }
      });
    }, observerOptions);

    // راقب جميع العناصر التي لم يظهر عليها الأنيميشن بعد
    const animatedElements = document.querySelectorAll('.scroll-animate:not(.animate-in)');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [categories, services]);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case '🚚':
        return <Truck size={32} />;
      case '🔧':
        return <Wrench size={32} />;
      case '🗺️':
        return <MapPin size={32} />;
      default:
        return <Settings size={32} />;
    }
  };
  
  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white';
      case 'green':
        return 'bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white';
      case 'orange':
        return 'bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white';
      default:
        return 'bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white';
    }
  };

  return (
    <div dir="rtl" className="overflow-x-hidden bg-gradient-to-b from-[#f0faff] to-[#e0f2fe]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-[#f0faff] via-[#e0f2fe] to-[#bae6fd] overflow-hidden py-12 sm:py-16 lg:py-20">
        {/* Professional Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-cyan-300/40 to-blue-400/40 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-40 w-80 h-80 bg-gradient-to-br from-blue-300/30 to-cyan-400/30 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-40 left-40 w-64 h-64 bg-gradient-to-br from-cyan-400/35 to-blue-300/35 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
          </div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1 text-right space-y-8 scroll-animate opacity-0 translate-y-8 px-4 sm:px-6 lg:px-0">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-800 leading-tight">
                  <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-l from-cyan-600 to-blue-600">لبيه</span>
                  <br className="hidden sm:block" /> 
                  <span className="text-3xl sm:text-4xl lg:text-5xl">طلبك بين ايديك</span>
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-slate-700 max-w-2xl leading-relaxed font-medium">
                  عالم جديد في خدمة توصيل الطلبات ومشاويرك الخاصة لأهالي الخارجة وما حولها.
                </p>
                <p className="text-base sm:text-lg lg:text-xl text-cyan-700 font-semibold max-w-2xl italic">
                  "You ask, we deliver — your request is in your hands."
                </p>
              </div>

              {/* Professional Stats */}
              <div className="grid grid-cols-3 gap-6 py-8 border-t border-b border-cyan-200/50">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cyan-600 mb-2">+1000</div>
                  <div className="text-sm sm:text-base text-slate-600 font-medium">عميل سعيد</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cyan-600 mb-2">24/7</div>
                  <div className="text-sm sm:text-base text-slate-600 font-medium">خدمة متواصلة</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cyan-600 mb-2">100%</div>
                  <div className="text-sm sm:text-base text-slate-600 font-medium">رضا العملاء</div>
                </div>
              </div>

              {/* Professional CTA Buttons */}
              <div className="flex flex-wrap gap-4 justify-end pt-6">
                <Link 
                  to="/categories" 
                  className="inline-flex items-center space-x-reverse space-x-3 px-8 py-4 bg-gradient-to-l from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Package className="w-6 h-6" />
                  <span>تصفح خدماتنا</span>
                </Link>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center space-x-reverse space-x-3 px-8 py-4 bg-white/80 backdrop-blur-sm hover:bg-white text-cyan-600 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-cyan-200 hover:border-cyan-300 transform hover:-translate-y-1"
                >
                  <Phone className="w-6 h-6" />
                  <span>اتصل بنا</span>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end scroll-animate opacity-0 translate-x-8">
              <div className="relative max-w-lg w-full">
                <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
                <img
                    src="/coverr.png" 
                  alt="لبيه - خدمات توصيل وصيانة"
                    className="w-full h-auto rounded-3xl shadow-2xl"
                  />
                  
                  {/* Professional Floating Elements */}
                  <div className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl animate-float">
                    <div className="flex items-center space-x-reverse space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-slate-700">خدمة متاحة</span>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  </div>
                  
                  <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl animate-float" style={{animationDelay: '1s'}}>
                    <div className="flex items-center space-x-reverse space-x-3">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">4.9</div>
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                </div>
                      <span className="text-sm font-semibold text-slate-700">تقييم ممتاز</span>
                  </div>
                  </div>
                </div>
                
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/50 to-blue-200/50 rounded-3xl blur-3xl opacity-30 -z-10 transform scale-110"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-[#e0f2fe] to-[#f0faff]">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 scroll-animate opacity-0 translate-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">خدماتنا</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              نوفر لك مجموعة متنوعة من الخدمات لتلبية احتياجاتك اليومية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600 mx-auto"></div>
                <p className="mt-4 text-slate-600">جاري تحميل الخدمات...</p>
              </div>
            ) : categories.length > 0 ? (
              categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/services/${category.id}`}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 border border-cyan-100/50 scroll-animate opacity-0 translate-y-8"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-6">
                      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${getColorClass(category.color)} transition-colors duration-300`}>
                        {getIconComponent(category.icon)}
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 group-hover:text-cyan-600">
                      {category.name}
                    </h3>
                    <p className="text-slate-600 mb-6 flex-grow">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-end text-cyan-600 group-hover:text-cyan-700">
                      <span className="font-semibold ml-2">استعراض الخدمات</span>
                      <ArrowRight className="w-5 h-5 transform -rotate-180 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-600">لا توجد خدمات متاحة حالياً</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12 scroll-animate opacity-0 translate-y-8">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-colors duration-300"
            >
              <span>عرض كل الفئات</span>
              <ArrowRight className="w-5 h-5 transform -rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-[#f0faff] to-[#e0f2fe]">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 scroll-animate opacity-0 translate-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">خدماتنا الشائعة</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              أشهر الخدمات المطلوبة من عملائنا الكرام
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600 mx-auto"></div>
                <p className="mt-4 text-slate-600">جاري تحميل الخدمات...</p>
              </div>
            ) : services.length > 0 ? (
              services.map((service, index) => (
                <Link
                  key={service.id}
                  to={`/service/${service.id}`}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 border border-cyan-100/50 scroll-animate opacity-0 translate-y-8"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col h-full">
                    {service.mainImage && (
                      <div className="mb-4 overflow-hidden rounded-lg">
                        <img
                          src={service.mainImage}
                          alt={service.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-slate-500 bg-cyan-100 px-2 py-1 rounded-full">
                          {service.categoryName}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-slate-600">4.8</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-cyan-600">
                        {service.name}
                      </h3>
                      <p className="text-slate-600 mb-4 text-sm line-clamp-2">
                        {service.homeShortDescription}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-cyan-600 font-bold">{service.price}</span>
                        {service.duration && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs">{service.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-end text-cyan-600 group-hover:text-cyan-700 pt-4 border-t border-cyan-100">
                      <span className="font-semibold ml-2">احجز الآن</span>
                      <ArrowRight className="w-4 h-4 transform -rotate-180 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">لا توجد خدمات متاحة حالياً</p>
                <p className="text-slate-500 text-sm mt-2">سنضيف المزيد من الخدمات قريباً</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12 scroll-animate opacity-0 translate-y-8">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors duration-300 font-semibold"
            >
              <span>عرض جميع الخدمات</span>
              <ArrowRight className="w-5 h-5 transform -rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-cyan-600 to-blue-700 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container-custom px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 scroll-animate opacity-0 translate-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">إحصائيات مباشرة</h2>
            <p className="text-lg text-cyan-100 max-w-2xl mx-auto">
              أرقام حقيقية تعكس مستوى خدماتنا وثقة عملائنا
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center scroll-animate opacity-0 translate-y-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4 hover-lift">
                <Users className="w-8 h-8 text-white mx-auto mb-3" />
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{services.length}</div>
                <div className="text-cyan-100 text-sm">خدمة متاحة</div>
              </div>
            </div>
            <div className="text-center scroll-animate opacity-0 translate-y-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4 hover-lift">
                <Award className="w-8 h-8 text-white mx-auto mb-3" />
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{categories.length}</div>
                <div className="text-cyan-100 text-sm">فئة خدمات</div>
              </div>
            </div>
            <div className="text-center scroll-animate opacity-0 translate-y-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4 hover-lift">
                <Star className="w-8 h-8 text-white mx-auto mb-3" />
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">4.9</div>
                <div className="text-cyan-100 text-sm">تقييم العملاء</div>
              </div>
            </div>
            <div className="text-center scroll-animate opacity-0 translate-y-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4 hover-lift">
                <CheckCircle className="w-8 h-8 text-white mx-auto mb-3" />
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">24/7</div>
                <div className="text-cyan-100 text-sm">خدمة مستمرة</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How we help section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-[#e0f2fe] to-[#f0faff] overflow-hidden">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 scroll-animate opacity-0 translate-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">كيف نساعدك؟</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              جعل حياة الناس سهلة وأكثر سلاسة بسهولة الطلب والاستجابة.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="relative group scroll-animate opacity-0 translate-y-8">
              <div className="absolute inset-0.5 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100/50">
                <div className="flex justify-center items-center mb-6">
                  <div className="bg-cyan-100 rounded-xl p-4 group-hover:bg-cyan-600 transition-colors duration-300">
                    <Clock size={32} className="text-cyan-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 text-center">أنت في دوامك؟</h3>
                <p className="text-slate-600 text-center leading-relaxed">
                  لا تأكل هم مقاضيك، تصلك إلى باب بيتك. إيش تنتظر؟ تواصل وبس.
                </p>
              </div>
            </div>
            
            <div className="relative group scroll-animate opacity-0 translate-y-8">
              <div className="absolute inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100/50">
                <div className="flex justify-center items-center mb-6">
                  <div className="bg-cyan-100 rounded-xl p-4 group-hover:bg-cyan-600 transition-colors duration-300">
                    <Heart size={32} className="text-cyan-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 text-center">احتياجاتك اليومية</h3>
                <p className="text-slate-600 text-center leading-relaxed">
                  نمد إيدينا ونساعدك في تلبية احتياجاتك الأسرية اليومية. إيش تبي؟ لا تتردد واطلب الآن.
                </p>
              </div>
            </div>

            <div className="relative group scroll-animate opacity-0 translate-y-8">
              <div className="absolute inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100/50">
                <div className="flex justify-center items-center mb-6">
                  <div className="bg-cyan-100 rounded-xl p-4 group-hover:bg-cyan-600 transition-colors duration-300">
                    <Zap size={32} className="text-cyan-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 text-center">سهولة وسلاسة</h3>
                <p className="text-slate-600 text-center leading-relaxed">
                  جعل حياة الناس سهلة وأكثر سلاسة بسهولة الطلب والاستجابة. اطلب الآن.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-[#f0faff] to-[#e0f2fe] overflow-hidden">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 scroll-animate opacity-0 translate-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">لماذا تختار لبيه؟</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              نحن نقدم خدمات عالية الجودة مع التركيز على راحة وسعادة عملائنا
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="relative group scroll-animate opacity-0 translate-y-8">
              <div className="absolute inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="bg-cyan-100 rounded-xl p-4 group-hover:bg-cyan-600 transition-colors duration-300">
                      <Clock size={28} className="text-cyan-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">خدمة سريعة</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  نصل إليك في أسرع وقت ممكن لتلبية احتياجاتك
                </p>
              </div>
            </div>

            <div className="relative group scroll-animate opacity-0 translate-y-8">
              <div className="absolute inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="bg-cyan-100 rounded-xl p-4 group-hover:bg-cyan-600 transition-colors duration-300">
                      <Shield size={28} className="text-cyan-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">موثوقية وأمان</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  فريق عمل محترف ومعتمد لضمان أعلى معايير الجودة
                </p>
              </div>
            </div>

            <div className="relative group scroll-animate opacity-0 translate-y-8">
              <div className="absolute inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="bg-cyan-100 rounded-xl p-4 group-hover:bg-cyan-600 transition-colors duration-300">
                      <ThumbsUp size={28} className="text-cyan-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">رضا العملاء</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  نسعى دائماً لتقديم تجربة مميزة تفوق توقعات عملائنا
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-b from-[#e0f2fe] to-[#f0faff]">
        <div className="container-custom">
          <div className="text-center mb-12 scroll-animate opacity-0 translate-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">كيف نعمل</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              نظام عملنا بسيط وسهل لضمان تجربة مريحة لعملائنا
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            <div className="flex-1 text-center p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-cyan-100/50 scroll-animate opacity-0 translate-y-8">
              <div className="bg-cyan-100 rounded-xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone size={32} className="text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                اطلب الخدمة
              </h3>
              <p className="text-slate-600">
                تواصل معنا عبر الهاتف أو الواتساب لطلب خدمتك
              </p>
            </div>

            <div className="flex-1 text-center p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-cyan-100/50 scroll-animate opacity-0 translate-y-8">
              <div className="bg-cyan-100 rounded-xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin size={32} className="text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                حدد موقعك
              </h3>
              <p className="text-slate-600">
                أخبرنا بموقعك ليصلك فريقنا في أسرع وقت
              </p>
            </div>

            <div className="flex-1 text-center p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-cyan-100/50 scroll-animate opacity-0 translate-y-8">
              <div className="bg-cyan-100 rounded-xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle size={32} className="text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                استمتع بالخدمة
              </h3>
              <p className="text-slate-600">
                استرخِ ودع فريقنا المحترف يهتم بكل التفاصيل
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-[#f0faff] to-[#e0f2fe] relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-cyan-300/15 to-blue-300/15 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-animate opacity-0 translate-y-8">
            <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Star className="w-4 h-4" />
              <span>تقييمات العملاء</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-6">
              ما يقوله <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-l from-cyan-600 to-blue-600">عملاؤنا</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              نفخر بثقة عملائنا الكرام ونسعى دائماً لتقديم تجربة استثنائية تفوق التوقعات
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial Card 1 */}
            <div className="group relative scroll-animate opacity-0 translate-y-8">
              <div className="absolute inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-cyan-100/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">أ</span>
                  </div>
                </div>
                <blockquote className="text-slate-700 mb-6 text-lg leading-relaxed italic">
                  "تجربة رائعة حقاً! الفريق محترف جداً والخدمة سريعة وموثوقة. أنصح الجميع بالتعامل معهم."
                </blockquote>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-lg">أحمد محمد</p>
                    <p className="text-cyan-600 font-medium">مهندس معماري</p>
                  </div>
                  <div className="text-cyan-600">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Card 2 */}
            <div className="group relative scroll-animate opacity-0 translate-y-8">
              <div className="absolute inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-cyan-100/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">ف</span>
                  </div>
                </div>
                <blockquote className="text-slate-700 mb-6 text-lg leading-relaxed italic">
                  "خدمة توصيل متميزة وسرعة في الاستجابة. الفريق ودود ومحترف، والأسعار معقولة جداً."
                </blockquote>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-lg">فاطمة أحمد</p>
                    <p className="text-cyan-600 font-medium">طبيبة أطفال</p>
                  </div>
                  <div className="text-cyan-600">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Card 3 */}
            <div className="group relative scroll-animate opacity-0 translate-y-8">
              <div className="absolute inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-cyan-100/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">س</span>
                  </div>
                </div>
                <blockquote className="text-slate-700 mb-6 text-lg leading-relaxed italic">
                  "أفضل خدمة صيانة تعاملت معها. حلوا مشكلتي بسرعة ومهارة عالية. شكراً لكم!"
                </blockquote>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-lg">سارة علي</p>
                    <p className="text-cyan-600 font-medium">مديرة مشاريع</p>
                  </div>
                  <div className="text-cyan-600">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center scroll-animate opacity-0 translate-y-8">
            <div className="inline-flex items-center gap-8 bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg border border-cyan-100/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">+1500</p>
                  <p className="text-sm text-slate-600">عميل راضٍ</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">4.9/5</p>
                  <p className="text-sm text-slate-600">تقييم عام</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">100%</p>
                  <p className="text-sm text-slate-600">موثوقية</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Premium Footer */}
      <footer className="relative bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500"></div>
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        </div>
        
        <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 scroll-animate opacity-0 translate-y-8">
            {/* Company Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-white font-bold text-xl">ل</span>
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">لبيه</h3>
                    <p className="text-cyan-400 text-sm md:text-base font-medium">خدمات استثنائية</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-md">
                  منصة رائدة في تقديم خدمات التوصيل والصيانة المنزلية بأعلى معايير الجودة والاحترافية لأهالي الخارجة والمناطق المحيطة.
              </p>
              </div>

              {/* Social Media */}
              <div>
                <h4 className="text-white font-semibold text-base md:text-lg mb-4">تابعنا على</h4>
                <div className="flex gap-3">
                  <a href="#" className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.767.966.966 2.165 1.164 3.322 1.363 3.521 0 2.478-1.463 5.199-3.674 5.849z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gradient-to-br from-pink-600 to-rose-700 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 2.567-1.289 0-1.289.339-1.628.992-2.652z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Links & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Quick Links */}
              <div>
                <h4 className="text-white font-bold text-lg mb-4">روابط سريعة</h4>
                <ul className="space-y-3 text-sm md:text-base">
                  <li><Link to="/" className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2 group">
                    <HomeIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    الرئيسية
                  </Link></li>
                  <li><Link to="/categories" className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2 group">
                    <Package className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    خدماتنا
                  </Link></li>
                  <li><Link to="/about" className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2 group">
                    <Users className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    من نحن
                  </Link></li>
                  <li><Link to="/contact" className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2 group">
                    <Phone className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    اتصل بنا
                  </Link></li>
              </ul>
            </div>

            {/* Contact Info */}
              <div>
                <h4 className="text-white font-bold text-lg mb-4">تواصل معنا</h4>
                <ul className="space-y-3 text-sm md:text-base">
                  <li className="flex items-start gap-3 text-slate-300">
                    <MapPin className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">موقعنا</p>
                      <p>الخارجة، محافظة الوادي الجديد</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <Phone className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">هاتف</p>
                      <a href="tel:+20123456789" className="hover:text-cyan-400 transition-colors duration-300">0123-456-789</a>
                    </div>
                </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <Mail className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">البريد الإلكتروني</p>
                      <a href="mailto:info@labeeh.com" className="hover:text-cyan-400 transition-colors duration-300">info@labeeh.com</a>
                    </div>
                </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <Clock className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">ساعات العمل</p>
                      <p>24/7 - طوال أيام الأسبوع</p>
                    </div>
                </li>
              </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-700 pt-6 scroll-animate opacity-0 translate-y-8 text-sm">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-slate-400 text-center sm:text-left">
                <p>&copy; {new Date().getFullYear()} <span className="text-cyan-400 font-semibold">لبيه</span> - جميع الحقوق محفوظة</p>
                <p className="mt-1">تم التطوير بـ ❤️ لخدمة أهالي الخارجة</p>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <a href="#" className="hover:text-cyan-400 transition-colors duration-300">سياسة الخصوصية</a>
                <a href="#" className="hover:text-cyan-400 transition-colors duration-300">الشروط والأحكام</a>
                <a href="#" className="hover:text-cyan-400 transition-colors duration-300">اتفاقية الاستخدام</a>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full shadow-2xl hover:shadow-cyan-500/25 flex items-center justify-center transition-all duration-300 transform hover:scale-110 z-50"
        >
          <ArrowRight className="w-6 h-6 transform rotate-90" />
        </button>
      </footer>
    </div>
  );
};

export default Home;