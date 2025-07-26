"use server";

import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";

export const getLotteryContractAddresses = async () => {
  const snapshot = await get(ref(db, "contracts/lottery"));
  const data = snapshot.val();
  return data;
}

// data structure
// {
//   '300': { address: '0xcf638e23f8eE04C1630ED05c6D0B24CCBDe328F1' },
//   '1800': { address: '0x182Be0f377Aa1190e6030eA4F074FdF9D800A1eb' }
// }
