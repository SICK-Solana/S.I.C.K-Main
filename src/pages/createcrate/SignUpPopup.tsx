// @ts-nocheck
import { useEffect, useState } from 'react';
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  walletAddress: string;
  image?: string;
}

const AutoSignUpProcess = () => {
  const { publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleUserAuth = async () => {
      if (!publicKey) {
        console.log('No wallet connected');
        return;
      }

      setIsLoading(true);
      try {
        const walletAddress = publicKey.toBase58();
        
        // First try to login with wallet
        const loginResponse = await fetch('https://sickb.vercel.app/api/login-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress })
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok && loginData.success) {
          // User exists, set their ID and return
          localStorage.setItem('creatorId', loginData.user.id);
          toast.success('Welcome back!');
          return;
        }

        // If login failed, create new user
        const truncatedAddress = walletAddress.slice(0, 8);
        const userData = {
          name: `${truncatedAddress}`,
          email: `${truncatedAddress}`,
          username: `${truncatedAddress}`,
          profileImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz1GMaWQT_r5ZX7kSoIHsRUM4ppivo5s7xnQ&s',
          walletAddress: walletAddress
        };

        const signupResponse = await fetch('https://sickb.vercel.app/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });

        if (!signupResponse.ok) {
          const errorData = await signupResponse.json();
          throw new Error(errorData.message || 'Failed to create user');
        }

        const newUser = await signupResponse.json();
        localStorage.setItem('creatorId', newUser.id);
        toast.success('Account created successfully!');

      } catch (error) {
        console.error('Auth failed:', error);
        toast.error('Authentication failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (publicKey && !isLoading) {
      handleUserAuth();
    }
  }, [publicKey]);

  // Function to update user profile
  const updateUserProfile = async (userId: string, username: string, profileImage?: string) => {
    try {
      const response = await fetch(`https://sickb.vercel.app/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, profileImage })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      toast.success('Profile updated successfully!');
      return updatedUser;
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error('Failed to update profile. Please try again.');
      throw error;
    }
  };

  // Function to delete user account
  const deleteUserAccount = async (userId: string) => {
    try {
      const response = await fetch(`https://sickb.vercel.app/api/users/${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      localStorage.removeItem('creatorId');
      toast.success('Account deleted successfully');
    } catch (error) {
      console.error('Account deletion failed:', error);
      toast.error('Failed to delete account. Please try again.');
      throw error;
    }
  };

  // Function to fetch user details
  const fetchUserDetails = async (userId: string): Promise<User | null> => {
    try {
      const response = await fetch(`https://sickb.vercel.app/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const user = await response.json();
      return user;
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      toast.error('Failed to load user details');
      return null;
    }
  };

  // Loading state
  if (isLoading) {
    return null; // Or return a loading spinner component
  }

  return null;
};

export default AutoSignUpProcess;