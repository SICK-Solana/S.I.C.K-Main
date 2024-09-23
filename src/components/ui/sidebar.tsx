import * as Icons from "lucide-react"; // Import all Lucide icons
import React from "react"; // Ensure React is imported
import { Tooltip } from "react-tooltip"; // Updated import for react-tooltip

const Sidebar = () => {
  const Menus = [
    { title: "/ dashboard", src: "Box" }, // Use valid Lucide icon names
    { title: "/ crates", src: "LayoutGrid" },
    { title: "/ scroll", src: "Sparkle" },
    { title: "/ create-crate", src: "Boxes" },
  ];

  return (
    <div className="flex justify-start min-h-screen bg-gray-100">
      <div className="sm:w-20 bg-black text-yellow-300 p-3 flex flex-col items-center">
        <div className="mb-10">
          <img
            src="/images/SICK_LOGO2.png"
            alt="Logo"
            width={100}
            height={100}
            className="cursor-pointer"
          />
        </div>
        <nav>
          <ul className="space-y-6">
            {Menus.map((menu, index) => {
              const Icon = Icons[
                menu.src as keyof typeof Icons
              ] as React.ElementType;

              return (
                <li key={index}>
                  <a
                    href="#"
                    data-tooltip-id={`tooltip-${index}`} // Add unique tooltip ID
                    data-tooltip-content={menu.title} // Tooltip content
                    className="flex items-center p-3 custom-border-gradient text-yellow-400"
                  >
                    {Icon ? (
                      <Icon className="" size={24} /> // Display the icon
                    ) : (
                      <span className="mr-4">?</span> // Fallback if the icon doesn't exist
                    )}
                  </a>
                  {/* Tooltip for each icon */}
                  <Tooltip
                    id={`tooltip-${index}`}
                    place="right"
                    className="border border-yellow-500 text-yellow-600"
                  />
                </li>
              );
            })}
          </ul>
          <Icons.Gem className="my-10 mx-4" />
          <Icons.LogOut className="my-10 mx-4" />
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
