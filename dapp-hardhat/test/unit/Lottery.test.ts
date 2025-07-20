import { developmentChains } from "../../helper-hardhat-config";
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import * as dotenv from "dotenv";
import { ethers, network } from "hardhat";
dotenv.config();

//use to deploy lottery contract on the localhost
const LotteryModule = buildModule("Lottery", (m) => {
    const baseFee = ethers.parseEther("0.1"); // 0.1 ETH in wei
    const gasPriceLink = 1000000000;
    const entranceFee = ethers.parseEther("0.001");
    
    const vrfCoordinator = m.contract("VRFCoordinatorV2Mock", [baseFee, gasPriceLink]);
    
    const transfer = m.call(vrfCoordinator, "createSubscription");
    const sub_id = m.readEventArgument(transfer, "SubscriptionCreated", 0);

    m.call(vrfCoordinator, "fundSubscription",[sub_id, ethers.parseEther("1")]);
    

    const lottery = m.contract("Lottery", [entranceFee, sub_id, vrfCoordinator]);
    m.call(vrfCoordinator, "addConsumer", [sub_id, lottery]);

    return { lottery };
})

!developmentChains.includes(network.name) 
  ? describe.skip 
  : describe("Lottery", () => {
        let lottery, vrfCoordinatorMock;

        beforeEach(async () => {
            
        });
    })