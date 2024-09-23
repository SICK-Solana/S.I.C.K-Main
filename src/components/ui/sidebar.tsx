import { useState } from "react";

const Sidebar = () => {
    const [open, setOpen] = useState(true);
    const Menus = [
      { title: "Overview", src: "Overview" },
      { title: "Transactions", src: "Transactions" },
      { title: "Loyalty Cards", src: "Card"},
      { title: "Subscriptions ", src: "Calendar" },
      
    ];
  return (
        <div className="flex">
      <div
        className={` ${
          open ? "w-72" : "w-20 "
        } bg-black h-screen p-5  pt-8 relative duration-300`}
      >
        <img
          src="/images/arrows.png"
          className={`absolute cursor-pointer -right-3 top-9 w-7 border-dark-purple
           border-2 rounded-full  ${!open && "rotate-180"}`}
          onClick={() => setOpen(!open)}
        />
        <div className="flex gap-x-4 items-center">
          <img
            src="/images/SICK_LOGO2.png"
            className={`cursor-pointer duration-500 ${
              open && "rotate-[360deg]"
            }`}
          />
          
        </div>
        <ul className="pt-6">
          {Menus.map((Menu, index) => (
            <li
              key={index}
              className={`flex  rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
               `}
            >
              <img src={`/images/${Menu.src}.svg`} />
              <span className={`${!open && "hidden"} origin-left duration-200`}>
                {Menu.title}
              </span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}

export default Sidebar