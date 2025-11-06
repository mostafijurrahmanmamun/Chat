import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  AuthError
} from 'firebase/auth';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuthError = (err: AuthError) => {
    switch (err.code) {
      case 'auth/invalid-email':
        setError('Please enter a valid email address.');
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        setError('Invalid email or password.');
        break;
      case 'auth/email-already-in-use':
        setError('This email address is already in use.');
        break;
      case 'auth/weak-password':
        setError('Password should be at least 6 characters.');
        break;
      default:
        setError('An unexpected error occurred. Please try again.');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      if (isLogin) {
        await setPersistence(auth, browserLocalPersistence);
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
       handleAuthError(err as AuthError);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 sm:p-8">
        <div className="w-full max-w-sm p-8 space-y-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
            <div className="text-center">
                <h2 className="text-4xl font-bold text-pink-500 tracking-wider">RownaK</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">{isLogin ? 'Login to continue' : 'Create an account'}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 mt-2 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="you@example.com"
                    autoComplete="email"
                />
                </div>
                <div>
                <label htmlFor="password"  className="text-sm font-medium text-gray-600 dark:text-gray-300">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 mt-2 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="••••••••"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                />
                </div>

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                
                <button type="submit" className="w-full px-4 py-3 font-bold text-white bg-pink-500 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors duration-300 shadow-md hover:shadow-lg">
                {isLogin ? 'Login' : 'Create Account'}
                </button>
            </form>
            <div className="text-center">
                <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-pink-500 hover:underline">
                {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
                </button>
            </div>
        </div>
    </div>
  );
};