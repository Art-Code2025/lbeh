import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Wrench,
  ShoppingBag,
  Settings,
  ArrowRight,
  Clock,
  CheckCircle,
  Shield,
  Star,
  Users,
  Package,
  TrendingUp,
  MapPin
} from 'lucide-react';

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
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First try Netlify Functions
        try {
          const categoriesResponse = await fetch('/.netlify/functions/categories');
          const servicesResponse = await fetch('/.netlify/functions/services');
          
          if (categoriesResponse.ok && servicesResponse.ok) {
            const categoriesData = await categoriesResponse.json();
            const servicesData = await servicesResponse.json();
            
            setCategories(categoriesData || []);
            setServices(servicesData || []);
            return;
          }
        } catch (netlifyError) {
          console.log('Netlify Functions not available, using Firebase directly...');
        }

        // Fallback to Firebase direct access
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
        
        // جلب الفئات
        const categoriesRef = collection(db, 'categories');
        const categoriesSnapshot = await getDocs(categoriesRef);
        const categoriesData: any[] = [];
        
        categoriesSnapshot.forEach((doc) => {
          categoriesData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setCategories(categoriesData || []);

        // إنشاء الخدمات من الفئات
        const servicesData: any[] = [];
        categoriesSnapshot.forEach((doc) => {
          const category = doc.data();
          servicesData.push({
            id: doc.id,
            name: category.name,
            category: doc.id,
            categoryName: category.name,
            homeShortDescription: category.description,
            mainImage: getDefaultImage(doc.id),
            price: getDefaultPrice(doc.id)
          });
        });
        
        setServices(servicesData || []);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set empty arrays as fallback
        setCategories([]);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case '🚚':
        return <Truck className="w-8 h-8" />;
      case '🔧':
        return <Wrench className="w-8 h-8" />;
      case '🗺️':
        return <MapPin className="w-8 h-8" />;
      default:
        return <Settings className="w-8 h-8" />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          gradient: 'from-cyan-500 to-cyan-600',
          bg: 'bg-cyan-100',
          text: 'text-cyan-600',
          hover: 'group-hover:bg-cyan-600',
          hoverText: 'group-hover:text-white',
          button: 'bg-cyan-600 hover:bg-cyan-700'
        };
      case 'green':
        return {
          gradient: 'from-emerald-500 to-emerald-600',
          bg: 'bg-emerald-100',
          text: 'text-emerald-600',
          hover: 'group-hover:bg-emerald-600',
          hoverText: 'group-hover:text-white',
          button: 'bg-emerald-600 hover:bg-emerald-700'
        };
      case 'orange':
        return {
          gradient: 'from-amber-500 to-amber-600',
          bg: 'bg-amber-100',
          text: 'text-amber-600',
          hover: 'group-hover:bg-amber-600',
          hoverText: 'group-hover:text-white',
          button: 'bg-amber-600 hover:bg-amber-700'
        };
      default:
        return {
          gradient: 'from-cyan-500 to-cyan-600',
          bg: 'bg-cyan-100',
          text: 'text-cyan-600',
          hover: 'group-hover:bg-cyan-600',
          hoverText: 'group-hover:text-white',
          button: 'bg-cyan-600 hover:bg-cyan-700'
        };
    }
  };

  const getCategoryServices = (categoryId: string) => {
    return services.filter(service => service.category === categoryId);
  };

  const getCategoryStats = (categoryId: string) => {
    const categoryServices = getCategoryServices(categoryId);
    return {
      servicesCount: categoryServices.length,
      rating: '4.8', // يمكن حسابها من بيانات الحجوزات لاحقاً
      completed: Math.floor(Math.random() * 1000) + 500 // مؤقت
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">جاري تحميل الفئات...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern-bg.png')] opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              اكتشف <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-l from-cyan-600 to-blue-600">خدماتنا المتميزة</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
              نقدم مجموعة متكاملة من الخدمات عالية الجودة لتلبية جميع احتياجاتك بكفاءة واحترافية
            </p>
            <div className="flex items-center justify-center gap-8 text-slate-700">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">10,000+</div>
                <div className="text-sm">عميل سعيد</div>
              </div>
              <div className="h-12 w-px bg-slate-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">4.8</div>
                <div className="text-sm">تقييم الخدمة</div>
              </div>
              <div className="h-12 w-px bg-slate-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">24/7</div>
                <div className="text-sm">دعم متواصل</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category) => (
              <div key={category.id} className="group relative">
                <div className={`absolute inset-0.5 bg-gradient-to-r from-${category.color}-500 to-${category.color}-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500`}></div>
                <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start gap-6 mb-8">
                    <div className={`flex-shrink-0 ${getColorClasses(category.color).bg} p-4 rounded-xl ${getColorClasses(category.color).hover} transition-colors duration-300`}>
                      <div className={`${getColorClasses(category.color).text} ${getColorClasses(category.color).hoverText} transition-colors duration-300`}>
                        {getIconComponent(category.icon)}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{category.name}</h3>
                      <p className="text-slate-600">{category.description}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-slate-50 rounded-xl">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-slate-700 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold">{getCategoryStats(category.id).servicesCount}</span>
                      </div>
                      <div className="text-sm text-slate-600">خدمة</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-slate-700 mb-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">{getCategoryStats(category.id).rating}</span>
                      </div>
                      <div className="text-sm text-slate-600">تقييم</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-slate-700 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="font-semibold">{getCategoryStats(category.id).completed}</span>
                      </div>
                      <div className="text-sm text-slate-600">طلب منجز</div>
                    </div>
                  </div>
                  
                  {/* Services List */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-slate-600" />
                      الخدمات المتوفرة
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {getCategoryServices(category.id).slice(0, 3).map((service, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-slate-700">{service.name}</span>
                        </div>
                      ))}
                      {getCategoryServices(category.id).length > 3 && (
                        <div className="text-center">
                          <span className="text-sm text-slate-500">و {getCategoryServices(category.id).length - 3} خدمة أخرى...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-slate-600" />
                      المميزات
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                          <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm text-slate-700">خدمة سريعة ومضمونة</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                        <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-slate-700">أمان وثقة</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <span className="text-sm text-slate-700">جودة عالية</span>
                        </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link 
                    to={`/services/${category.id}`}
                    className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 ${getColorClasses(category.color).button} text-white rounded-xl transition-colors duration-300 font-semibold`}
                  >
                    <span>اطلب الخدمة</span>
                    <ArrowRight className="w-5 h-5 transform -rotate-180" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">لم تجد ما تبحث عنه؟</h2>
            <p className="text-lg opacity-90 mb-8 leading-relaxed">
              فريقنا جاهز لمساعدتك في العثور على الخدمة المثالية التي تناسب احتياجاتك. تواصل معنا الآن!
            </p>
            <Link 
              to="/contact"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-cyan-600 rounded-xl hover:bg-opacity-90 transition-colors duration-300 font-semibold"
            >
              <span>تواصل معنا</span>
              <ArrowRight className="w-5 h-5 transform -rotate-180" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Categories; 