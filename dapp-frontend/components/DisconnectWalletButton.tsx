"use client";

import { useDisconnect } from "wagmi";

export default () => {
  const { disconnect } = useDisconnect();

  return (
    <button
      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
      onClick={() => disconnect()}
    >
      Disconnect Wallet
    </button>
  );
};
