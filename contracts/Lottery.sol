pragma solidity ^0.8.0;

/**
 * @title An Ethereum lottery in which one's chances of winning are proportional to their entered funds.
 * @author Finn Frankis
 * SPDX-License-Identifier: MIT
 */
contract Lottery {
    address public manager;

    mapping(address => uint) private playerWagers;
    address[] private playerAddresses;

    uint private potSize;
    uint private maxPotSize;
    uint private numPlayers;

    /**
     * @notice Constructs a new Lottery object with the lottery manager defined as the contract's creator.
     */
    constructor() {
        manager = msg.sender;
        potSize = 0;
        maxPotSize = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
    }

    /**
     * @notice Enters the sender into the lottery provided they are paying in at least 0.01 ether.
     */
    function enter() public payable {
        require(msg.value >= 0.01 ether);
        require(potSize + msg.value <= maxPotSize); // avoid overflow
        
        if (playerWagers[msg.sender] == 0) { // player not yet wagered
            playerAddresses.push(msg.sender);
        }

        playerWagers[msg.sender] += msg.value;
        potSize += msg.value;
    }

    /**
     * @notice Selects the winner of the contract provided the manager is the sender.
     */
    function pickWinner() public {
        require(msg.sender == manager);
        require(playerAddresses.length > 0);

        uint index = random() % potSize;
        
        uint currentPlayer = 0;
        uint currentTotalWagers = playerWagers[playerAddresses[currentPlayer]];
        while (currentTotalWagers <= index) {
            currentPlayer++;
            currentTotalWagers += playerWagers[playerAddresses[0]];
        }

        payable(playerAddresses[currentPlayer]).transfer(address(this).balance);
        reset();
    }

    /**
     * @notice Resets the list of players. Should be called after a winner has been picked. 
     */
    function reset() private {
        for (uint i = 0; i < playerAddresses.length; i++) 
            playerWagers[playerAddresses[i]] = 0;
        playerAddresses = new address[](0); // initial size zero
    }

    /**
     * @notice Generates a pseudo-random whole number between a lower and upper bound 
     * by hashing the block difficulty, current time, and number of players.
     */
    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, playerAddresses)));
    }

    /**
     * @notice Retrieves the list of entered addresses.
     * @return the players in the lottery
     */
    function getPlayerAddresses() public view returns (address[] memory) {
        return playerAddresses;
    }

    /**
     * @notice Retrieves the wager corresponding to a given player.
     * @param playerAddress the address of the player to be searched for
     * @return the player's wager value
     */
    function getWager(address playerAddress) public view returns (uint) {
        return playerWagers[playerAddress];
    }
}