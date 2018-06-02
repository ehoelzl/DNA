var AccessRestricted = artifacts.require("./AccessRestricted.sol");
var Patenting = artifacts.require("./Patenting.sol");
var TimeStamping = artifacts.require("./TimeStamping.sol");

module.exports = function(deployer) {
  deployer.deploy(AccessRestricted);
  deployer.deploy(TimeStamping, this.web3.toWei(0.01,'ether'));
  deployer.deploy(Patenting, this.web3.toWei(0.01,'ether'));
};

