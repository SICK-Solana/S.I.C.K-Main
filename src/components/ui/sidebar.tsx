import * as Icons from "lucide-react";
import React from "react";
import { Tooltip } from "react-tooltip";

const Sidebar = () => {
  const Menus = [
    { title: "/dashboard", src: "Layout", path: "/dashboard" },
    { title: "/crates", src: "LayoutGrid", path: "/crates" },
    { title: "/scroll", src: "Sparkle", path: "/scroll" },
    { title: "/create Crate", src: "PackageOpen", path: "/cratecreator" },
  ];

  return (
    <div className="fixed left-0 top-0 h-full z-40 hidden md:block">
      <div 
        className={`
          flex flex-col justify-between h-full bg-black text-yellow-300 transition-all duration-300 ease-in-out
          w-16 sm:w-20
        `}
      >
        <div>
          <div className="flex items-center justify-center h-16 sm:h-20 mb-4 sm:mb-8">
            <img
              src="/images/SICK_LOGO2.png"
              alt="Logo"
              className="w-12 h-12 sm:w-16 sm:h-16 cursor-pointer transition-all duration-300 ease-in-out hover:scale-110"
            />
          </div>
          <nav>
            <ul className="space-y-2 sm:space-y-4 px-2 sm:px-3">
              {Menus.map((menu, index) => {
                const Icon = Icons[menu.src as keyof typeof Icons] as React.ElementType;
                return (
                  <li key={index}>
                    <a
                      href={menu.path}
                      data-tooltip-id={`tooltip-${index}`}
                      data-tooltip-content={menu.title}
                      className="flex items-center justify-center p-2 sm:p-3 rounded-full sm:rounded-3xl transition-all duration-200 ease-in-out group"
                    >
                      {Icon && <Icon className="text-yellow-400 group-hover:text-yellow-300" size={20} />}
                    </a>
                    <Tooltip
                      id={`tooltip-${index}`}
                      place="right"
                      className="!bg-yellow-500 !text-black font-mono"
                    />
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        <div className="px-2 sm:px-3 mb-4 sm:mb-8 space-y-2 sm:space-y-4">
          <button className="w-full flex items-center justify-center p-2 sm:p-3 rounded-full sm:rounded-lg transition-all duration-200 ease-in-out hover:bg-yellow-500 hover:bg-opacity-20 group">
            <Icons.Gem className="text-yellow-400 group-hover:text-yellow-300" size={20} />
          </button>
          <button className="w-full flex items-center justify-center p-2 sm:p-3 rounded-full sm:rounded-lg transition-all duration-200 ease-in-out hover:bg-yellow-500 hover:bg-opacity-20 group">
            <Icons.LogOut className="text-yellow-400 group-hover:text-yellow-300" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;