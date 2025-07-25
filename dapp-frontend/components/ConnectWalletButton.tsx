"use client";

import { useConnect } from "wagmi";

export default () => {
  const { connectors, connect } = useConnect();

  return (
    <>
      <button
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
        key={connectors[0].uid}
        onClick={() => connect({ connector: connectors[0] })}
      >
        Connect Wallet
      </button>
    </>
  );
};
