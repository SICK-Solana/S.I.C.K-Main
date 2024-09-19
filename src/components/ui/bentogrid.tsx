import { Box, CircleDollarSign, Mouse, Sparkles } from "lucide-react";

export const BentoGrid = () => {
  return (
    <section>
      <div className="py-16 bg-[#070707]">
        <div className="mx-auto px20 max-w-6xl text-white">
          <div className="relative">
            <div className="relative z-10 grid gap-3 grid-cols-6">
              <div className="col-span-full lg:col-span-3 lg:row-span-2 overflow-hidden flex relative p-4 rounded-3xl bg-black  border border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                <div className="size-fit  relative">
                  <div className="relative flex flex-col ">
                    <span className="w-fit block  text-5xl  text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-700 ">
                      Find Famous SIP-Like Crates to invest in
                    </span>
                    <p className="text-lg mt-2">You can also create yours.</p>
                  </div>
                  <div className="flex flex-row">
                    <img src="/images/Frame 34.png" className=" my-4"></img>
                    <img
                      src="/images/Frame 33.png"
                      className=" my-4 mx-3"
                    ></img>
                  </div>
                </div>
              </div>

              <div className="col-span-full sm:col-span-3 lg:col-span-3 lg:row-span-4 overflow-hidden relative p-8 rounded-3xl bg-black border border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-5xl w-fit text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                  Create and Share Crypto Crates{" "}
                </p>

                <div className="flex flex-row mt-10">
                  <div className="flex flex-col w-2/5 bg-black p-4 rounded-xl space-y-6">
                    {/* Scroll Option */}
                    <div className="flex items-center space-x-4 opacity-40">
                    <Mouse />
                      <span className="text-gray-300 text-lg">Scroll</span>
                    </div>

                    <div className="flex items-center space-x-4 opacity-40">
                    
                      <CircleDollarSign />
                      
                      <span className="text-gray-300 text-lg">Invest</span>
                    </div>

                    {/* Invest Option */}
                    <div className="flex items-center space-x-4 opacity-40">
                    <Box />
                      <span className="text-gray-300 text-lg">Invest</span>
                    </div>

                    {/* Create Option - Highlighted */}

                    {/* Krypto Option */}
                    <div className="flex items-center space-x-4 opacity-40">
                    <Sparkles />
                      <span className="text-gray-300 text-lg">
                        Krypto</span>
                    </div>
                  </div>

                  <img src="/images/Frame 25.png"></img>
                </div>
              </div>

              <div className="col-span-full lg:col-span-3 lg:row-span-2 overflow-hidden relative p-4 border rounded-3xl bg-gradient-to-b from-black to-gray-900 ">
                <div className=" sm:grid-cols-2 flex flex-col w-fit">
                  <div className="relative w-fit">
                    <p className="text-5xl w-fit text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                      Prove everyone what your portfolio beholds!
                    </p>
                  </div>

                  <div className="relative flex justify-end">
                    <img
                      src="/images/tetris z.png"
                      alt="Tetris"
                      className="w-48 h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
