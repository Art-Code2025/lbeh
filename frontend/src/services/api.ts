import { db } from '../firebase.config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

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

// Enhanced API call function with better error handling
async function makeApiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    
    // Get response text first to check content
    const responseText = await response.text();
    
    // Check if response starts with HTML (common error indicator)
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      throw new Error('Server returned HTML instead of JSON (Netlify Functions may be unavailable)');
    }
    
    // Check if response is empty
    if (!responseText.trim()) {
      throw new Error('Empty response from server');
    }
    
    // Try to parse JSON
    let jsonData: T;
    try {
      jsonData = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
    }
    
    // Check HTTP status after parsing to provide better error messages
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return jsonData;
  } catch (error) {
    console.warn(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}

// Enhanced Firebase operations
async function getFromFirebase<T>(collectionName: string): Promise<T[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Firebase read failed for ${collectionName}:`, error);
    throw new Error(`Failed to read ${collectionName} from database`);
  }
}

async function addToFirebase<T>(collectionName: string, data: any): Promise<{ id: string }> {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id };
  } catch (error) {
    console.error(`Firebase add failed for ${collectionName}:`, error);
    throw new Error(`Failed to add ${collectionName} to database`);
  }
}

async function updateInFirebase(collectionName: string, id: string, data: any): Promise<{ message: string }> {
  try {
    await updateDoc(doc(db, collectionName, id), {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return { message: 'Updated successfully' };
  } catch (error) {
    console.error(`Firebase update failed for ${collectionName}:`, error);
    throw new Error(`Failed to update ${collectionName} in database`);
  }
}

async function deleteFromFirebase(collectionName: string, id: string): Promise<{ message: string }> {
  try {
    await deleteDoc(doc(db, collectionName, id));
    return { message: 'Deleted successfully' };
  } catch (error) {
    console.error(`Firebase delete failed for ${collectionName}:`, error);
    throw new Error(`Failed to delete ${collectionName} from database`);
  }
}

// Categories API
export const categoriesAPI = {
  // Get all categories
  getAll: async (): Promise<Category[]> => {
    try {
      return await makeApiCall('/categories');
    } catch (error) {
      console.warn('Categories API failed, using Firebase directly:', error);
      return await getFromFirebase<Category>('categories');
    }
  },
  
  // Create new category
  create: async (categoryData: Omit<Category, 'id' | 'createdAt'>): Promise<ApiResponse<{id: string}>> => {
    try {
      return await makeApiCall('/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      });
    } catch (error) {
      console.warn('Categories create API failed, using Firebase directly:', error);
      const result = await addToFirebase('categories', categoryData);
      return { data: result, message: 'Category created successfully' };
    }
  },
  
  // Update category
  update: async (id: string, categoryData: Partial<Category>): Promise<ApiResponse<{}>> => {
    try {
      return await makeApiCall(`/categories?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...categoryData }),
      });
    } catch (error) {
      console.warn('Categories update API failed, using Firebase directly:', error);
      const result = await updateInFirebase('categories', id, categoryData);
      return { message: result.message };
    }
  },
  
  // Delete category
  delete: async (id: string): Promise<ApiResponse<{}>> => {
    try {
      return await makeApiCall(`/categories?id=${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('Categories delete API failed, using Firebase directly:', error);
      const result = await deleteFromFirebase('categories', id);
      return { message: result.message };
    }
  },
};

// Services API
export const servicesAPI = {
  // Get all services or filter by category
  getAll: async (categoryId: string | null = null): Promise<Service[]> => {
    try {
      return await makeApiCall('/services');
    } catch (error) {
      console.warn('Services API failed, using Firebase directly:', error);
      const allServices = await getFromFirebase<Service>('services');
      return categoryId 
        ? allServices.filter(service => service.category === categoryId)
        : allServices;
    }
  },
  
  // Get service by ID
  getById: async (id: string): Promise<Service | null> => {
    try {
      return await makeApiCall<Service>(`/services?id=${id}`);
    } catch (error) {
      console.warn('Services API failed for getById, using Firebase directly:', error);
      const allServices = await getFromFirebase<Service>('services');
      return allServices.find(service => service.id.toString() === id) || null;
    }
  },
  
  // Create new service
  create: async (serviceData: Omit<Service, 'id'>): Promise<ApiResponse<{id: string}>> => {
    try {
      return await makeApiCall('/services', {
        method: 'POST',
        body: JSON.stringify(serviceData),
      });
    } catch (error) {
      console.warn('Services create API failed, using Firebase directly:', error);
      const result = await addToFirebase('services', serviceData);
      return { data: result, message: 'Service created successfully' };
    }
  },
  
  // Update service
  update: async (id: string, serviceData: Partial<Service>): Promise<ApiResponse<{}>> => {
    try {
      return await makeApiCall(`/services?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...serviceData }),
      });
    } catch (error) {
      console.warn('Services update API failed, using Firebase directly:', error);
      const result = await updateInFirebase('services', id, serviceData);
      return { message: result.message };
    }
  },
  
  // Delete service
  delete: async (id: string): Promise<ApiResponse<{}>> => {
    try {
      return await makeApiCall(`/services?id=${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('Services delete API failed, using Firebase directly:', error);
      const result = await deleteFromFirebase('services', id);
      return { message: result.message };
    }
  },
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
    const testCollection = collection(db, 'test');
    await getDocs(testCollection);
    console.log('✅ Firebase connection successful');
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