import React, { useState, useEffect } from 'react';
import BackendApi from '../../constants/api';
import fetchUserData from '../../constants/fetchUserData';
import { FaBoxOpen } from "react-icons/fa";

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-xl font-bold mb-4 text-white">Loading Your Crate</h1>
      <div className="loader"></div>
    </div>
  );
};

const SignUpPopup: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  //@ts-ignore
  const [profileImage, setProfileImage] = useState<string>('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz1GMaWQT_r5ZX7kSoIHsRUM4ppivo5s7xnQ&s');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const creatorId = localStorage.getItem('creatorId');
    if (creatorId) {
      setIsLoggedIn(true);
    } else {
      const user = await fetchUserData();
      if (user) {
        localStorage.setItem('creatorId', user.id);
        setIsLoggedIn(true);
      }
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const walletAddress = localStorage.getItem('tipLink_pk_connected');
    if (!walletAddress) {
      setError('Wallet address not found. Please connect your wallet.');
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch(`${BackendApi}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, username, profileImage, walletAddress }),
      });

      if (!response.ok) throw new Error('Signup failed');

      const data = await response.json();
      localStorage.setItem('creatorId', data.id);
      setIsLoggedIn(true);
      setError('');
    } catch (error) {
      setError('Signup failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <Loader />
      </div>
    );
  }

  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-50">
      <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl shadow-2xl w-96 max-w-full border border-lime-500/30 animate-fadeIn">
        <h1 className="text-3xl font-semibold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-500">
          Sign Up to Create  <FaBoxOpen className="inline-block ml-2 text-2xl animate-bounce" />
        </h1>
        <form onSubmit={handleSignup} className="space-y-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full px-4 py-3 bg-black/50 border border-lime-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500/50 text-white placeholder-gray-400 transition-all duration-300"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 bg-black/50 border border-lime-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500/50 text-white placeholder-gray-400 transition-all duration-300"
          />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full px-4 py-3 bg-black/50 border border-lime-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500/50 text-white placeholder-gray-400 transition-all duration-300"
          />
          {/* <input
            type="text"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
            placeholder="Profile Image URL"
            className="w-full px-4 py-3 bg-black/50 border border-lime-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500/50 text-white placeholder-gray-400 transition-all duration-300"
          /> */}
          <button
            type="submit"
            className={`w-full px-6 py-4 text-black font-bold rounded-xl ${
              isProcessing 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 transform hover:scale-105 hover:shadow-lg'
            } transition-all duration-300`}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        {error && (
          <div className="bg-red-900/50 text-red-200 px-4 py-3 mt-6 rounded-xl border border-red-500/50 animate-pulse">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpPopup;