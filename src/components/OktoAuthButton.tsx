import React, { useState, useEffect } from "react";
import { OktoContextType, useOkto } from "okto-sdk-react";
import { GoogleLogin } from '@react-oauth/google';

interface User {
  auth_token: string;
  // Add other user properties as needed
}

const OktoAuthButton = ({ className = '' }: { className?: string }) => {
  const { authenticate, logOut, showWidgetModal } = useOkto() as OktoContextType;
  //@ts-ignore
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

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      console.log("Google response", credentialResponse);
      setIsLoading(true);
      
      const id_token = credentialResponse.credential;

      if (!authenticate) {
        throw new Error('Authentication function not available');
      }

      authenticate(id_token, (result, error) => {
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
  };

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
      <div className={`flex flex-col sm:flex-row items-center justify-between rounded-md sm:rounded-full overflow-hidden shadow-lg hover:shadow-xl transition duration-300 ease-in-out bg-gradient-to-r from-gray-800 to-gray-900 ${className}`}>
        <button
          onClick={showWidgetModal}
          className="w-full sm:w-auto py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base lg:text-lg text-white font-semibold transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 hover:bg-blue-600 hover:bg-opacity-60 bg-blue-900 bg-opacity-40"
        >
          Open Profile
        </button>
        
        <div className="hidden sm:block h-px sm:w-px bg-gray-700 sm:h-auto"></div>
        
        <button
          onClick={handleLogout}
          className="mt-2 sm:mt-0 w-full sm:w-auto py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base lg:text-lg text-white font-semibold transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 hover:bg-red-600 hover:bg-opacity-60 bg-red-900 bg-opacity-40"
        >
          Log Out
        </button>
      </div>
    );
  }
  
  return (
    <button className="bg-blue-700 p-2 sm:p-3 rounded-full flex items-center justify-center w-full max-w-[200px] sm:max-w-none sm:w-auto transition-all duration-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50">
      <span className="hidden sm:inline-block mr-2 text-white text-xs sm:text-sm md:text-base whitespace-nowrap overflow-hidden text-ellipsis">
        Sign in with Okto
      </span>
      <span className="sm:hidden text-white text-xs">Sign in</span>
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => {
          console.log('Login Failed');
        }}
        useOneTap
        type="icon"
        theme="filled_blue"
        size="small"
        text="signin_with"
        shape="circle"
      />
    </button>
  );
};

export default OktoAuthButton;
