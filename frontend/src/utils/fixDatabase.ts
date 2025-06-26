import { db } from '../firebase.config';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';

// Categories with proper structure for the application
const properCategories = [
  {
    id: 'internal_delivery',
    name: 'التوصيل والمشاوير الداخلية',
    description: 'خدمات التوصيل والمشاوير داخل المدينة',
    icon: '🚚',
    color: 'blue',
  },
  {
    id: 'external_trips', 
    name: 'المشاوير الخارجية',
    description: 'الرحلات والمشاوير بين المدن',
    icon: '🗺️',
    color: 'green',
  },
  {
    id: 'home_maintenance',
    name: 'الصيانة المنزلية', 
    description: 'خدمات الصيانة والإصلاح المنزلي',
    icon: '🔧',
    color: 'orange',
  }
];

const properServices = [
  {
    name: 'توصيل طلبات',
    category: 'internal_delivery',
    categoryName: 'التوصيل والمشاوير الداخلية',
    homeShortDescription: 'خدمة توصيل الطلبات والمشتريات',
    price: 'حسب المسافة',
    duration: 'حسب الموقع',
  },
  {
    name: 'رحلات بين المدن',
    category: 'external_trips',
    categoryName: 'المشاوير الخارجية', 
    homeShortDescription: 'رحلات آمنة ومريحة بين المدن',
    price: 'حسب المسافة',
    duration: 'حسب الوجهة',
  },
  {
    name: 'صيانة عامة',
    category: 'home_maintenance',
    categoryName: 'الصيانة المنزلية',
    homeShortDescription: 'خدمات الصيانة المنزلية المتنوعة', 
    price: 'حسب نوع الخدمة',
    duration: 'حسب العمل المطلوب',
  }
];

export const fixCategoriesStructure = async () => {
  console.log('🔧 Fixing categories structure...');
  
  try {
    // Clear existing categories
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    for (const docSnapshot of categoriesSnapshot.docs) {
      await deleteDoc(doc(db, 'categories', docSnapshot.id));
    }
    console.log('🗑️ Cleared existing categories');

    // Add categories with proper custom IDs
    for (const category of properCategories) {
      const { id, ...categoryData } = category;
      await setDoc(doc(db, 'categories', id), {
        ...categoryData,
        createdAt: new Date().toISOString()
      });
    }
    console.log(`✅ Added ${properCategories.length} categories with proper IDs`);

    // Clear existing services
    const servicesSnapshot = await getDocs(collection(db, 'services'));
    for (const docSnapshot of servicesSnapshot.docs) {
      await deleteDoc(doc(db, 'services', docSnapshot.id));
    }
    console.log('🗑️ Cleared existing services');

    // Add services
    for (const service of properServices) {
      await addDoc(collection(db, 'services'), {
        ...service,
        createdAt: new Date().toISOString()
      });
    }
    console.log(`✅ Added ${properServices.length} services`);

    console.log('🎉 Database structure fixed successfully!');
    
    return {
      categories: properCategories.length,
      services: properServices.length
    };
  } catch (error) {
    console.error('❌ Error fixing database structure:', error);
    throw error;
  }
};

export const checkDatabaseStructure = async () => {
  console.log('🔍 Checking database structure...');
  
  try {
    const [categoriesSnapshot, servicesSnapshot] = await Promise.all([
      getDocs(collection(db, 'categories')),
      getDocs(collection(db, 'services'))
    ]);

    console.log('📊 Current categories:');
    categoriesSnapshot.forEach(doc => {
      console.log(`  - ID: ${doc.id}, Name: ${doc.data().name}`);
    });

    console.log('📊 Current services:');
    servicesSnapshot.forEach(doc => {
      console.log(`  - ID: ${doc.id}, Name: ${doc.data().name}`);
    });

    return {
      categories: categoriesSnapshot.size,
      services: servicesSnapshot.size
    };
  } catch (error) {
    console.error('❌ Error checking database structure:', error);
    throw error;
  }
}; 