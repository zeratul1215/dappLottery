//enter the lottery (paying some amount)
//pick a random winner
//winner to be selected every X minutes

// chainlink oracle -> random number, automated Execution(chainlink keepers)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

error Lottery__NotEnoughEthEntered();
error Lottery__TransferFailed();
error Lottery__RefundFailed();
error Lottery__NotOpen();
error Lottery__UpkeepNotNeeded();

contract Lottery is VRFConsumerBaseV2Plus, AutomationCompatibleInterface {
    enum LotteryState {
        OPEN,
        CALCULATING
    }

    //state variables
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;
    uint256 private s_subscriptionId;
    // Sepolia coordinator.
    address public immutable vrfCoordinator =
        0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;
    bytes32 private immutable i_keyHash =
        0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
    uint32 private constant callbackGasLimit = 40000; // for the fulfillRandomWords function
    uint16 private constant requestConfirmations = 3;
    uint32 private constant numWords = 1;

    uint256 private constant INTERVAL = 1800; // 30 minutes
    uint256 private s_lastTimeStamp;

    //lottery variables
    address private s_recentWinner;
    LotteryState private s_lotteryState;

    //events
    event LotteryEnter(address indexed player);
    event RequestedLotteryWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    constructor(
        uint256 entranceFee,
        uint64 subscriptionId
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        i_entranceFee = entranceFee;
        s_subscriptionId = subscriptionId;
        s_lotteryState = LotteryState.OPEN;
        s_lastTimeStamp = block.timestamp;
    }

    function enterLottery() public payable onlyWhenOpen enoughEntranceFee {
        s_players.push(payable(msg.sender));
        // refund part of the eth that is more than the entrance fee
        if (msg.value > i_entranceFee) {
            (bool success, ) = payable(msg.sender).call{
                value: msg.value - i_entranceFee
            }("");
            if (!success) {
                revert Lottery__RefundFailed();
            }
        }
        //events emit event when update a dynamic variable like array
        // named event with the function name reversed
        emit LotteryEnter(msg.sender);
    }

    //for the chainlink keeper to check if the performUpkeep should be called
    // 1. time interval should have passed
    // 2. lottery should have at least 1 player and some ETH
    // 3. the subscription is funded with LINK
    // 4. lottery should be in the "open" state
    function checkUpkeep(
        bytes memory /* performData */
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        bool isOpen = s_lotteryState == LotteryState.OPEN;
        bool timePassed = (block.timestamp - s_lastTimeStamp) > INTERVAL;
        bool hasPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
        return (upkeepNeeded, "0x0");
    }

    // only send the request
    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Lottery__UpkeepNotNeeded();
        }

        s_lotteryState = LotteryState.CALCULATING;
        // pick a random number
        // do something with it
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    // Set nativePayment to true to pay for VRF requests with Sepolia ETH instead of LINK
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );
        emit RequestedLotteryWinner(requestId);
    }

    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] calldata randomWords
    ) internal override {
        // pick a random number
        // do something with it
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable winner = s_players[indexOfWinner];
        s_recentWinner = winner;
        s_lotteryState = LotteryState.OPEN;
        // reset the players array
        s_players = new address payable[](0);
        s_lastTimeStamp = block.timestamp;
        (bool success, ) = winner.call{value: address(this).balance}("");
        if (!success) {
            revert Lottery__TransferFailed();
        }
        emit WinnerPicked(winner);
    }

    // gettersview / pure functions
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getLotteryState() public view returns (LotteryState) {
        return s_lotteryState;
    }

    function getNumWords() public pure returns (uint256) {
        return numWords;
    }

    function getInterval() public pure returns (uint256) {
        return INTERVAL;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return requestConfirmations;
    }

    function getPlayerNumber() public view returns (uint256) {
        return s_players.length;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    //modifiers
    modifier enoughEntranceFee() {
        if (msg.value < i_entranceFee) {
            revert Lottery__NotEnoughEthEntered();
        }
        _;
    }

    modifier onlyWhenOpen() {
        if (s_lotteryState != LotteryState.OPEN) {
            revert Lottery__NotOpen();
        }
        _;
    }
}
