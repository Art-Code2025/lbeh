import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Users, 
  Package,
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Menu,
  X,
  Zap,
  Tag,
  Loader2,
  Bell,
  Clock,
  MapPin,
  Phone,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Volume2
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Services
import { servicesApi, categoriesApi, Service, Category } from './services/servicesApi';
import { fetchBookings, Booking, updateBooking } from './services/bookingsApi';
import { testCloudinaryConnection } from './services/cloudinary';

// Components
import ServiceModal from './components/ServiceModal';
import CategoryModal from './components/CategoryModal';

function Dashboard() {
  // State
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'categories' | 'bookings'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Real-time bookings
  const [newBookingsCount, setNewBookingsCount] = useState(0);
  const [lastBookingUpdate, setLastBookingUpdate] = useState<Date>(new Date());
  const [lastBookingIds, setLastBookingIds] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.6;
    audioRef.current.preload = 'auto';
    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
    startRealTimeBookings();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [servicesData, categoriesData, bookingsData] = await Promise.all([
        servicesApi.getAll(),
        categoriesApi.getAll(),
        fetchBookings()
      ]);
      
      setServices(servicesData);
      setCategories(categoriesData);
      setBookings(bookingsData);
      
      // Initialize lastBookingIds with current booking IDs
      const currentBookingIds = new Set(bookingsData.map(booking => booking.id));
      setLastBookingIds(currentBookingIds);
      
      setLastBookingUpdate(new Date());
    } catch (err) {
      console.error('Error loading data:', err);
      setError('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Real-time bookings polling
  const startRealTimeBookings = () => {
    intervalRef.current = setInterval(async () => {
      try {
        const newBookingsData = await fetchBookings();
        const newBookingIds = new Set(newBookingsData.map(booking => booking.id));
        
        // Check for truly new bookings
        const actualNewBookings = newBookingsData.filter(booking => 
          !lastBookingIds.has(booking.id)
        );
        
        if (actualNewBookings.length > 0) {
          setNewBookingsCount(prev => prev + actualNewBookings.length);
          
          // Play notification sound only once
          if (audioRef.current) {
            audioRef.current.currentTime = 0; // Reset audio to start
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
          }
          
          // Show toast notification
          toast.success(`🔔 ${actualNewBookings.length} حجز جديد وصل!`, {
            position: "top-left",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          // Update lastBookingIds
          setLastBookingIds(newBookingIds);
        }
        
        setBookings(newBookingsData);
        setLastBookingUpdate(new Date());
      } catch (error) {
        console.error('Error fetching real-time bookings:', error);
      }
    }, 5000); // Check every 5 seconds instead of 3
  };

  // Service handlers
  const handleServiceSave = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingService) {
        await servicesApi.update(editingService.id, serviceData);
        toast.success('✅ تم تحديث الخدمة بنجاح');
      } else {
        await servicesApi.create(serviceData);
        toast.success('✅ تم إضافة الخدمة بنجاح');
      }
      
      setShowServiceModal(false);
      setEditingService(null);
      await loadData();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('❌ فشل في حفظ الخدمة');
    }
  };

  const handleServiceEdit = (service: Service) => {
    setEditingService(service);
    setShowServiceModal(true);
  };

  const handleServiceDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
      try {
        await servicesApi.delete(id);
        toast.success('✅ تم حذف الخدمة بنجاح');
        await loadData();
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('❌ فشل في حذف الخدمة');
      }
    }
  };

  // Category handlers
  const handleCategorySave = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, categoryData);
        toast.success('✅ تم تحديث الفئة بنجاح');
      } else {
        await categoriesApi.create(categoryData);
        toast.success('✅ تم إضافة الفئة بنجاح');
      }
      
      setShowCategoryModal(false);
      setEditingCategory(null);
      await loadData();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('❌ فشل في حفظ الفئة');
    }
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleCategoryDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
      try {
        await categoriesApi.delete(id);
        toast.success('✅ تم حذف الفئة بنجاح');
        await loadData();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('❌ فشل في حذف الفئة');
      }
    }
  };

  // Booking handlers
  const handleBookingStatusUpdate = async (bookingId: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      await updateBooking(bookingId, { status: newStatus });
      toast.success('✅ تم تحديث حالة الحجز');
      await loadData();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('❌ فشل في تحديث حالة الحجز');
    }
  };

  const handleTestCloudinary = async () => {
    try {
      setLoading(true);
      toast.info('🔍 جاري اختبار Cloudinary...');
      
      const isConnected = await testCloudinaryConnection();
      if (isConnected) {
        toast.success('✅ Cloudinary يعمل بشكل مثالي!');
      } else {
        toast.error('❌ مشكلة في Cloudinary');
      }
    } catch (error) {
      console.error('Error testing Cloudinary:', error);
      toast.error('❌ فشل في اختبار Cloudinary');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-400/20 rounded-full animate-pulse mx-auto"></div>
          </div>
          <p className="text-gray-300 text-lg font-medium">جاري تحميل لوحة التحكم...</p>
          <p className="text-gray-500 text-sm mt-2">يرجى الانتظار</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto text-center border border-gray-700/50 shadow-2xl">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">عذراً، حدث خطأ</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-gray-800/90 backdrop-blur-xl border-l border-gray-700/50 transform transition-transform duration-300 ease-in-out z-50 shadow-2xl ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Enhanced Header */}
          <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">لبيه</h1>
                  <p className="text-xs text-gray-400">لوحة التحكم المتطورة</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Real-time Status */}
          <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">متصل مباشر</span>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">آخر تحديث: {formatTimeAgo(lastBookingUpdate)}</span>
              </div>
            </div>
            {newBookingsCount > 0 && (
              <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-yellow-400 animate-bounce" />
                  <span className="text-sm text-yellow-400 font-medium">
                    {newBookingsCount} حجز جديد في انتظار المراجعة
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: BarChart3, count: null },
              { id: 'categories', label: 'إدارة الفئات', icon: Tag, count: categories.length },
              { id: 'services', label: 'إدارة الخدمات', icon: Package, count: services.length },
              { id: 'bookings', label: 'إدارة الحجوزات', icon: Calendar, count: bookings.length, hasNew: newBookingsCount > 0 }
            ].map(({ id, label, icon: Icon, count, hasNew }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id as any);
                  setIsSidebarOpen(false);
                  if (id === 'bookings') setNewBookingsCount(0);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {count !== null && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activeTab === id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {count}
                    </span>
                  )}
                  {hasNew && (
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
            ))}
          </nav>

          {/* Enhanced Footer */}
          <div className="p-4 border-t border-gray-700/50 space-y-2">
            <button
              onClick={handleTestCloudinary}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl font-medium transition-colors group"
            >
              <Zap className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
              <span>اختبار Cloudinary</span>
            </button>
            <button
              onClick={loadData}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl font-medium transition-colors group"
            >
              <RefreshCw className="w-5 h-5 group-hover:animate-spin transition-all" />
              <span>تحديث البيانات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="lg:mr-80">
        {/* Enhanced Top Bar */}
        <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white">
                {activeTab === 'overview' && '📊 نظرة عامة'}
                {activeTab === 'categories' && '🏷️ إدارة الفئات'}
                {activeTab === 'services' && '📦 إدارة الخدمات'}
                {activeTab === 'bookings' && '📅 إدارة الحجوزات'}
              </h2>
              {activeTab === 'bookings' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>مباشر</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400">
                آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-300 text-sm font-medium">إجمالي الخدمات</p>
                      <p className="text-3xl font-bold text-white mt-1">{services.length}</p>
                      <p className="text-blue-400 text-xs mt-1">+2 هذا الأسبوع</p>
                    </div>
                    <div className="p-3 bg-blue-500/30 rounded-xl">
                      <Package className="w-8 h-8 text-blue-300" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-300 text-sm font-medium">إجمالي الفئات</p>
                      <p className="text-3xl font-bold text-white mt-1">{categories.length}</p>
                      <p className="text-green-400 text-xs mt-1">مستقر</p>
                    </div>
                    <div className="p-3 bg-green-500/30 rounded-xl">
                      <Tag className="w-8 h-8 text-green-300" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm font-medium">إجمالي الحجوزات</p>
                      <p className="text-3xl font-bold text-white mt-1">{bookings.length}</p>
                      <p className="text-purple-400 text-xs mt-1">+{newBookingsCount} جديد</p>
                    </div>
                    <div className="p-3 bg-purple-500/30 rounded-xl relative">
                      <Calendar className="w-8 h-8 text-purple-300" />
                      {newBookingsCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">{newBookingsCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 transform hover:scale-105 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-300 text-sm font-medium">الحجوزات المعلقة</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {bookings.filter(b => b.status === 'pending').length}
                      </p>
                      <p className="text-orange-400 text-xs mt-1">يحتاج مراجعة</p>
                    </div>
                    <div className="p-3 bg-orange-500/30 rounded-xl">
                      <Users className="w-8 h-8 text-orange-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  النشاط الأخير
                </h3>
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((booking, index) => (
                    <div key={booking.id} className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">حجز جديد: {booking.serviceName}</p>
                        <p className="text-gray-400 text-xs">العميل: {booking.fullName}</p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatTimeAgo(new Date(booking.createdAt || ''))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">الفئات</h3>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  إضافة فئة
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => (
                  <div key={category.id} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 transform hover:scale-105 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-xl">
                          {category.icon || '📦'}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-lg">{category.name}</h4>
                          <p className="text-gray-400 text-sm">
                            {services.filter(s => s.category === category.id).length} خدمة
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleCategoryEdit(category)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleCategoryDelete(category.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{category.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">الخدمات</h3>
                <button
                  onClick={() => setShowServiceModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  إضافة خدمة
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                  <div key={service.id} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 transform hover:scale-105 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-white text-lg">{service.name}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleServiceEdit(service)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleServiceDelete(service.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">{service.homeShortDescription}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                        {service.categoryName}
                      </span>
                      {service.price && (
                        <span className="text-yellow-400 font-bold">
                          {service.price}
                        </span>
                      )}
                    </div>
                    {service.mainImage && (
                      <img 
                        src={service.mainImage} 
                        alt={service.name}
                        className="w-full h-32 object-cover rounded-xl mt-3 border border-gray-600/50"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-bold text-white">الحجوزات</h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>تحديث مباشر</span>
                  </div>
                </div>
                <button
                  onClick={loadData}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  تحديث
                </button>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 overflow-hidden shadow-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-300">إجمالي الحجوزات: <span className="text-white font-bold">{bookings.length}</span></p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <span className="text-gray-400">معلق ({bookings.filter(b => b.status === 'pending').length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-400">مؤكد ({bookings.filter(b => b.status === 'confirmed').length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-gray-400">مكتمل ({bookings.filter(b => b.status === 'completed').length})</span>
                      </div>
                    </div>
                  </div>
                  
                  {bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">لا توجد حجوزات حالياً</p>
                      <p className="text-gray-500 text-sm mt-2">ستظهر الحجوزات الجديدة هنا تلقائياً</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-bold text-white text-lg">{booking.serviceName}</h4>
                                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getStatusColor(booking.status)}`}>
                                  {getStatusIcon(booking.status)}
                                  {booking.status === 'pending' && 'معلق'}
                                  {booking.status === 'confirmed' && 'مؤكد'}
                                  {booking.status === 'completed' && 'مكتمل'}
                                  {booking.status === 'cancelled' && 'ملغي'}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center gap-2 text-gray-300">
                                  <User className="w-4 h-4 text-blue-400" />
                                  <span className="text-sm">{booking.fullName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Phone className="w-4 h-4 text-green-400" />
                                  <span className="text-sm">{booking.phoneNumber}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <MapPin className="w-4 h-4 text-red-400" />
                                  <span className="text-sm">{booking.address}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Clock className="w-4 h-4 text-purple-400" />
                                  <span className="text-sm">{formatTimeAgo(new Date(booking.createdAt || ''))}</span>
                                </div>
                              </div>
                              
                              {booking.serviceDetails && (
                                <div className="bg-gray-600/30 rounded-lg p-3 mb-4">
                                  <p className="text-gray-300 text-sm"><strong>تفاصيل الخدمة:</strong> {booking.serviceDetails}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-2 ml-4">
                              {booking.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleBookingStatusUpdate(booking.id, 'confirmed')}
                                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                                  >
                                    تأكيد
                                  </button>
                                  <button
                                    onClick={() => handleBookingStatusUpdate(booking.id, 'cancelled')}
                                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                                  >
                                    إلغاء
                                  </button>
                                </>
                              )}
                              {booking.status === 'confirmed' && (
                                <button
                                  onClick={() => handleBookingStatusUpdate(booking.id, 'completed')}
                                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                                >
                                  إكمال
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ServiceModal
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setEditingService(null);
        }}
        onSave={handleServiceSave}
        editingService={editingService}
        categories={categories}
      />

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        onSave={handleCategorySave}
        editingCategory={editingCategory}
      />

      {/* Enhanced Toast Container */}
      <ToastContainer
        position="top-left"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: 'rgba(31, 41, 55, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          borderRadius: '12px',
          color: 'white'
        }}
      />
    </div>
  );
}

export default Dashboard; 