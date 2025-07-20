import { ethers } from "hardhat";
import deployInfo from "../ignition/deployments/chain-11155111/deployed_addresses.json";

const main = async () => {

  const lotteryAddr = deployInfo["Lottery#Lottery"];
  const balance = await ethers.provider.getBalance(lotteryAddr);
  console.log("Lottery balance:", ethers.formatEther(balance));
  const signers = await ethers.getSigners();
  console.log("Signers:", signers);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
