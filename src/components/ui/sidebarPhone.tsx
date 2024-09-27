import React from 'react';
import * as Icons from "lucide-react";

export const SideBarPhone = () => {
  const Menus = [
    { title: "Dashboard", src: "Layout", path: "/dashboard" },
    { title: "Crates", src: "LayoutGrid", path: "/crates" },
    { title: "Scroll", src: "Sparkle", path: "/scroll" },
    { title: "Create Crate", src: "PackageOpen", path: "/create-crate" },
  ];

  return (
    <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-black z-50">
      <nav className="flex justify-around items-center h-16 px-4">
        {Menus.map((menu, index) => {
          const Icon = Icons[menu.src as keyof typeof Icons] as React.ElementType;
          return (
            <a
              key={index}
              href={menu.path}
              className="flex flex-col items-center justify-center text-yellow-300 hover:text-yellow-400 transition-colors duration-200"
            >
              {Icon && <Icon size={20} />}
              <span className="text-xs mt-1">{menu.title}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
};

export default SideBarPhone;