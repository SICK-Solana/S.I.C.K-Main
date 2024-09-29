import React, { useState, useEffect } from 'react';
import BackendApi from '../../constants/api';
import fetchUserData from '../../constants/fetchUserData';

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
  const [profileImage, setProfileImage] = useState<string>('');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 max-w-full">
        <h1 className="text-xl font-bold mb-4 text-center">Sign Up to Create a Crate</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
            placeholder="Profile Image URL"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className={`w-full px-4 py-2 text-white rounded-md ${isProcessing ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} transition-colors`}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Sign Up'}
          </button>
        </form>
        {error && <div className="bg-red-100 text-red-700 px-4 py-2 mt-4 rounded-md">{error}</div>}
      </div>
    </div>
  );
};

export default SignUpPopup;