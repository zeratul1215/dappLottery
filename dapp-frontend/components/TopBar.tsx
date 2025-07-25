"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import ConnectWalletButton from "./ConnectWalletButton";
import DisconnectWalletButton from "./DisconnectWalletButton";

export default function TopBar() {
  const { address, isConnected } = useAccount();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Lottery DApp
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 mx-12">
            <Link
              href="/"
              className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/lottery"
              className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Play Lottery
            </Link>
            <Link
              href="/winners"
              className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Winners
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              About
            </Link>
          </div>

          {/* Connect Wallet Button */}
          <div className="flex items-center space-x-4">
            {isConnected ? <DisconnectWalletButton /> : <ConnectWalletButton />}
          </div>
        </div>
      </div>
    </nav>
  );
}
