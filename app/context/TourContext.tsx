import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';
import { usePathname } from 'expo-router';

interface Tour {
  title: string;
  
}

interface TourContextType {
  tour: Tour;
  setTour: (tour: Tour) => void;
  clearTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const [tour, setTour] = useState<Tour>({ title: '' });
  const pathname = usePathname();

  // Clear tour state when navigating away from new_tour page, except when going to preview
  useEffect(() => {
    if (pathname !== '/new_tour' && pathname !== '/new_tour_preview') {
      clearTour();
    }
  }, [pathname]);

  // Only use localStorage on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const savedTour = localStorage.getItem('tour');
      if (savedTour && (pathname === '/new_tour' || pathname === '/new_tour_preview')) {
        setTour(JSON.parse(savedTour));
      } else {
        clearTour();
      }
    }
  }, [pathname]);

  // Save to localStorage when tour changes (web only)
  useEffect(() => {
    if (Platform.OS === 'web' && (pathname === '/new_tour' || pathname === '/new_tour_preview')) {
      localStorage.setItem('tour', JSON.stringify(tour));
    }
  }, [tour, pathname]);

  const clearTour = () => {
    setTour({ title: '' });
    if (Platform.OS === 'web') {
      localStorage.removeItem('tour');
    }
  };

  return (
    <TourContext.Provider value={{ tour, setTour, clearTour }}>
      {children}
    </TourContext.Provider>
  );
}

export default TourProvider;

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
} 