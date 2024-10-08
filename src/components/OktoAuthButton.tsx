import React, { useState, useEffect } from "react";
import { OktoContextType, useOkto } from "okto-sdk-react";
import { useGoogleLogin } from "@react-oauth/google";


interface User {
  auth_token: string;
  // Add other user properties as needed
}

const OktoAuthButton = () => {
  
    const { authenticate, logOut, showWidgetModal } = useOkto() as OktoContextType;
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<User | null>(() => {
    
        try {
      const savedUser = localStorage.getItem('oktoUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      localStorage.removeItem('oktoUser');
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('oktoUser', JSON.stringify(user));
      } catch (error) {
        console.error('Error saving user to localStorage:', error);
      }
    } else {
      localStorage.removeItem('oktoUser');
    }
  }, [user]);

  const setUserAsync = async (userData: User) => {
    try {
      setUser(userData);
    } catch (error) {
      console.error('Error setting user:', error);
      throw new Error('Failed to set user data');
    }
  };

 
  const handleGoogleLogin = useGoogleLogin({
   
    onSuccess:  (response) => {
    
        try {
        
            console.log("response", response);
        setIsLoading(true);
         
        const id_token = import.meta.env.VITE_REACT_ID_TOKEN;

        if (!authenticate) {
          throw new Error('Authentication function not available');
        }

        authenticate( id_token, (result, error) => {
          if (error) {
            console.error("Authentication error:", error);
            throw new Error('Authentication failed');
          }

          if (result) {
            console.log("result.auth_token", result.auth_token);
            setUserAsync(result);
          }
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Login error:", error);
        setIsLoading(false);
        throw error;
      }
    },
    onError: (error) => {
      console.error("Google login failed:", error);
      setIsLoading(false);
      throw error;
    },
  });

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (!logOut) {
        throw new Error('Logout function not available');
      }
      await logOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
 
      <div className="inline-flex rounded-full overflow-hidden shadow-lg hover:shadow-xl transition duration-300 ease-in-out bg-gradient-to-r from-gray-800 to-gray-900">
        <button
          onClick={() => {
            if (showWidgetModal) {
              showWidgetModal();
            }
          }}
          className="py-3 px-6 text-white font-semibold transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 hover:bg-opacity-60 hover:bg-blue-600 bg-blue-900 bg-opacity-40"
        >
          Open Profile
        </button>
        <div className="w-px bg-gray-700"></div>
        <button
          onClick={handleLogout}
          className="py-3 px-6 text-white font-semibold transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 hover:bg-opacity-60 hover:bg-red-600 bg-red-900 bg-opacity-40"
        >
          Log Out
        </button>
      </div>
    
    );
  }

  return (
    <button
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleGoogleLogin(e as any)}
      disabled={isLoading}
      className={`
        inline-flex items-center justify-center
        px-6 py-3 rounded-full
        text-base font-medium
        transition-colors duration-200 ease-in-out
        bg-gradient-to-r from-blue-700 to-indigo-600 hover:to-indigo-700 hover:from-blue-600 hover:shadow-blue-500/30 shadow-xl 
        text-white
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        shadow-md hover:shadow-lg
      `}
    >
      <img src="/okto.png" alt="Okto Logo" className="w-6 h-6 mr-2" />
      {isLoading ? (
        <span className="">loading...</span> 
      ) : (
        'Sign In with Okto'
      )}
    </button>
  );
}

export default OktoAuthButton