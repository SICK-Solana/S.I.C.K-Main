import React from 'react';
import { IoWalletOutline } from "react-icons/io5";
import { TbLogout } from "react-icons/tb";
import { useWallet } from "@solana/wallet-adapter-react";

interface HeaderPhoneProps {
  wallets: any[];
}

const HeaderPhone: React.FC<HeaderPhoneProps> = ({ wallets }) => {
  const {  disconnect } = useWallet();

  const handleWalletClick = () => {
    if (wallets && wallets.length > 0) {
      const tipLinkWallet = wallets[0];
      if (tipLinkWallet && tipLinkWallet._showWallet) {
        tipLinkWallet._showWallet();
      } else {
        console.error("TipLink wallet or showWallet method not found");
      }
    } else {
      console.error("No wallets available");
    }
  };

  return (
    <div className="h-14 mx-5 mb-2 flex justify-between items-center">
      <div>
        <img src="/sickLogo.png" alt="" className="w-8 h-8 md:opacity-0"/>
      </div>
      <div className="flex gap-4 items-center">
        <a href="/">
          <TbLogout onClick={disconnect} className="text-white w-6 h-6 cursor-pointer" />
        </a>
        <IoWalletOutline onClick={handleWalletClick} className="text-white w-6 h-6 cursor-pointer" />
      <a href='/dashboard'>  <img
          src="https://imgs.search.brave.com/6PN65lJBy4NhRQ01F3qEaPE0lg-6nrHcwPfeIWQAAJE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/YnJpdGFubmljYS5j/b20vNDUvMjIzMDQ1/LTA1MC1BNjQ1M0Q1/RC9UZWxzYS1DRU8t/RWxvbi1NdXNrLTIw/MTQuanBnP3c9Mzg1"
          alt=""
          className="w-8 h-8 object-cover rounded-full"
        />
        </a>
      </div>
    </div>
  );
};

export default HeaderPhone;