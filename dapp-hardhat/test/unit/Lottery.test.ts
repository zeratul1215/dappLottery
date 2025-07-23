import { expect, assert } from "chai";
import { developmentChains } from "../../helper-hardhat-config";
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { Contract } from "ethers";
import { network, ethers } from "hardhat";
import hre from "hardhat";


!developmentChains.includes(network.name) 
  ? describe.skip 
  : describe("Lottery", () => {

        let Lottery: Contract;
        let VRFCoordinatorMock: Contract;
        beforeEach(async () => {

            //use to deploy lottery contract on the localhost
            const LotteryModule = buildModule(`Lottery_${Date.now()}`, (m) => {
                const baseFee = ethers.parseEther("0.1"); // 0.1 ETH in wei
                const gasPriceLink = 1000000000;
                const weiPerUnitLink = 1000000000000000000n; // 1 LINK = 1 ETH (18 decimals)
                const entranceFee = ethers.parseEther("0.001");
                
                const vrfCoordinator = m.contract("VRFCoordinatorV2_5Mock", [baseFee, gasPriceLink, weiPerUnitLink]);
                
                const transfer = m.call(vrfCoordinator, "createSubscription");
                const sub_id = m.readEventArgument(transfer, "SubscriptionCreated", 0);

                m.call(vrfCoordinator, "fundSubscription",[sub_id, ethers.parseEther("1")]);
                
                const interval = 10; // 10 seconds
                const lottery = m.contract("Lottery", [entranceFee, sub_id, vrfCoordinator, interval]);
                m.call(vrfCoordinator, "addConsumer", [sub_id, lottery]);

                return { lottery, vrfCoordinator };
            });


            const { lottery, vrfCoordinator } = await hre.ignition.deploy(LotteryModule);
            Lottery = await ethers.getContractAt("Lottery", lottery.address);
            VRFCoordinatorMock = await ethers.getContractAt("VRFCoordinatorV2_5Mock", vrfCoordinator.address);
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
                
                await Lottery.enterLottery({value: ethers.parseEther("0.001")});
                await network.provider.send("evm_increaseTime", [11]);
                await network.provider.request({method: "evm_mine",params:[]});
                const { upkeepNeeded } = await Lottery.checkUpkeep("0x");
                await Lottery.performUpkeep("0x");
                await expect(Lottery.enterLottery({value: ethers.parseEther("0.001")})).to.be.revertedWithCustomError(Lottery, "Lottery__NotOpen");
            });

        });

        describe("checkUpkeep",  () => {
            it("returns false if people haven't sent any ETH", async () => {
                await network.provider.send("evm_increaseTime", [11]);
                await network.provider.request({method: "evm_mine",params:[]});
                const { upkeepNeeded } = await Lottery.checkUpkeep("0x");
                assert(!upkeepNeeded);
            });

            it("returns false if the lottery is not open", async () => {
                await Lottery.enterLottery({value: ethers.parseEther("0.001")});
                await network.provider.send("evm_increaseTime", [11]);
                await network.provider.request({method: "evm_mine",params:[]});
                await Lottery.performUpkeep("0x");
                const LotteryState = await Lottery.getLotteryState();
                const { upkeepNeeded } = await Lottery.checkUpkeep("0x");
                assert(!upkeepNeeded);  
                assert(LotteryState.toString(),"1");
            });

            it("returns false if not enough time passed", async () => {
                 // 先记录当前时间戳
                 const initialTime = await ethers.provider.getBlock("latest");
                 const initialTimestamp = initialTime?.timestamp || 0;
                 
                 await Lottery.enterLottery({value: ethers.parseEther("0.001")});
                 
                 // 只增加足够的时间，确保总时间差小于 interval
                 const timeToAdd = 5; // 只增加5秒，确保总时间差小于10
                 await network.provider.send("evm_increaseTime", [timeToAdd]);
                 await network.provider.request({method: "evm_mine",params:[]});
                 
                 const { upkeepNeeded } = await Lottery.checkUpkeep("0x");
                
                 // 添加调试信息
                 const lastTimeStamp = await Lottery.getLastTimeStamp();
                 const interval = await Lottery.getInterval();
                 const currentTime = await ethers.provider.getBlock("latest");
                 
                 assert(!upkeepNeeded);
             });

            it("returns true if all the conditions for checkupkeep are fulfilled", async() => {
                await Lottery.enterLottery({value: ethers.parseEther("0.001")});
                await network.provider.send("evm_increaseTime", [11]);
                await network.provider.request({method: "evm_mine",params:[]});
                const { upkeepNeeded } = await Lottery.checkUpkeep("0x");
                assert(upkeepNeeded);
            });
        });

        describe("performUpkeep", () => {
            it("only run when upkeep is needed", async () => {
                await Lottery.enterLottery({value: ethers.parseEther("0.001")});
                await network.provider.send("evm_increaseTime", [11]);
                await network.provider.request({method: "evm_mine",params:[]});
                const tx = await Lottery.performUpkeep("0x");
                assert(tx);
            });

            it("updates the lottery state, emits an event, and calls vrf coordinator", async () => {
                await Lottery.enterLottery({value: ethers.parseEther("0.001")});
                await network.provider.send("evm_increaseTime", [11]);
                await network.provider.request({method: "evm_mine",params:[]});
                const tx = await Lottery.performUpkeep("0x");
                const txReceipt = await tx.wait(1);
                
                // 解析所有事件
                const events = txReceipt.logs.map((log: any) => {
                    return VRFCoordinatorMock.interface.parseLog(log);
                });
                console.log(events);
            });
        });

        // describe("fulfillRandomWords", () => {

        //     beforeEach(async () => {
        //         await Lottery.enterLottery({value: ethers.parseEther("0.001")});
        //         await network.provider.send("evm_increaseTime", [11]);
        //         await network.provider.request({method: "evm_mine",params:[]});
        //     });

        //     it("can only be called after performUpkeep", async () => {
        //         await expect(await VRFCoordinatorMock.fulfillRandomWords(0, Lottery.target)).to.be.revertedWithCustomError(Lottery, "nonexistent request");
        //     });

        // });
    })
