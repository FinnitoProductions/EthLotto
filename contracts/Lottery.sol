pragma solidity ^0.4.17;

/**
 * @title An Ethereum lottery.
 * @author Finn Frankis
 */
contract Lottery {
    address public manager;
    address[] public players;

    /**
     * @notice Constructs a new Lottery object with the lottery manager defined as the contract's creator.
     */
    function Lottery() public {
        manager = msg.sender;
    }

    /**
     * @notice Enters the sender into the lottery provided they are paying in at least 0.01 ether.
     */
    function enter() public payable {
        require(msg.value >= 0.01 ether);

        players.push(msg.sender);
    }

    /**
     * @notice Selects the winner of the contract provided the manager is the sender.
     */
    function pickWinner() public {
        require(msg.sender == manager);
        require(players.length > 0);

        uint index = random() % players.length;
        players[index].transfer(this.balance);
        reset();
    }

    /**
     * @notice Resets the list of players: should be called after a winner has been picked. 
     */
    function reset() private {
        players = new address[](0); // initial size zero
    }

    /**
     * @notice Generates a pseudo-random integer by hashing the block difficulty, current time, and number of players.
     */
    function random() private view returns (uint) {
        return uint(sha3(block.difficulty, now, players));
    }

    /**
     * @notice Retrieves the array of entrants.
     * @return the players in the lottery
     */
    function getPlayers() public view returns (address[]) {
        return players;
    }
}