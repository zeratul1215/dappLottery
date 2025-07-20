import { ethers } from "hardhat";
import type { Contract } from "ethers";
import deployInfo from "../ignition/deployments/chain-11155111/deployed_addresses.json";

const main = async () => {

  const lotteryAddr = deployInfo["Lottery#Lottery"];
  const lotteryContract = await ethers.getContractAt("Lottery", lotteryAddr);


  const signers = await ethers.getSigners();
  const connectSignerZeroWithLottery = await lotteryContract.connect(signers[0]) as Contract;
  const connectSignerOneWithLottery = await lotteryContract.connect(signers[1]) as Contract;

  const entranceFee = await lotteryContract.getEntranceFee();
  console.log("Entrance fee:", ethers.formatEther(entranceFee));

  const state = await lotteryContract.getLotteryState();
  console.log("Lottery state:", state); 
  if(state !== BigInt(0)) {
    console.log("Lottery is not open");
    return;
  }


  const tx1 = await connectSignerZeroWithLottery.enterLottery({ value: entranceFee });
  await tx1.wait(3);
  console.log("Ticket for signer zero bought");
  
  const tx2 = await connectSignerOneWithLottery.enterLottery({ value: entranceFee });
  await tx2.wait(3);
  console.log("Ticket for signer one bought");

  const lotteryState = await lotteryContract.getPlayer(0);
  console.log("Player 0:", lotteryState);

  const lotteryState2 = await lotteryContract.getPlayer(1);
  console.log("Player 1:", lotteryState2);

  const balance = await ethers.provider.getBalance(lotteryAddr);
  console.log("Lottery balance:", ethers.formatEther(balance));
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
