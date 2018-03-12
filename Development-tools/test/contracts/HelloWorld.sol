contract HelloWorld {

  //constant parameter : no state machine change in EVM
  function displayMessage() constant returns (string) {
    return "Hello from a smart contract";
  }

}
