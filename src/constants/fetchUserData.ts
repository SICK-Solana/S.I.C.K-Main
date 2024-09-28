import BackendApi from './api.ts';
const fetchUserData = async () => {
    const walletAddress = localStorage.getItem('tipLink_pk_connected');
  
    if (walletAddress) {
      try {
        const response = await fetch(`${BackendApi}/login-wallet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress }),
        });
  
        if (response.ok) {
          const data = await response.json();
          // Store the entire user data in localStorage
          localStorage.setItem('user', JSON.stringify(data.user));
          return data.user; // Return user data for further use if needed
        } else {
          console.error('Failed to log in with wallet:', response.statusText);
        }
      } catch (error) {
        console.error('Error logging in with wallet:', error);
      }
    }
  };
  

  export default fetchUserData;  // export the function