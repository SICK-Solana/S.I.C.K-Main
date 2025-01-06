import  { useEffect } from 'react';
import { useWallet } from "@solana/wallet-adapter-react";
import BackendApi from '../../constants/api';
import fetchUserData from '../../constants/fetchUserData';

const AutoSignUpProcess = () => {
  const { publicKey } = useWallet();

  useEffect(() => {
    const autoSignup = async () => {
      // First check if user already exists
      if (!publicKey) return;
      
      const existingUser = await fetchUserData(publicKey.toString());
      if (existingUser) {
        localStorage.setItem('creatorId', existingUser.id);
        return;
      }

      // If no existing user, proceed with automatic signup
      const walletAddress = publicKey.toBase58();
      
      try {
        // Generate deterministic values based on wallet address
        const truncatedAddress = walletAddress
        const userData = {
          name: truncatedAddress,
          email: truncatedAddress,
          username: truncatedAddress,
          profileImage: truncatedAddress,
          walletAddress: walletAddress
        };

        const response = await fetch(`${BackendApi}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('creatorId', data.id);
        }
      } catch (error) {
        console.error('Silent signup failed:', error);
      }
    };

    autoSignup();
  }, [publicKey]);

  // Component renders nothing visually
  return null;
};

export default AutoSignUpProcess;