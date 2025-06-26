import { db } from '../firebase.config';
import { collection, getDocs } from 'firebase/firestore';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8888/.netlify/functions';

interface Provider {
    id: string;
    name: string;
    category: 'internal_delivery' | 'external_trips' | 'home_maintenance';
    phone: string;
    whatsapp: string;
    services: string[];
    rating: number;
    available: boolean;
    specialties: string[];
    destinations: string[];
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API call to ${endpoint} failed: ${response.status} ${errorText}`);
    }
    return response.json();
}

async function getDirectFromFirebase<T>(collectionName: string): Promise<T[]> {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
}

export const fetchProviders = async (): Promise<Provider[]> => {
    try {
        return await apiCall<Provider[]>('/providers');
    } catch (error) {
        console.warn('Netlify function for providers failed, falling back to Firebase direct.', error);
        return getDirectFromFirebase<Provider>('providers');
    }
}; 