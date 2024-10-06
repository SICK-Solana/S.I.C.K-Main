import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import fetchUserData from "../constants/fetchUserData";
import { useNavigate } from "react-router-dom";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { publicKey, connected } = useWallet();
  const navigate = useNavigate();

  const checkLoginStatus = async () => {
    const storedWalletAddress = localStorage.getItem("walletAddress");
    if (storedWalletAddress || (connected && publicKey)) {
      if (connected && publicKey) {
        localStorage.setItem("walletAddress", publicKey.toString());
      }
      try {
        await fetchUserData();
      } catch (error) {
        console.error("Failed to fetch user data", error);
        navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, [connected, publicKey]);

  return <div>{children}</div>; // Render child components if conditions are met
};

export default ProtectedLayout;
