import { BentoGrid } from "../components/ui/bentogrid";
import { WalletMultiButton } from "@tiplink/wallet-adapter-react-ui";
import { FaXTwitter } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { useState , useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import  fetchUserData from '../constants/fetchUserData.ts';
import { Button } from "../components/ui/button.tsx";
import OktoAuthButton from "../components/OktoAuthButton.tsx";


export default function Landing() {

  const { publicKey, connected } = useWallet();

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const getRandomPosition = () => {
    const randomX = Math.floor(Math.random() * 300)-150; // Random value between -100 and 100
    const randomY = Math.floor(Math.random() * 300)-150; // Random value between -100 and 100
    setPosition({ x: randomX, y: randomY });
  };

  useEffect(() => {
    checkLoginStatus();
  }, [connected, publicKey]);

  const checkLoginStatus = async () => {
    const storedWalletAddress = localStorage.getItem("walletAddress");
    
    if (storedWalletAddress) {
      
        
      await fetchUserData(publicKey?.toString());
      
      // Wallet address is already stored, proceed to explore crate
      // window.location.href = "/explorecrate";
    }

    if (connected && publicKey) {
      // Store the wallet address in localStorage
      localStorage.setItem("walletAddress", publicKey.toString());
   
    }
    const storedWalletAddress2 = localStorage.getItem("walletAddress");

    if(storedWalletAddress2){
 
     
        
        await fetchUserData(publicKey?.toString());
        
// window.location.href = "/explorecrate";
  };
}

 
  return (
    <>
      <img
        src="/topLeftgradient.png"
        className="absolute z-50 pointer-events-none select-none"
        draggable="false"
        alt=""
      />
      <img
        src="/leftRadius.png"
        className="absolute z-50 pointer-events-none top-72 select-none max-sm:hidden"
        draggable="false"
        alt=""
      />
      <img
        src="/rightRadius.png"
        className="absolute z-50 pointer-events-none top-6 right-0 select-none max-sm:hidden"
        draggable="false"
        alt=""
      />
      <div
        className="min-h-[120vh] max-sm:min-h-screen justify-center items-center bg-gradient-to-b from-[#0A1019] to-[#02050A] text-white relative overflow-hidden"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <div className="absolute lg:-mt-[470px] inset-0 bg-[url('/images/bgplus.png')] max-sm:hidden bg-no-repeat select-none bg-cover opacity-100 z-0"></div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 relative z-10">
    <header className="flex flex-wrap justify-between items-center mb-28">
      <div className="flex items-center text-3xl gap-2 font-bold mb-4 sm:mb-0">
        <img
          src="/sickLogo.png"
          alt="Description of the image"
          className="h-10"
        />
        SICK
      </div>
         
      <div className="flex flex-wrap items-center gap-4 ml-auto">
      <div className="hidden sm:block w-auto mb-4 sm:mb-0">
  <OktoAuthButton className="" />
</div>
        <WalletMultiButton
          style={{
            background: "white",
            color: "black",
            borderRadius: "180px",
            width: "100%",
          }}
          className="w-full sm:w-auto"
        />
      </div>
    </header>

          <main className="text-center justify-center items-center">
            <h2 className="text-sm mb-4 py-[6px] px-[15px] mx-auto border font-light border-[#4949497a] w-fit rounded-full">
              Revolutionizing{" "}
              <span className="text-lime-400 font-medium">Web3</span>{" "}
              Investments
            </h2>
            <h1 className=" text-[84px] text-[#BFC1C3] font-semibold mb-2 max-sm:mb-4 max-md:text-6xl max-sm:text-5xl">
              <span className="text-lime-400">S</span>croll,
              <span className="text-lime-400"> I</span>nvest,
              <span className="text-lime-400"> C</span>reate,
              <span className="text-lime-400"> K</span>rypto
            </h1>
            <p className="mb-10 text-[#8D8D8D] font-normal max-sm:text-sm ">
              You can Create SIPs called{" "}
              <span className="text-white">"Crates"</span> and get acknowledged
              with a Social angle
            </p>
           
              {/* <Button className="text-gray-900 px-[23px] font-semibold py-[20px] rounded-full text-[14px] bg-gradient-to-b from-[#A9F605] to-[#5e8d00] hover:shadow-[0_12px_24px_rgba(182,255,27,0.3)] transition-shadow duration-300"> */}
           {connected? <div>             <a href="/explorecrate"> <Button className="text-gray-900 px-[23px] font-semibold py-[20px] rounded-full text-[14px] bg-gradient-to-b from-[#A9F605] to-[#5e8d00] hover:shadow-[0_12px_24px_rgba(182,255,27,0.3)] transition-shadow duration-300">
         Get Started
            </Button>
            </a>
           </div>  : <WalletMultiButton
              style={{
                background: "#A9F605",
                color: "black",
                borderRadius: "180px",
              }}
            /> }
   
         
            <AnimatePresence>
              <motion.img
                src="/sickCursor.png"
                draggable="false"
                className="select-none mx-auto mt-6 "
                alt=""
                initial={{ opacity: 0.8, scale: 0.9, rotate: 0, x: 0, y: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  rotate: [0, 10, -10, 0],
                  x: position.x,
                  y: position.y,
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: 0,
                  repeatType: "reverse",
                  scale: {
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                  },
                }}
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                  transition: { type: "spring", stiffness: 300, damping: 15 },
                }}
                whileTap={{
                  scale: 0.95,
                  rotate: -5,
                  
                  
                  transition: { type: "spring", stiffness: 300, damping: 15, },
                }}
                onTap={getRandomPosition}
                
                
              />
            </AnimatePresence>
          </main>
<a href="https://x.com/sickonsolana" target="_blank">
          <div className="text-center mx-auto justify-center w-full mt-52 mb-16 text-xl text-gray-400 flex items-center gap-2">
            Follow us on: <FaXTwitter className="text-lime-500" />
          </div>
          </a>
        </div>
        
      </div>
      <div className="relative z-20">
        <BentoGrid />
      </div>

      {/* BentoGrid */}
      
    </>
  );
}