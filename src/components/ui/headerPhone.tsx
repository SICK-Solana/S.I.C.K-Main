import { IoWalletOutline } from "react-icons/io5";

const headerPhone = () => {
  return (
    <div className="h-14 mb-2 flex justify-between items-center">
        <div>
        <img src="/sickLogo.png" alt="" className="w-8 h-8 md:opacity-0"/>

        </div>
        <div className="flex gap-4 items-center">
            <IoWalletOutline className="text-white w-6 h-6 cursor-pointer" />
            <img src="https://imgs.search.brave.com/6PN65lJBy4NhRQ01F3qEaPE0lg-6nrHcwPfeIWQAAJE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/YnJpdGFubmljYS5j/b20vNDUvMjIzMDQ1/LTA1MC1BNjQ1M0Q1/RC9UZWxzYS1DRU8t/RWxvbi1NdXNrLTIw/MTQuanBnP3c9Mzg1" alt="" className="w-8 h-8 object-cover rounded-full"/>

        </div>
    </div>
  )
}

export default headerPhone
