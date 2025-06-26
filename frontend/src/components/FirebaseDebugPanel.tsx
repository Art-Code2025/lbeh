import React, { useState } from 'react';
import { Database, RefreshCw, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { seedOnlyMissingData, clearAllCollections, seedFirebaseData } from '../utils/seedFirebase';
import { testFirebaseConnection } from '../services/api';

interface FirebaseDebugPanelProps {
  onDataChange?: () => void;
}

const FirebaseDebugPanel: React.FC<FirebaseDebugPanelProps> = ({ onDataChange }) => {
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      console.log('🔥 Testing Firebase connection...');
      toast.info('🔄 جاري اختبار الاتصال...');
      
      const isConnected = await testFirebaseConnection();
      
      if (isConnected) {
        setConnectionStatus('connected');
        toast.success('✅ تم الاتصال بـ Firebase بنجاح!');
      } else {
        setConnectionStatus('failed');
        toast.error('❌ فشل الاتصال بـ Firebase');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionStatus('failed');
      toast.error('❌ خطأ في اختبار الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedMissingData = async () => {
    try {
      setLoading(true);
      toast.info('🔄 جاري فحص وإضافة البيانات الأساسية...');
      
      const result = await seedOnlyMissingData();
      toast.success('✅ تم فحص البيانات الأساسية بنجاح!');
      
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error('Error seeding missing data:', error);
      toast.error('❌ فشل في إضافة البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAndSeedData = async () => {
    if (!window.confirm('⚠️ هذا سيحذف جميع البيانات الحالية ويضيف البيانات الأساسية فقط. هل أنت متأكد؟')) {
      return;
    }
    
    try {
      setLoading(true);
      toast.info('🗑️ جاري حذف البيانات الحالية...');
      
      await clearAllCollections();
      toast.info('🌱 جاري إضافة البيانات الأساسية...');
      
      const result = await seedFirebaseData();
      toast.success(`🎉 تم إنشاء البيانات الأساسية بنجاح! الفئات: ${result.categories}, الخدمات: ${result.services}, المقدمين: ${result.providers}`);
      
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error('Error clearing and seeding data:', error);
      toast.error('❌ فشل في إنشاء البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-6 h-6 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">إدارة قاعدة البيانات</h3>
        {connectionStatus === 'connected' && (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            متصل
          </div>
        )}
        {connectionStatus === 'failed' && (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
            <AlertCircle className="w-3 h-3" />
            غير متصل
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={handleTestConnection}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-3 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/30 disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" />
          اختبار الاتصال
        </button>

        <button
          onClick={handleSeedMissingData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-3 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/30 disabled:opacity-50"
        >
          <Database className="w-4 h-4" />
          إضافة البيانات الأساسية
        </button>

        <button
          onClick={handleClearAndSeedData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-3 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors border border-orange-500/30 disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          إعادة تهيئة البيانات
        </button>

        <button
          onClick={() => window.location.reload()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-3 bg-gray-600/20 text-gray-400 rounded-lg hover:bg-gray-600/30 transition-colors border border-gray-600/30 disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          إعادة تحميل الصفحة
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-400">
        <p>ملاحظة: الحجوزات سيتم إضافتها من قبل العملاء الحقيقيين فقط</p>
      </div>

      {loading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
          <RefreshCw className="w-4 h-4 animate-spin" />
          جاري المعالجة...
        </div>
      )}
    </div>
  );
};

export default FirebaseDebugPanel; 