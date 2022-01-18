const PICNICLocker = artifacts.require("PICNICLocker.sol");
const TestCoin = artifacts.require("TestCoin.sol");
const PICNICLockerFactory = artifacts.require("PICNICLockerFactory.sol");

module.exports = function (deployer) {
  deployer.deploy(PICNICLocker);
  deployer.deploy(TestCoin);
  deployer.deploy(PICNICLockerFactory);

  
};
