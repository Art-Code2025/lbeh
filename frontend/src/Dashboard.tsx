import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Eye, 
  Trash2, 
  Edit, 
  LogOut, 
  BarChart3, 
  PieChart, 
  Users, 
  Settings,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Phone,
  MapPin,
  Filter,
  Search,
  Download,
  RefreshCw,
  Tag,
  Package,
  TrendingUp,
  Activity,
  Menu,
  X,
  Grid,
  List,
  Save,
  Upload,
  Zap,
  Shield,
  Star,
  Home,
  Truck,
  Wrench
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CategoryModal from './components/CategoryModal';
import ServiceModal from './components/ServiceModal';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

// تعريف الواجهات
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

interface Booking {
  id: number;
  serviceId: number;
  serviceName: string;
  serviceCategory: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  serviceDetails: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  byCategory: Record<string, number>;
  byService: Record<string, number>;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  serviceCount: number;
}

function Dashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'bookings' | 'categories'>('overview');
  const [bookingFilter, setBookingFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const navigate = useNavigate();

  const categories: Category[] = [
    {
      id: 'daily_services',
      name: 'الخدمات اليومية / المشاوير الداخلية',
      description: 'خدمات التوصيل والمشاوير اليومية داخل المدينة',
      icon: '🚚',
      color: 'blue',
      serviceCount: services.filter(s => s.category === 'daily_services').length
    },
    {
      id: 'external_errands',
      name: 'المشاوير الخارجية',
      description: 'المشاوير والتوصيل للمسافات البعيدة بين المدن',
      icon: '🗺️',
      color: 'green',
      serviceCount: services.filter(s => s.category === 'external_errands').length
    },
    {
      id: 'home_maintenance',
      name: 'الأعمال المنزلية والفنية',
      description: 'خدمات الصيانة والإصلاح المنزلي المتخصصة',
      icon: '🔧',
      color: 'orange',
      serviceCount: services.filter(s => s.category === 'home_maintenance').length
    }
  ];

  useEffect(() => {
    fetchServices();
    fetchBookings();
    fetchBookingStats();
  }, []);

  useEffect(() => {
    let filtered = bookings;
    
    if (bookingFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === bookingFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phoneNumber.includes(searchTerm)
      );
    }
    
    setFilteredBookings(filtered);
  }, [bookings, bookingFilter, searchTerm]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/.netlify/functions/services');
      if (!response.ok) {
        throw new Error('فشل في جلب الخدمات');
      }
      const data = await response.json();
      setServices(data);
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('/.netlify/functions/bookings');
      if (!response.ok) {
        throw new Error('فشل في جلب الحجوزات');
      }
      const data = await response.json();
      setBookings(data);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchBookingStats = async () => {
    try {
      const response = await fetch('/.netlify/functions/bookings/stats');
      if (!response.ok) {
        throw new Error('فشل في جلب إحصائيات الحجوزات');
      }
      const data = await response.json();
      setBookingStats(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceDelete = async (id: number) => {
    try {
      const response = await fetch(`/.netlify/functions/services?id=${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('فشل في حذف الخدمة');
      }
      toast.success('تم حذف الخدمة بنجاح');
      fetchServices();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleBookingStatusUpdate = async (bookingId: number, newStatus: Booking['status']) => {
    try {
      const response = await fetch(`/.netlify/functions/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) {
        throw new Error('فشل في تحديث حالة الحجز');
      }
      toast.success('تم تحديث حالة الحجز بنجاح');
      fetchBookings();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleBookingDelete = async (bookingId: number) => {
    try {
      const response = await fetch(`/.netlify/functions/bookings/${bookingId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('فشل في حذف الحجز');
      }
      toast.success('تم حذف الحجز بنجاح');
      fetchBookings();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  const refreshData = () => {
    setLoading(true);
    fetchServices();
    fetchBookings();
    fetchBookingStats();
  };

  const exportBookings = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Service Name,Customer Name,Phone,Address,Status,Created At\n" +
      bookings.map(booking => 
        `${booking.id},"${booking.serviceName}","${booking.fullName}","${booking.phoneNumber}","${booking.address}","${booking.status}","${new Date(booking.createdAt).toLocaleDateString('ar-SA')}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bookings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم تصدير البيانات بنجاح');
  };

  const getImageSrc = (image: string) => {
    return image;
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: Booking['status']) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'confirmed': return 'مؤكد';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
    }
  };

  // إعداد بيانات الرسوم البيانية
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#9CA3AF'
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#9CA3AF' },
        grid: { color: '#374151' }
      },
      y: {
        ticks: { color: '#9CA3AF' },
        grid: { color: '#374151' }
      }
    }
  };

  const categoryData = bookingStats ? {
    labels: Object.keys(bookingStats.byCategory),
    datasets: [{
      label: 'الحجوزات حسب الفئة',
      data: Object.values(bookingStats.byCategory),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 2
    }]
  } : null;

  const statusData = bookingStats ? {
    labels: ['في الانتظار', 'مؤكد', 'قيد التنفيذ', 'مكتمل', 'ملغي'],
    datasets: [{
      label: 'الحجوزات حسب الحالة',
      data: [
        bookingStats.pending,
        bookingStats.confirmed,
        bookingStats.inProgress,
        bookingStats.completed,
        bookingStats.cancelled
      ],
      backgroundColor: [
        'rgba(245, 158, 11, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ]
    }]
  } : null;

  const handleCategorySave = (newCategory: Category) => {
    // هنا يمكن إضافة API call لحفظ الفئة
    console.log('Saving category:', newCategory);
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleCategoryDelete = async (categoryId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
      try {
        // API call to delete category
        toast.success('تم حذف الفئة بنجاح');
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف الفئة');
      }
    }
  };

  const handleServiceSave = async (serviceData: FormData) => {
    try {
      const url = editingService
        ? `/.netlify/functions/services/${editingService.id}`
        : '/.netlify/functions/services';
      
      const method = editingService ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
      });

      if (!response.ok) {
        throw new Error('فشل في حفظ الخدمة');
      }

      fetchServices();
      setShowServiceModal(false);
      setEditingService(null);
      toast.success(editingService ? 'تم تحديث الخدمة بنجاح' : 'تم إضافة الخدمة بنجاح');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
  return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-900 text-white">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-gray-800 border-l border-gray-700 transform transition-transform duration-300 ease-in-out z-50 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">لبيه</h1>
                  <p className="text-xs text-gray-400">لوحة التحكم</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
              { id: 'categories', label: 'إدارة الفئات', icon: Tag },
              { id: 'services', label: 'إدارة الخدمات', icon: Package },
              { id: 'bookings', label: 'إدارة الحجوزات', icon: Calendar }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id as any);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700 space-y-2">
            <button
              onClick={refreshData}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-200"
            >
              <RefreshCw className="w-5 h-5" />
              تحديث البيانات
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              تسجيل الخروج
            </button>
          </div>
          </div>
      </div>

      {/* Main Content */}
      <div className="lg:mr-80">
        {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {activeTab === 'overview' && 'نظرة عامة'}
                  {activeTab === 'categories' && 'إدارة الفئات'}
                  {activeTab === 'services' && 'إدارة الخدمات'}
                  {activeTab === 'bookings' && 'إدارة الحجوزات'}
          </h1>
                <p className="text-gray-400 text-sm">إدارة شاملة للخدمات والحجوزات</p>
        </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">الموقع الرئيسي</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">إجمالي الخدمات</p>
                      <p className="text-3xl font-bold">{services.length}</p>
    </div>
                    <Package className="w-8 h-8 text-blue-200" />
    </div>
  </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">إجمالي الحجوزات</p>
                      <p className="text-3xl font-bold">{bookingStats?.total || 0}</p>
    </div>
                    <Users className="w-8 h-8 text-green-200" />
    </div>
  </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">في الانتظار</p>
                      <p className="text-3xl font-bold">{bookingStats?.pending || 0}</p>
</div>
                    <Clock className="w-8 h-8 text-yellow-200" />
            </div>
            </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">مكتملة</p>
                      <p className="text-3xl font-bold">{bookingStats?.completed || 0}</p>
          </div>
                    <TrendingUp className="w-8 h-8 text-purple-200" />
                  </div>
          </div>
        </div>

              {/* Charts */}
              {bookingStats && (categoryData || statusData) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {categoryData && (
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                      <h3 className="text-xl font-semibold text-white mb-4">الحجوزات حسب الفئة</h3>
                      <div className="h-64">
                        <Bar data={categoryData} options={chartOptions} />
                      </div>
          </div>
        )}
                  {statusData && (
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                      <h3 className="text-xl font-semibold text-white mb-4">حالة الحجوزات</h3>
                      <div className="h-64">
                        <Doughnut data={statusData} options={chartOptions} />
                      </div>
                    </div>
                  )}
          </div>
        )}

              {/* Recent Activity */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    النشاط الأخير
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                        <div className={`p-2 rounded-full ${getStatusColor(booking.status)} border`}>
                          {getStatusIcon(booking.status)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{booking.fullName}</p>
                          <p className="text-sm text-gray-400">{booking.serviceName}</p>
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(booking.createdAt).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-white">إدارة الفئات</h2>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setShowCategoryModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  إضافة فئة جديدة
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div key={category.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`text-3xl p-3 bg-${category.color}-500/20 rounded-lg border border-${category.color}-500/30`}>
                        {category.icon}
          </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                        <p className="text-sm text-gray-400">{category.serviceCount} خدمة</p>
            </div>
                    </div>

                    <p className="text-gray-300 mb-4 text-sm leading-relaxed">{category.description}</p>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleCategoryEdit(category)}
                        className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors font-medium"
                      >
                        <Edit className="w-4 h-4 inline ml-1" />
                        تعديل
                      </button>
                      <button 
                        onClick={() => handleCategoryDelete(category.id)}
                        className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors border border-red-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
          </div>
        </div>
                ))}
              </div>
          </div>
        )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">إدارة الخدمات</h2>
                <button
                  onClick={() => {
                    setEditingService(null);
                    setShowServiceModal(true);
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  إضافة خدمة جديدة
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                  <div key={service.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                              {service.mainImage ? (
                                <img
                                  src={getImageSrc(service.mainImage)}
                                  alt={service.name}
                          className="w-full h-full object-cover"
                                />
                              ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                                </div>
                              )}
                            </div>

                    <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                    <p className="text-gray-600 mb-4">{service.homeShortDescription}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        {service.categoryName}
                      </span>
                      <div className="flex gap-2">
                                <button
                          onClick={() => setEditingService(service)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                          <Edit className="w-5 h-5" />
                                </button>
                                <button
                          onClick={() => handleServiceDelete(service.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                          <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                  </div>
                ))}
              </div>

              {/* Service Modal */}
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
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <>
              {/* Filters and Actions */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold text-white">إدارة الحجوزات</h2>
                                  <button
                    onClick={exportBookings}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg"
                                  >
                    <Download className="w-5 h-5" />
                    تصدير Excel
                                  </button>
                                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="البحث في الحجوزات..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                      />
                              </div>
                          </div>
                  <div className="flex gap-2">
                    <select
                      value={bookingFilter}
                      onChange={(e) => setBookingFilter(e.target.value)}
                      className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    >
                      <option value="all">جميع الحالات</option>
                      <option value="pending">في الانتظار</option>
                      <option value="confirmed">مؤكد</option>
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="completed">مكتمل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                        </div>
                </div>
              </div>

              {/* Bookings List */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h3 className="text-xl font-semibold text-white">
                    قائمة الحجوزات ({filteredBookings.length})
                  </h3>
                </div>
                
                {filteredBookings.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                    <p>لا توجد حجوزات تطابق البحث</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-700">
                    {filteredBookings.map((booking) => (
                      <div key={booking.id} className="p-6 hover:bg-gray-700/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-white">{booking.serviceName}</h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                {getStatusIcon(booking.status)}
                                {getStatusText(booking.status)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                              <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-300">
                                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                                  <span><strong>العميل:</strong> {booking.fullName}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-300">
                                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                  <span><strong>الهاتف:</strong> {booking.phoneNumber}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-300">
                                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                  <span><strong>العنوان:</strong> {booking.address}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-300">
                                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                  <span><strong>تاريخ الإنشاء:</strong> {new Date(booking.createdAt).toLocaleDateString('ar-SA')}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {booking.serviceDetails && (
                                  <div className="flex items-start text-sm text-gray-300">
                                    <FileText className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                                    <span><strong>التفاصيل:</strong> {booking.serviceDetails.substring(0, 100)}...</span>
                                </div>
                              )}
                            </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mr-4">
                            {/* Status Update Buttons */}
                            {booking.status === 'pending' && (
                              <>
                                    <button
                                  onClick={() => handleBookingStatusUpdate(booking.id, 'confirmed')}
                                  className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                                    >
                                  تأكيد
                                    </button>
                                    <button
                                  onClick={() => handleBookingStatusUpdate(booking.id, 'cancelled')}
                                  className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors border border-red-500/30"
                                    >
                                  إلغاء
                                    </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                                    <button
                                onClick={() => handleBookingStatusUpdate(booking.id, 'in_progress')}
                                className="px-3 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full hover:bg-purple-500/30 transition-colors border border-purple-500/30"
                              >
                                بدء التنفيذ
                                    </button>
                            )}
                            {booking.status === 'in_progress' && (
                                    <button
                                onClick={() => handleBookingStatusUpdate(booking.id, 'completed')}
                                className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/30 transition-colors border border-green-500/30"
                                    >
                                إكمال
                                    </button>
                            )}
                            
                                <button
                              onClick={() => handleBookingDelete(booking.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="حذف الحجز"
                            >
                              <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                                </div>
                    ))}
                              </div>
                            )}
                          </div>
            </>
                        )}
                </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSave={handleCategorySave}
      />

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

export default Dashboard;