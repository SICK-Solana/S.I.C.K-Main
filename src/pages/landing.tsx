import { Button } from "../components/ui/button";
import { BentoGrid } from "../components/ui/bentogrid";
import { WalletMultiButton } from "@tiplink/wallet-adapter-react-ui";
import { FaXTwitter } from "react-icons/fa6";


export default function Landing() {
  return (
    <>
    <img src="/topLeftgradient.png" className="absolute z-50 pointer-events-none" draggable="false" alt="" />
    <img src="/leftRadius.png" className="absolute z-50 pointer-events-none top-72" draggable="false" alt="" />
    <img src="/rightRadius.png" className="absolute z-50 pointer-events-none top-6 right-0" draggable="false" alt="" />
      <div
        className="min-h-screen justify-center items-center bg-gradient-to-b from-[#0A1019] to-[#02050A] text-white relative overflow-hidden"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <div className="absolute lg:-mt-[470px] inset-0 bg-[url('/images/bgplus.png')] bg-no-repeat bg-cover opacity-100 z-0"></div>

        

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 relative z-10">
          <header className="flex justify-between items-center mb-28">
            <div className="flex items-center text-3xl gap-2 font-bold">
            <img
              src="/sickLogo.png"
              alt="Description of the image"
              className="h-10"
            />
            SICK
            </div>
            
            <WalletMultiButton style={{background: "white", color: "black", borderRadius: "180px"}} />
          </header>

          <main className="text-center justify-center items-center">
            <h2 className="text-sm mb-4 py-[6px] px-[15px] mx-auto border font-light border-[#4949497a] w-fit rounded-full">
              Revolutionizing <span className="text-lime-400 font-medium">Web3</span>{" "}
              Investments
            </h2>
            <h1 className=" text-[84px] text-[#BFC1C3] font-semibold mb-2">
              <span className="text-lime-400">S</span>croll,
              <span className="text-lime-400"> I</span>nvest,
              <span className="text-lime-400"> C</span>reate,
              <span className="text-lime-400"> K</span>rypto
            </h1>
            <p className="mb-10 text-[#8D8D8D] font-thin">
              You can Create SIPs called <span className="text-white">"Crates"</span> and get acknowledged with a
              Social angle
            </p>
            <a href="/cratecreator" className="border px-1 py-4 border-[#797979ad]  rounded-full">

            <Button className="text-gray-900 px-[23px] font-semibold py-[20px] rounded-full text-[14px] bg-gradient-to-b from-[#A9F605] to-[#5e8d00] hover:shadow-[0_12px_24px_rgba(182,255,27,0.3)] transition-shadow duration-300">
              Get Started
            </Button>
            </a>
            <img src="/sickCursor.png" draggable="false" className="pointer-events-none mx-auto mt-6 " alt="" />
          </main>

          <div className="text-center mx-auto justify-center w-full mt-52 mb-16 text-xl text-gray-400 flex items-center gap-2">
            Follow us on: <FaXTwitter className="text-lime-500" />

          </div>
        </div>
      </div>

      {/* BentoGrid */}
      <div className="relative z-20">
        <BentoGrid />
      </div>
    </>
  );
}
