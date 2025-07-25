import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import * as dotenv from "dotenv";
import { ethers, network } from "hardhat";
dotenv.config();


const Lottery = buildModule("Lottery", (m) => {

  const baseFee = ethers.parseEther("0.1"); // 0.1 ETH in wei
  const gasPriceLink = 1000000000;
  

  let lottery;

  let vrfCoordinator;
  let sub_id;
  const entranceFee = ethers.parseEther("0.001");
  let interval;
  
  if(network.name == "sepolia"){
    vrfCoordinator = m.contractAt("IVRFCoordinatorV2Plus", "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B");
    sub_id = process.env.SUBSCRIPTION_ID || 1;
    interval = 1800; // 30 minutes
    lottery = m.contract("Lottery", [entranceFee, sub_id, vrfCoordinator, interval]);
  }else{
    //deploy mock vrf coordinator
    const weiPerUnitLink = 1000000000000000000n; // 1 LINK = 1 ETH (18 decimals)
    vrfCoordinator = m.contract("VRFCoordinatorV2_5Mock", [baseFee, gasPriceLink, weiPerUnitLink]);
    //create subscription
    const transfer = m.call(vrfCoordinator, "createSubscription");
    sub_id = m.readEventArgument(transfer, "SubscriptionCreated", 0);
    //fund subscription
    m.call(vrfCoordinator, "fundSubscription",[sub_id, ethers.parseEther("10")]);

    interval = 10; // 10 seconds
    lottery = m.contract("Lottery", [entranceFee, sub_id, vrfCoordinator, interval]);
    m.call(vrfCoordinator, "addConsumer", [sub_id, lottery]);
  }

  return {
    lottery
  };
});

module.exports.default = Lottery;
