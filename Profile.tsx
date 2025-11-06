import React, { useState, useRef } from 'react';
import { User, updateProfile } from 'firebase/auth';
import { auth, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';

interface ProfileProps {
  currentUser: User;
  setView: (view: 'chat') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
    </svg>
);

export const Profile: React.FC<ProfileProps> = ({ currentUser, setView, theme, toggleTheme }) => {
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };
  
  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    setMessage('');

    try {
        let photoURL = currentUser.photoURL;
        if (photo) {
            const storageRef = ref(storage, `avatars/${currentUser.uid}/${photo.name}`);
            const snapshot = await uploadBytes(storageRef, photo);
            photoURL = await getDownloadURL(snapshot.ref);
        }

        await updateProfile(auth.currentUser, {
            displayName: displayName,
            photoURL: photoURL,
        });
        
        setMessage('Profile updated successfully!');
        setPhoto(null);
    } catch (error) {
        console.error("Error updating profile:", error);
        setMessage('Failed to update profile.');
    } finally {
        setLoading(false);
        setTimeout(() => setMessage(''), 3000);
    }
  };
  
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-100 dark:bg-slate-800">
        <header className="flex items-center p-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm z-10 border-b border-gray-200 dark:border-gray-700">
            <button onClick={() => setView('chat')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
               <BackIcon />
            </button>
            <h1 className="text-lg font-bold ml-2">Profile</h1>
        </header>

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="flex flex-col items-center space-y-4">
                <div className="relative w-28 h-28">
                    <img 
                        src={photo ? URL.createObjectURL(photo) : currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || currentUser.email}&background=ec4899&color=fff&size=128`} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover shadow-lg"
                    />
                    <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-pink-600 ring-2 ring-white">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 3.75a2 2 0 100 4 2 2 0 000-4zM9.25 8.5a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zM2.5 10.5a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H3.25a.75.75 0 01-.75-.75zM2.5 14.25a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H3.25a.75.75 0 01-.75-.75z" /></svg>
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{currentUser.email}</p>
            </div>
            
            <div className="space-y-4">
                 <div>
                    <label htmlFor="displayName" className="text-sm font-medium text-gray-600 dark:text-gray-300">Display Name</label>
                    <input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-2 mt-1 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Your display name"
                    />
                 </div>
                 
                 <button 
                    onClick={handleUpdateProfile} 
                    disabled={loading}
                    className="w-full px-4 py-3 font-bold text-white bg-pink-500 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors duration-300 shadow-md hover:shadow-lg disabled:bg-pink-300"
                >
                    {loading ? 'Updating...' : 'Save Changes'}
                 </button>
                 {message && <p className="text-sm text-center text-green-600 dark:text-green-400">{message}</p>}
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Theme</h3>
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-800 dark:text-gray-200">Dark Mode</span>
                    <button onClick={toggleTheme} className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-gray-200 dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 dark:focus:ring-offset-gray-700">
                        <span className="sr-only">Enable dark mode</span>
                        <span className={`${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
                    </button>
                </div>
            </div>
        </main>
        
        <footer className="p-6">
             <button
                onClick={handleLogout}
                className="w-full px-4 py-3 font-bold text-pink-500 bg-transparent border border-pink-500 rounded-md hover:bg-pink-50 dark:hover:bg-pink-900/20 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors duration-300"
            >
                Logout
            </button>
        </footer>
    </div>
  );
};