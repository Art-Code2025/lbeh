import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCU3gkAwZGeyww7XjcODeEjl-kS9AcOyio",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "lbeh-81936.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "lbeh-81936",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "lbeh-81936.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "225834423678",
  appId: process.env.FIREBASE_APP_ID || "1:225834423678:web:5955d5664e2a4793c40f2f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const servicesRef = collection(db, 'services');

    switch (event.httpMethod) {
      case 'GET':
        let servicesQuery = servicesRef;
        
        // Filter by category if specified
        if (event.queryStringParameters?.category) {
          servicesQuery = query(servicesRef, where('category', '==', event.queryStringParameters.category));
        }
        
        const snapshot = await getDocs(servicesQuery);
        const services = [];
        snapshot.forEach((doc) => {
          services.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(services)
        };

      case 'POST':
        const newService = JSON.parse(event.body);
        
        // Handle Cloudinary image upload
        if (newService.imageFile) {
          try {
            const cloudinaryUrl = await uploadToCloudinary(newService.imageFile);
            newService.mainImage = cloudinaryUrl;
            delete newService.imageFile;
          } catch (uploadError) {
            console.error('Cloudinary upload error:', uploadError);
            // Continue without image if upload fails
            delete newService.imageFile;
          }
        }
        
        const docRef = await addDoc(servicesRef, {
          ...newService,
          createdAt: new Date().toISOString()
        });
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            id: docRef.id, 
            message: 'Service created successfully' 
          })
        };

      case 'PUT':
        const { id, ...updateData } = JSON.parse(event.body);
        
        // Handle Cloudinary image upload for updates
        if (updateData.imageFile) {
          try {
            const cloudinaryUrl = await uploadToCloudinary(updateData.imageFile);
            updateData.mainImage = cloudinaryUrl;
            delete updateData.imageFile;
          } catch (uploadError) {
            console.error('Cloudinary upload error:', uploadError);
            // Continue without image update if upload fails
            delete updateData.imageFile;
          }
        }
        
        const serviceDoc = doc(db, 'services', id);
        await updateDoc(serviceDoc, {
          ...updateData,
          updatedAt: new Date().toISOString()
        });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Service updated successfully' })
        };

      case 'DELETE':
        const deleteId = event.queryStringParameters.id;
        const deleteServiceDoc = doc(db, 'services', deleteId);
        await deleteDoc(deleteServiceDoc);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Service deleted successfully' })
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};

// Cloudinary upload function
async function uploadToCloudinary(imageBase64) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "lbeh";
  const apiKey = process.env.CLOUDINARY_API_KEY || "357275813752554";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "50gxhCM1Yidpw21FPVm81SyjomM";
  
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = await generateSignature(timestamp, apiSecret);
  
  const formData = new FormData();
  formData.append('file', imageBase64);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', 'labeeh-services');
  
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${response.status}`);
  }
  
  const result = await response.json();
  return result.secure_url;
}

// Generate Cloudinary signature
async function generateSignature(timestamp, apiSecret) {
  // For Node.js environment in Netlify Functions
  const crypto = await import('crypto');
  const params = `folder=labeeh-services&timestamp=${timestamp}`;
  return crypto.createHash('sha1').update(params + apiSecret).digest('hex');
} 