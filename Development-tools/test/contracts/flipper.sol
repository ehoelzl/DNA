pragma solidity ^0.4.20;

contract Flipper {
    enum GameState {noWager, wagerMade, wagerAccepted}
    GameState public currentState;
    uint public wager;
    address public player1;
    address public player2;

    uint public seedBlockNumber; // uint are 256 bits

    //The underscore means execute the function there. It is used to verify some conditions before
    //Throw is just a hack that revers all state transitions so it is not mined in the blockchain : provides atomicity
    //If contract is not it correct state, everything will rollback
    modifier onlyState(GameState expectedState){
      if (expectedState == currentState){
        _;
      } else {
        throw;
      }
    }

    function Flipper() payable {
      currentState = GameState.noWager;
    }

    //onlyState is the modifier.
    function makeWager() onlyState(GameState.noWager) payable public returns (bool) {
      player1 = msg.sender;
      wager = msg.value;
      currentState = GameState.wagerMade;
      return true;
    }

    //payable adds functionnality to receiver ether when calling in transaction object
    // if only return false, contract still accepts ether sent
    function acceptWager() onlyState(GameState.wagerMade) payable public returns (bool) {
      if (msg.value == wager) {
        player2 = msg.sender;
        seedBlockNumber = block.number;
        currentState = GameState.wagerAccepted;
        return true;
      }
      //return false; throw helps for reverting all changes
      throw;
    }

    function resolveBet() onlyState(GameState.wagerAccepted) public returns (bool) {
      //Get block hash number for pseudorandomness
      uint256 blockValue = uint256(block.blockhash(seedBlockNumber));

      uint256 factor = 57896044618658097711785492504343953926634992332820282019728792003956564819968;
      uint256 coinFlip = uint256(uint256(blockValue)/ factor );
      if (coinFlip == 0){
        player1.send(this.balance);
        currentState = GameState.noWager;
        return true;
      } else {
        player2.send(this.balance);
        currentState = GameState.noWager;
        return true;
      }

    }
}
