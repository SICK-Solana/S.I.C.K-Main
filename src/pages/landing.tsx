import { Button } from "../components/ui/button";
import { BentoGrid } from "../components/ui/bentogrid";
import { WalletMultiButton } from "@tiplink/wallet-adapter-react-ui";

export default function Landing() {
  return (
    <>
      <div
        className="min-h-screen justify-center items-center bg-black text-white relative overflow-hidden"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <div className="absolute lg:-mt-72 inset-0 bg-[url('/images/bgplus.png')] bg-no-repeat bg-cover opacity-100 z-0"></div>

        <div className="absolute opacity-50 top-0 left-0 w-1/6 h-5/6 border-b-4 border-r-4 border-[#185519] hidden lg:block rounded-br-full z-10"></div>
        <div className="absolute opacity-50 top-0 right-0 w-1/6 h-5/6 border-t-4 border-l-4 border-[#185519] hidden lg:block rounded-tl-full z-10"></div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 relative z-10">
          <header className="flex justify-between items-center mb-28">
            <img
              src="/images/Group 9.png"
              alt="Description of the image"
              className="h-10"
            />
            <WalletMultiButton />
          </header>

          <main className="text-center mb-16 justify-center items-center">
            <h2 className="text-lg mb-4 p-2 mx-auto">
              Revolutionizing <span className="text-lime-400">Web3</span>{" "}
              Investments
            </h2>
            <h1 className=" text-8xl font-semibold mb-14">
              <span className="text-lime-400">S</span>croll,
              <span className="text-lime-400"> I</span>nvest,
              <span className="text-lime-400"> C</span>reate,
              <span className="text-lime-400"> K</span>rypto
            </h1>
            <p className="mb-10">
              You can Create SIPs called "Crates" and get acknowledged with a
              Social angle
            </p>
            <a href="/cratecreator">
              <Button className="text-gray-900 px-10 py-8 rounded-full text-lg bg-gradient-to-b from-lime-400 to-lime-800 shadow-[0_8px_24px_rgba(255,255,0,0.6)] hover:shadow-[0_12px_24px_rgba(255,255,0,0.8)] transition-shadow duration-300">
                Get Started
              </Button>
            </a>
          </main>

          <div className="text-center mb-16 text-xl">
            Follow us on: <span className="text-lime-500">X</span>
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
