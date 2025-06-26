import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  serviceDetails: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  // بيانات إضافية حسب الفئة
  deliveryLocation?: string;
  urgentDelivery?: boolean;
  startLocation?: string;
  destination?: string;
  destinationType?: string;
  appointmentTime?: string;
  returnTrip?: boolean;
  passengers?: number;
  issueDescription?: string;
  urgencyLevel?: string;
  preferredTime?: string;
}

interface UseRealTimeBookingsProps {
  enabled: boolean;
  soundEnabled: boolean;
  onNewBooking?: (booking: Booking) => void;
}

export const useRealTimeBookings = ({ 
  enabled, 
  soundEnabled, 
  onNewBooking 
}: UseRealTimeBookingsProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [lastCount, setLastCount] = useState(0);
  const [newBookingAlert, setNewBookingAlert] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.7;
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Fetch bookings function
  const fetchBookings = async () => {
    try {
      const response = await fetch('/.netlify/functions/bookings');
      if (response.ok) {
        const data = await response.json();
        
        // Check for new bookings
        if (lastCount > 0 && data.length > lastCount) {
          const newBookings = data.slice(0, data.length - lastCount);
          
          // Show notification for new bookings
          newBookings.forEach((booking: Booking) => {
            toast.success(
              `🔔 طلب جديد: ${booking.serviceName} من ${booking.fullName}`,
              {
                position: "top-right",
                autoClose: 8000,
                className: 'rtl',
                style: { direction: 'rtl' }
              }
            );
            
            if (onNewBooking) {
              onNewBooking(booking);
            }
          });

          // Play sound notification
          if (soundEnabled && audioRef.current) {
            audioRef.current.play().catch(console.error);
          }

          // Show visual alert
          setNewBookingAlert(true);
          setTimeout(() => setNewBookingAlert(false), 3000);
        }

        setBookings(data);
        setLastCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Set up real-time polling
  useEffect(() => {
    if (enabled) {
      // Initial fetch
      fetchBookings();
      
      // Set up polling every 5 seconds
      intervalRef.current = setInterval(fetchBookings, 5000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, soundEnabled, lastCount]);

  return {
    bookings,
    newBookingAlert,
    refetch: fetchBookings
  };
}; 