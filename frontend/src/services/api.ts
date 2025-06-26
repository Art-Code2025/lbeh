import { db } from '../firebase.config';
import { collection, getDocs } from 'firebase/firestore';

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8888/.netlify/functions';

// Types
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

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Generic API call function
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const finalOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, finalOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Direct Firebase calls (للتطوير المحلي)
async function getDirectFromFirebase<T>(collectionName: string): Promise<T[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data: T[] = [];
    querySnapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data()
      } as T);
    });
    return data;
  } catch (error) {
    console.error(`Firebase direct call failed for ${collectionName}:`, error);
    return [];
  }
}

// Categories API
export const categoriesAPI = {
  // Get all categories
  getAll: async (): Promise<Category[]> => {
    try {
      // محاولة استخدام Netlify Functions أولاً
      return await apiCall<Category[]>('/categories');
    } catch (error) {
      console.log('Netlify Functions not available, using direct Firebase...');
      // في حالة فشل Netlify Functions، استخدم Firebase مباشرة
      return await getDirectFromFirebase<Category>('categories');
    }
  },
  
  // Create new category
  create: (categoryData: Omit<Category, 'id' | 'createdAt'>): Promise<ApiResponse<{id: string}>> => 
    apiCall<ApiResponse<{id: string}>>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    }),
  
  // Update category
  update: (id: string, categoryData: Partial<Category>): Promise<ApiResponse<{}>> => 
    apiCall<ApiResponse<{}>>('/categories', {
      method: 'PUT',
      body: JSON.stringify({ id, ...categoryData }),
    }),
  
  // Delete category
  delete: (id: string): Promise<ApiResponse<{}>> => 
    apiCall<ApiResponse<{}>>(`/categories?id=${id}`, {
      method: 'DELETE',
    }),
};

// Services API
export const servicesAPI = {
  // Get all services or filter by category
  getAll: async (categoryId: string | null = null): Promise<Service[]> => {
    try {
      // محاولة استخدام Netlify Functions أولاً
      const endpoint = categoryId 
        ? `/services?category=${categoryId}` 
        : '/services';
      return await apiCall<Service[]>(endpoint);
    } catch (error) {
      console.log('Netlify Functions not available, using direct Firebase...');
      // في حالة فشل Netlify Functions، استخدم Firebase مباشرة
      const allServices = await getDirectFromFirebase<Service>('services');
      return categoryId 
        ? allServices.filter(service => service.category === categoryId)
        : allServices;
    }
  },
  
  // Get service by ID
  getById: (id: string): Promise<Service> => apiCall<Service>(`/services?id=${id}`),
  
  // Create new service
  create: (serviceData: Omit<Service, 'id'>): Promise<ApiResponse<{id: string}>> => 
    apiCall<ApiResponse<{id: string}>>('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    }),
  
  // Update service
  update: (id: string, serviceData: Partial<Service>): Promise<ApiResponse<{}>> => 
    apiCall<ApiResponse<{}>>('/services', {
      method: 'PUT',
      body: JSON.stringify({ id, ...serviceData }),
    }),
  
  // Delete service
  delete: (id: string): Promise<ApiResponse<{}>> => 
    apiCall<ApiResponse<{}>>(`/services?id=${id}`, {
      method: 'DELETE',
    }),
};

// Image upload to Cloudinary
export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Test Firebase connection
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    await getDocs(collection(db, 'categories'));
    console.log('✅ Firebase connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
};

export default {
  categories: categoriesAPI,
  services: servicesAPI,
  uploadImage,
  testFirebaseConnection,
}; 