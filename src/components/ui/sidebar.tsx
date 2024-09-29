import * as Icons from "lucide-react";
// import React from "react";
import { Tooltip } from "react-tooltip";
import { BsBoxSeam } from "react-icons/bs";
import { RxDashboard } from "react-icons/rx";
import { GiDiamonds } from "react-icons/gi";
import { RiFunctionAddLine } from "react-icons/ri";
import { useLocation } from 'react-router-dom';




const Sidebar = () => {
  // const Menus = [
  //   { title: "/dashboard", src: "Layout", path: "/dashboard" },
  //   { title: "/crates", src: "LayoutGrid", path: "/explorecrate" },
  //   { title: "/scroll", src: "Sparkle", path: "/scroll" },
  //   { title: "/cratecreator", src: "PackageOpen", path: "/cratecreator" },
  // ];

  //href, logo(react element) , path

  //take pathname from router and store it in path

  const location = useLocation();


  

  const sidebarData = [
    {
      path: "/dashboard",
      logo: <BsBoxSeam className={`${location.pathname === "/dashboard" ? "text-[#B6FF1B]" :"" }`} /> 
    },
    {
      path: "/explorecrate",
      logo: <RxDashboard className={`${location.pathname === "/explorecrate" ? "text-[#B6FF1B]" :"" }`} />

    },
    {
      path: "/scroll",
      logo: <GiDiamonds className={`${location.pathname === "/scroll" ? "text-[#B6FF1B]" :"" }`} />

    },
    {
      path: "/cratecreator",
      logo: <RiFunctionAddLine className={`${location.pathname === "/cratecreator" ? "text-[#B6FF1B]" :"" } `}/>
    }

  ]

  return (
    <div className="fixed left-0 top-0 h-full z-40 hidden md:block">
      <div 
        className={`
          flex flex-col justify-between h-full bg-gradient-to-b from-[#0A1019] to-[#02050A] text-gray-400 transition-all duration-300 ease-in-out
          w-16 sm:w-20
        `}
      >
        <div>
          <div className="flex items-center justify-center h-16 sm:h-20 mb-4 sm:mb-8">
            <img
              src="/sickLogo.png"
              alt="Logo"
              className="w-10 h-10 cursor-pointer transition-all duration-300 ease-in-out hover:scale-110"
            />
          </div>
          <nav>
            <ul className="px-4 space-y-4">
              {sidebarData.map((menu, index) => {
                
                return (
                  <li key={index}>
                    <a
                      href={menu.path}
                      data-tooltip-id={`tooltip-${index}`}
                      data-tooltip-content={menu.path}
                      className="flex items-center border border-gray-600 justify-center p-3 rounded-full sm:rounded-3xl transition-all duration-200 text-xl ease-in-out group"
                    >
                      {menu.logo}
                    </a>
                    <Tooltip
                      id={`tooltip-${index}`}
                      place="right"
                      className="bg-black !text-[#B6FF1B] font-mono"
                    />
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        <div className="px-2 sm:px-3 mb-4 sm:mb-8 space-y-2 sm:space-y-4">
          <button className="w-full flex items-center justify-center p-2 sm:p-3 rounded-full sm:rounded-lg transition-all duration-200 ease-in-out hover:bg-green-500 hover:bg-opacity-20 group">
            <Icons.Gem className="text-[#B6FF1B] " size={20} />
          </button>
          <button className="w-full flex items-center justify-center p-2 sm:p-3 rounded-full sm:rounded-lg transition-all duration-200 ease-in-out hover:bg-red-500 hover:bg-opacity-20 group">
            <Icons.LogOut className="text-gray-400 group-hover:text-red-300" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;