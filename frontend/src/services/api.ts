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
      throw new Error('Netlify Functions unavailable');
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
      throw new Error('Invalid JSON response');
    }
    
    // Check HTTP status after parsing to provide better error messages
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return jsonData;
  } catch (error) {
    // Only log detailed errors in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`API fallback to Firebase for ${endpoint}:`, error);
    }
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
  async getAll(): Promise<Category[]> {
    try {
      return await makeApiCall('/categories');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('Using Firebase for categories');
      }
      return await getFromFirebase<Category>('categories');
    }
  },
  
  // Create new category
  async create(categoryData: Omit<Category, 'id' | 'createdAt'>): Promise<ApiResponse<{id: string}>> {
    try {
      return await makeApiCall('/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      });
    } catch (error) {
      const result = await addToFirebase('categories', categoryData);
      return { data: result, message: 'Category created successfully' };
    }
  },
  
  // Update category
  async update(id: string, categoryData: Partial<Category>): Promise<ApiResponse<{}>> {
    try {
      return await makeApiCall(`/categories?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...categoryData }),
      });
    } catch (error) {
      const result = await updateInFirebase('categories', id, categoryData);
      return { message: result.message };
    }
  },
  
  // Delete category
  async delete(id: string): Promise<ApiResponse<{}>> {
    try {
      return await makeApiCall(`/categories?id=${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      const result = await deleteFromFirebase('categories', id);
      return { message: result.message };
    }
  },
};

// Services API
export const servicesAPI = {
  // Get all services or filter by category
  async getAll(categoryId: string | null = null): Promise<Service[]> {
    try {
      return await makeApiCall('/services');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('Using Firebase for services');
      }
      const allServices = await getFromFirebase<Service>('services');
      return categoryId 
        ? allServices.filter(service => service.category === categoryId)
        : allServices;
    }
  },
  
  // Get service by ID
  async getById(id: string): Promise<Service | null> {
    try {
      return await makeApiCall<Service>(`/services?id=${id}`);
    } catch (error) {
      const allServices = await getFromFirebase<Service>('services');
      return allServices.find(service => service.id.toString() === id) || null;
    }
  },
  
  // Create new service
  async create(serviceData: Omit<Service, 'id'>): Promise<ApiResponse<{id: string}>> {
    try {
      return await makeApiCall('/services', {
        method: 'POST',
        body: JSON.stringify(serviceData),
      });
    } catch (error) {
      const result = await addToFirebase('services', serviceData);
      return { data: result, message: 'Service created successfully' };
    }
  },
  
  // Update service
  async update(id: string, serviceData: Partial<Service>): Promise<ApiResponse<{}>> {
    try {
      return await makeApiCall(`/services?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...serviceData }),
      });
    } catch (error) {
      const result = await updateInFirebase('services', id, serviceData);
      return { message: result.message };
    }
  },
  
  // Delete service
  async delete(id: string): Promise<ApiResponse<{}>> {
    try {
      return await makeApiCall(`/services?id=${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
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