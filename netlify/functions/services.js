import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

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
const storage = getStorage(app);

// Helper function to upload image to Firebase Storage
async function uploadImageToStorage(base64Image, path) {
  if (!base64Image) return null;
  
  try {
    // Remove data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    // Create a reference to the storage location
    const imageRef = ref(storage, `services/${path}`);
    
    // Upload the image
    await uploadString(imageRef, base64Data, 'base64');
    
    // Get the download URL
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

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
        
        // Handle main image upload
        if (newService.mainImage && newService.mainImage.startsWith('data:image')) {
          const mainImageUrl = await uploadImageToStorage(
            newService.mainImage,
            `${Date.now()}-main.jpg`
          );
          if (mainImageUrl) {
            newService.mainImage = mainImageUrl;
          }
        }
        
        // Handle detailed images upload
        if (Array.isArray(newService.detailedImages)) {
          const uploadPromises = newService.detailedImages.map(async (image, index) => {
            if (image && image.startsWith('data:image')) {
              return await uploadImageToStorage(
                image,
                `${Date.now()}-detail-${index}.jpg`
              );
            }
            return image;
          });
          
          newService.detailedImages = await Promise.all(uploadPromises);
          newService.detailedImages = newService.detailedImages.filter(url => url);
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
        
        // Handle main image update
        if (updateData.mainImage && updateData.mainImage.startsWith('data:image')) {
          const mainImageUrl = await uploadImageToStorage(
            updateData.mainImage,
            `${Date.now()}-main.jpg`
          );
          if (mainImageUrl) {
            updateData.mainImage = mainImageUrl;
          }
        }
        
        // Handle detailed images update
        if (Array.isArray(updateData.detailedImages)) {
          const uploadPromises = updateData.detailedImages.map(async (image, index) => {
            if (image && image.startsWith('data:image')) {
              return await uploadImageToStorage(
                image,
                `${Date.now()}-detail-${index}.jpg`
              );
            }
            return image;
          });
          
          updateData.detailedImages = await Promise.all(uploadPromises);
          updateData.detailedImages = updateData.detailedImages.filter(url => url);
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