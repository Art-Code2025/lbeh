import { db } from '../firebase.config';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';

// Types
export interface Service {
  id: string;
  name: string;
  category: string;
  categoryName: string;
  homeShortDescription: string;
  detailsShortDescription?: string;
  description?: string;
  mainImage?: string;
  features?: string[];
  duration?: string;
  availability?: string;
  price?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  serviceCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Services API
export const servicesApi = {
  // Get all services
  async getAll(): Promise<Service[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'services'));
      const services: Service[] = [];
      querySnapshot.forEach((doc) => {
        services.push({ id: doc.id, ...doc.data() } as Service);
      });
      return services;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw new Error('فشل في جلب الخدمات');
    }
  },

  // Get service by ID
  async getById(id: string): Promise<Service | null> {
    try {
      const services = await this.getAll();
      return services.find(service => service.id === id) || null;
    } catch (error) {
      console.error('Error fetching service by ID:', error);
      throw new Error('فشل في جلب الخدمة');
    }
  },

  // Create new service
  async create(serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'services'), {
        ...serviceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating service:', error);
      throw new Error('فشل في إنشاء الخدمة');
    }
  },

  // Update service
  async update(id: string, serviceData: Partial<Service>): Promise<void> {
    try {
      await updateDoc(doc(db, 'services', id), {
        ...serviceData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating service:', error);
      throw new Error('فشل في تحديث الخدمة');
    }
  },

  // Delete service
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (error) {
      console.error('Error deleting service:', error);
      throw new Error('فشل في حذف الخدمة');
    }
  }
};

// Categories API
export const categoriesApi = {
  // Get all categories
  async getAll(): Promise<Category[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categories: Category[] = [];
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() } as Category);
      });
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('فشل في جلب الفئات');
    }
  },

  // Create new category
  async create(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        ...categoryData,
        serviceCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('فشل في إنشاء الفئة');
    }
  },

  // Update category
  async update(id: string, categoryData: Partial<Category>): Promise<void> {
    try {
      await updateDoc(doc(db, 'categories', id), {
        ...categoryData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('فشل في تحديث الفئة');
    }
  },

  // Delete category
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('فشل في حذف الفئة');
    }
  }
}; 