//enter the lottery (paying some amount)
//pick a random winner
//winner to be selected every X minutes

// chainlink oracle -> random number, automated Execution(chainlink keepers)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

error Lottery__NotEnoughEthEntered();

contract Lottery is VRFConsumerBaseV2Plus {
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

    //events
    event LotteryEnter(address indexed player);

    constructor(
        uint256 entranceFee,
        uint64 subscriptionId
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        i_entranceFee = entranceFee;
        s_subscriptionId = subscriptionId;
    }

    function enterLottery() public payable enoughEntranceFee {
        s_players.push(payable(msg.sender));
        //events emit event when update a dynamic variable like array
        // named event with the function name reversed
        emit LotteryEnter(msg.sender);
    }

    // only send the request
    function requestRandomWinner() external {
        // pick a random number
        // do something with it
        s_vrfCoordinator.requestRandomWords(
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
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        // pick a random number
        // do something with it
    }

    // view / pure functions
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    modifier enoughEntranceFee() {
        if (msg.value < i_entranceFee) {
            revert Lottery__NotEnoughEthEntered();
        }
        _;
    }
}
