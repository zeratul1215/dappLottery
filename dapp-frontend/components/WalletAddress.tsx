"use client";

import { useDisconnect } from "wagmi";
import Dropdown from "./Dropdown";

interface WalletAddressProps {
  address: string;
}

export default function WalletAddress({ address }: WalletAddressProps) {
  const { disconnect } = useDisconnect();

  // 格式化地址显示：显示前6位和后4位
  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <Dropdown
      trigger={
        <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>{formatAddress(address)}</span>
          <svg 
            className="w-4 h-4 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      }
    >
      <button
        onClick={handleDisconnect}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
      >
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>disconnect</span>
        </div>
      </button>
    </Dropdown>
  );
} 