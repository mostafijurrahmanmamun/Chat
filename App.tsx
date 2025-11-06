import React, { useState, useEffect } from 'react';
import { Auth as FirebaseAuthComponent } from './components/Auth';
import { Chat } from './components/Chat';
import { Profile } from './components/Profile';
import { auth, messaging, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getToken } from 'firebase/messaging';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';

type View = 'auth' | 'chat' | 'profile';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('auth');
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setView('chat');
      } else {
        setView('auth');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Set up Firebase presence
    const userStatusDatabaseRef = ref(db, '/status/' + currentUser.uid);

    const isOfflineForDatabase = {
        state: 'offline',
        last_changed: serverTimestamp(),
    };

    const isOnlineForDatabase = {
        state: 'online',
        last_changed: serverTimestamp(),
    };

    const connectedRef = ref(db, '.info/connected');
    const unsubscribeConnected = onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === false) {
            return;
        }

        onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
            set(userStatusDatabaseRef, isOnlineForDatabase);
        });
    });

    return () => {
        unsubscribeConnected();
        // Set offline on unmount/logout
        set(userStatusDatabaseRef, isOfflineForDatabase);
    };
  }, [currentUser]);


  useEffect(() => {
    if (!currentUser) return;

    const setupNotifications = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // VAPID key should be stored securely, e.g., in environment variables
          const vapidKey = "YOUR_VAPID_KEY_HERE"; 
          if (vapidKey === "YOUR_VAPID_KEY_HERE") {
             console.warn("Please replace 'YOUR_VAPID_KEY_HERE' with your actual VAPID key from the Firebase console.");
             return;
          }
          const currentToken = await getToken(messaging, { vapidKey });
          if (currentToken) {
            console.log('FCM Token:', currentToken);
            // Here you would typically send the token to your backend
          }
        }
      } catch (error) {
        console.error('An error occurred while setting up notifications.', error);
      }
    };
    
    setupNotifications();
  }, [currentUser]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="dark:text-gray-300">Loading...</p>
        </div>
      );
    }
    
    switch (view) {
      case 'chat':
        return currentUser && <Chat currentUser={currentUser} setView={setView} />;
      case 'profile':
        return currentUser && <Profile currentUser={currentUser} setView={setView} theme={theme} toggleTheme={toggleTheme} />;
      case 'auth':
      default:
        return <FirebaseAuthComponent />;
    }
  };

  return (
    <div className="bg-gray-200 dark:bg-gray-900 min-h-screen flex justify-center items-center font-sans p-0 sm:p-4">
       <div className="w-full max-w-md h-screen sm:h-[95vh] bg-gray-100 dark:bg-slate-800 flex flex-col shadow-2xl rounded-none sm:rounded-2xl overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;