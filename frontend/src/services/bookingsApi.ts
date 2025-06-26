import { db } from '../firebase.config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8888/.netlify/functions';

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  serviceDetails?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  
  // Optional fields based on service type
  deliveryLocation?: string;
  urgentDelivery?: boolean;
  startLocation?: string;
  destination?: string;
  appointmentTime?: string;
  returnTrip?: boolean;
  passengers?: number;
  issueDescription?: string;
  urgencyLevel?: 'low' | 'medium' | 'high';
  preferredTime?: string;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  byCategory: Record<string, number>;
  byService: Record<string, number>;
  categoryStats: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  dailyStats: Array<{
    date: string;
    count: number;
  }>;
}

// Enhanced API call function
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
    
    // Check HTTP status after parsing
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return jsonData;
  } catch (error) {
    // Only log detailed errors in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`API fallback to Firebase for ${endpoint}`);
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

// Calculate stats from bookings data
function calculateStats(bookings: Booking[]): BookingStats {
  const stats: BookingStats = {
    total: bookings.length,
    pending: 0,
    confirmed: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    byCategory: {},
    byService: {},
    categoryStats: [],
    dailyStats: []
  };

  // Count by status
  bookings.forEach(booking => {
    switch (booking.status) {
      case 'pending': stats.pending++; break;
      case 'confirmed': stats.confirmed++; break;
      case 'in_progress': stats.inProgress++; break;
      case 'completed': stats.completed++; break;
      case 'cancelled': stats.cancelled++; break;
    }

    // Count by category
    if (stats.byCategory[booking.serviceCategory]) {
      stats.byCategory[booking.serviceCategory]++;
    } else {
      stats.byCategory[booking.serviceCategory] = 1;
    }

    // Count by service
    if (stats.byService[booking.serviceName]) {
      stats.byService[booking.serviceName]++;
    } else {
      stats.byService[booking.serviceName] = 1;
    }
  });

  // Create category stats array
  stats.categoryStats = Object.entries(stats.byCategory).map(([category, count]) => ({
    category,
    count,
    percentage: Math.round((count / stats.total) * 100)
  }));

  // Calculate daily stats for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  stats.dailyStats = last7Days.map(date => ({
    date,
    count: bookings.filter(booking => 
      booking.createdAt.split('T')[0] === date
    ).length
  }));

  return stats;
}

// Bookings API
export const bookingsAPI = {
  async getAll(): Promise<Booking[]> {
    try {
      return await makeApiCall<Booking[]>('/bookings');
    } catch (error) {
      return await getFromFirebase<Booking>('bookings');
    }
  },

  async getById(id: string): Promise<Booking | null> {
    try {
      return await makeApiCall<Booking>(`/bookings?id=${id}`);
    } catch (error) {
      const allBookings = await getFromFirebase<Booking>('bookings');
      return allBookings.find(booking => booking.id === id) || null;
    }
  },

  async create(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: string }> {
    try {
      return await makeApiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          ...bookingData,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }),
      });
    } catch (error) {
      return await addToFirebase('bookings', {
        ...bookingData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  },

  async updateStatus(id: string, status: Booking['status']): Promise<{ message: string }> {
    try {
      return await makeApiCall(`/bookings?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, status }),
      });
    } catch (error) {
      return await updateInFirebase('bookings', id, { status });
    }
  },

  async update(id: string, bookingData: Partial<Booking>): Promise<{ message: string }> {
    try {
      return await makeApiCall(`/bookings?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...bookingData }),
      });
    } catch (error) {
      return await updateInFirebase('bookings', id, bookingData);
    }
  },

  async delete(id: string): Promise<{ message: string }> {
    try {
      return await makeApiCall(`/bookings?id=${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return await deleteFromFirebase('bookings', id);
    }
  },

  async getStats(): Promise<BookingStats> {
    try {
      return await makeApiCall<BookingStats>('/bookings/stats');
    } catch (error) {
      const bookings = await getFromFirebase<Booking>('bookings');
      return calculateStats(bookings);
    }
  },

  async getByStatus(status: Booking['status']): Promise<Booking[]> {
    try {
      return await makeApiCall<Booking[]>(`/bookings?status=${status}`);
    } catch (error) {
      const allBookings = await getFromFirebase<Booking>('bookings');
      return allBookings.filter(booking => booking.status === status);
    }
  }
}; 