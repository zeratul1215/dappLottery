import { expect, assert } from "chai";
import { developmentChains } from "../../helper-hardhat-config";
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { Contract } from "ethers";
import { ethers, network } from "hardhat";
import hre from "hardhat";



!developmentChains.includes(network.name) 
  ? describe.skip 
  : describe("Lottery", () => {

        let Lottery: Contract;
        beforeEach(async () => {

            //use to deploy lottery contract on the localhost
            const LotteryModule = buildModule(`Lottery_${Date.now()}`, (m) => {
                const baseFee = ethers.parseEther("0.1"); // 0.1 ETH in wei
                const gasPriceLink = 1000000000;
                const entranceFee = ethers.parseEther("0.001");
                
                const vrfCoordinator = m.contract("VRFCoordinatorV2Mock", [baseFee, gasPriceLink]);
                
                const transfer = m.call(vrfCoordinator, "createSubscription");
                const sub_id = m.readEventArgument(transfer, "SubscriptionCreated", 0);

                m.call(vrfCoordinator, "fundSubscription",[sub_id, ethers.parseEther("1")]);
                
                const interval = 10; // 10 seconds
                const lottery = m.contract("Lottery", [entranceFee, sub_id, vrfCoordinator, interval]);
                m.call(vrfCoordinator, "addConsumer", [sub_id, lottery]);

                return { lottery };
            });


            const { lottery } = await hre.ignition.deploy(LotteryModule);
            Lottery = await ethers.getContractAt("Lottery", lottery.address);
        });

        it("constructor", async () => {
            const interval = await Lottery.getInterval();
            const LotteryState = await Lottery.getLotteryState();
            assert(interval.toString() === "10", "Interval is not 10");
            assert(LotteryState.toString() === "0", "Lottery state is not 0");
        });

        describe("enterLottery", () => {
            it("reverts when you don't pay enough", async () => {
                await expect(Lottery.enterLottery({value: ethers.parseEther("0.0009")})).to.be.revertedWithCustomError(Lottery, "Lottery__NotEnoughEthEntered");
            });

            it("records players when they enter", async () => {
                const tx = await Lottery.enterLottery({value: ethers.parseEther("0.001")});
                await tx.wait();
                const player = await Lottery.getPlayer(BigInt(0));
                const signers = await ethers.getSigners();
                assert(player === signers[0].address, "Player address is not the same as the signer");
            });

            it("emits an event when you enter", async () => {
                const signers = await ethers.getSigners();
                const player = signers[0].address;
                await expect(Lottery.enterLottery({value: ethers.parseEther("0.001")}))
                    .to.emit(Lottery, "LotteryEnter")
                    .withArgs(player);
            });

            it("reverts when the lottery is calculating", async () => {
                console.log("===============")
                await Lottery.enterLottery({value: ethers.parseEther("0.001")});
                await network.provider.send("evm_increaseTime", [11]);
                await network.provider.request({method: "evm_mine",params:[]});
                const { upkeepNeeded } = await Lottery.checkUpkeep("0x");
                console.log(upkeepNeeded);
                await Lottery.performUpkeep("0x");
                await Lottery.enterLottery({value: ethers.parseEther("0.001")});
                console.log("===============")
                // await expect(Lottery.enterLottery({value: ethers.parseEther("0.001")})).to.be.revertedWithCustomError(Lottery, "Lottery__NotOpen");
            });

        });

        describe("checkUpkeep", () => {
            it("returns false if people haven't sent any ETH", async () => {
                await network.provider.send("evm_increaseTime", [11]);
                await network.provider.send("evm_mine", []);
                const { upkeepNeeded } = await Lottery.checkUpkeep("0x");
                assert(!upkeepNeeded);
            });
        });
    })