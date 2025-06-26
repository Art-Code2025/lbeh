import { db } from '../firebase.config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

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
        
        // Check HTTP status after parsing
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

export const fetchProviders = async (): Promise<Provider[]> => {
    try {
        return await makeApiCall<Provider[]>('/providers');
    } catch (error) {
        console.warn('Providers API failed, using Firebase directly:', error);
        return await getFromFirebase<Provider>('providers');
    }
};

export const createProvider = async (providerData: Omit<Provider, 'id'>): Promise<{id: string}> => {
    try {
        return await makeApiCall('/providers', {
            method: 'POST',
            body: JSON.stringify(providerData),
        });
    } catch (error) {
        console.warn('Provider create API failed, using Firebase directly:', error);
        return await addToFirebase('providers', providerData);
    }
};

export const updateProvider = async (id: string, providerData: Partial<Provider>): Promise<{message: string}> => {
    try {
        return await makeApiCall(`/providers?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify({ id, ...providerData }),
        });
    } catch (error) {
        console.warn('Provider update API failed, using Firebase directly:', error);
        return await updateInFirebase('providers', id, providerData);
    }
};

export const deleteProvider = async (id: string): Promise<{message: string}> => {
    try {
        return await makeApiCall(`/providers?id=${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.warn('Provider delete API failed, using Firebase directly:', error);
        return await deleteFromFirebase('providers', id);
    }
}; 