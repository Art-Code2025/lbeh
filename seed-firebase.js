import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import fs from 'fs/promises';

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

async function seedData() {
  try {
    console.log('🚀 بدء رفع البيانات إلى Firebase...');

    // قراءة البيانات من الملفات المحلية
    const servicesData = JSON.parse(await fs.readFile('data/services.json', 'utf8'));
    const categoriesData = JSON.parse(await fs.readFile('data/categories.json', 'utf8'));

    // رفع الفئات
    console.log('📂 رفع الفئات...');
    const categoriesRef = collection(db, 'categories');
    const existingCategories = await getDocs(categoriesRef);
    
    if (existingCategories.empty) {
      for (const category of categoriesData) {
        await addDoc(categoriesRef, category);
        console.log(`✅ تم رفع فئة: ${category.name}`);
      }
    } else {
      console.log('⚠️ الفئات موجودة بالفعل');
    }

    // رفع الخدمات
    console.log('🛠️ رفع الخدمات...');
    const servicesRef = collection(db, 'services');
    const existingServices = await getDocs(servicesRef);
    
    if (existingServices.empty) {
      for (const service of servicesData) {
        await addDoc(servicesRef, {
          ...service,
          createdAt: new Date().toISOString(),
          // تحويل الصور المحلية إلى placeholder URLs
          mainImage: service.mainImage?.startsWith('/') ? 
            `https://via.placeholder.com/600x400/1f2937/ffffff?text=${encodeURIComponent(service.name)}` : 
            service.mainImage,
          detailedImages: service.detailedImages?.map((img, index) => 
            img.startsWith('/') ? 
              `https://via.placeholder.com/400x300/374151/ffffff?text=${encodeURIComponent(service.name + ' ' + (index + 1))}` : 
              img
          ) || []
        });
        console.log(`✅ تم رفع خدمة: ${service.name}`);
      }
    } else {
      console.log('⚠️ الخدمات موجودة بالفعل');
    }

    console.log('🎉 تم رفع البيانات بنجاح!');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في رفع البيانات:', error);
    process.exit(1);
  }
}

seedData(); 