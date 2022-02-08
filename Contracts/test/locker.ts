
const { time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ethers, waffle } = require("hardhat");
const provider = waffle.provider;
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { network } from "hardhat";
import { Locker, Locker__factory, LokcerFactory, LokcerFactory__factory, TestCoin, TestCoin__factory } from "../typechain";
import { PICNICLockerFactory } from "../typechain/PICNICLockerFactory";

let deployer: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress;
let lockerFactory: LokcerFactory, locker: Locker;
let testCoin: TestCoin, testCoin2: TestCoin, testCoin3: TestCoin;

const zeroAddress = "0x0000000000000000000000000000000000000000";

enum Type { TOKEN, LPTOKEN }


describe("PICNIC Locker Stack", () => {

  beforeEach(async () => {

    [deployer, user1, user2] = await ethers.getSigners();

    const LokcerFactory: LokcerFactory__factory = await ethers.getContractFactory("LokcerFactory");
    lockerFactory = await LokcerFactory.deploy();

    const TestCoin: TestCoin__factory = await ethers.getContractFactory("TestCoin");
    testCoin = await TestCoin.deploy();
    testCoin2 = await TestCoin.deploy();
    testCoin3 = await TestCoin.deploy();

    // const LockerFactory: Locker__factory  = await ethers.getContractFactory("PICNICLocker");

  });

  it("Deployement", async () => {
    expect(lockerFactory.address).to.be.properAddress;
    // console.log(lockerFactory.address)
  })

  describe("As owner =>", () => {

    it("can update the fees", async () => {

      expect(await lockerFactory.lockerFee()).to.be.equal(ethers.utils.parseEther("0.1"));
      expect(await lockerFactory.updateLokcerFee()).to.be.equal(ethers.utils.parseEther("0.05"));


      await lockerFactory.updateFees(ethers.utils.parseEther("0.2"), ethers.utils.parseEther("0.1"));

      expect(await lockerFactory.lockerFee()).to.be.equal(ethers.utils.parseEther("0.2"));
      expect(await lockerFactory.updateLokcerFee()).to.be.equal(ethers.utils.parseEther("0.1"));


    });

    it("can withdraw all the funds", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneYearsduration = Number(await time.duration.years(1));

      await testCoin.mint(user1.address, ethers.utils.parseEther("10.0"));
      await testCoin.connect(user1).approve(lockerFactory.address, ethers.utils.parseEther("10.0"));

      await expect( () =>
        lockerFactory.connect(user1)
        .createLcoker(
          Type.TOKEN,
          user1.address,
          testCoin.address,
          ethers.utils.parseEther("10.0"),
          latestBlock.timestamp + OneYearsduration,
          { value: ethers.utils.parseEther("0.1") })
        ).to.changeEtherBalance(lockerFactory, ethers.utils.parseEther("0.1"))


      await testCoin2.mint(user1.address, ethers.utils.parseEther("5.0"));
      await testCoin2.connect(user1).approve(lockerFactory.address, ethers.utils.parseEther("5.0"));

      await expect( () =>
        lockerFactory.connect(user1)
        .createLcoker(
          Type.TOKEN,
          user1.address,
          testCoin2.address,
          ethers.utils.parseEther("5.0"),
          latestBlock.timestamp + OneYearsduration,
          { value: ethers.utils.parseEther("0.1") })
        ).to.changeEtherBalance(lockerFactory, ethers.utils.parseEther("0.1"))

      await testCoin3.mint(user1.address, ethers.utils.parseEther("1"));
      await testCoin3.connect(user1).approve(lockerFactory.address, ethers.utils.parseEther("1"));

      await expect( () =>
        lockerFactory.connect(user1)
        .createLcoker(
          Type.TOKEN,
          user1.address,
          testCoin3.address,
          ethers.utils.parseEther("1.0"),
          latestBlock.timestamp + OneYearsduration,
          { value: ethers.utils.parseEther("0.1") })
        ).to.changeEtherBalance(lockerFactory, ethers.utils.parseEther("0.1"))

      const info1 = await lockerFactory.lockerInfo(1);
      const info2 = await lockerFactory.lockerInfo(2);
      const info3 = await lockerFactory.lockerInfo(3);

      expect(await testCoin.balanceOf(info1.locker)).to.be.equal(ethers.utils.parseEther("10"));
      expect(await testCoin2.balanceOf(info2.locker)).to.be.equal(ethers.utils.parseEther("5"));
      expect(await testCoin3.balanceOf(info3.locker)).to.be.equal(ethers.utils.parseEther("1"));

      expect(await provider.getBalance(lockerFactory.address)).to.be.equal(ethers.utils.parseEther("0.3"));
      
      await expect( () =>
        lockerFactory.withdrawFunds()
      ).to.changeEtherBalance(lockerFactory, "-"+ethers.utils.parseEther("0.3"))

      expect(await provider.getBalance(lockerFactory.address)).to.be.equal(ethers.utils.parseEther("0"));
      await expect(lockerFactory.withdrawFunds()).to.be.reverted;

    });

    it("can set LaunchPad Address", async () => {

      await lockerFactory.setLaunchPadAddress(zeroAddress)
      expect(await lockerFactory.launchpadAddress()).to.be.equal(zeroAddress);

    });

  });

  describe("As Users =>", () => {

    it("after locking, anyone can see his locked token info", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneYearsduration = Number(await time.duration.years(1));

      await testCoin.mint(user1.address, ethers.utils.parseEther("10.0"));
      await testCoin.connect(user1).approve(lockerFactory.address, ethers.utils.parseEther("10.0"));


      await expect(lockerFactory.connect(user1)
        .createLcoker(
          Type.TOKEN,
          user1.address,
          testCoin.address,
          ethers.utils.parseEther("10.0"),
          latestBlock.timestamp + OneYearsduration,
          { value: ethers.utils.parseEther("0.09") })
      ).to.be.reverted;

      await expect(lockerFactory.connect(user1)
        .createLcoker(
          Type.TOKEN,
          user1.address,
          testCoin.address,
          ethers.utils.parseEther("10.0"),
          0,
          { value: ethers.utils.parseEther("0.1") })
      ).to.be.reverted;


      await lockerFactory.connect(user1)
        .createLcoker(
          Type.TOKEN,
          user1.address,
          testCoin.address,
          ethers.utils.parseEther("10.0"),
          latestBlock.timestamp + OneYearsduration,
          { value: ethers.utils.parseEther("0.1") });

      expect(Number(await lockerFactory.getLockersListbyUser(user1.address))).to.be.equal(1);
      expect(Number(await lockerFactory.getLockersListbyToken(testCoin.address))).to.be.equal(1);

      const lockerInfo = await lockerFactory.lockerInfo(1);

      expect(await testCoin.balanceOf(lockerInfo.locker)).to.be.equal(ethers.utils.parseEther("10.0"));
      expect(lockerInfo.id).to.be.equal(1);
      expect(lockerInfo.owner).to.be.equal(user1.address);
      expect(lockerInfo.token).to.be.equal(testCoin.address);
      expect(lockerInfo.numOfTokens).to.be.equal(ethers.utils.parseEther("10.0"));
      expect(lockerInfo.unlockTime).to.be.equal(latestBlock.timestamp + OneYearsduration);
      expect(lockerInfo.status).to.be.equal(0);

    })

    it("after locking, user can add more tokens to the lock by paying update fee", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneYearsduration = Number(await time.duration.years(1));

      await testCoin.mint(user1.address, ethers.utils.parseEther("10.0"));
      await testCoin.connect(user1).approve(lockerFactory.address, ethers.utils.parseEther("10.0"));


      await lockerFactory.connect(user1)
        .createLcoker(
          Type.TOKEN,
          user1.address,
          testCoin.address,
          ethers.utils.parseEther("10.0"),
          latestBlock.timestamp + OneYearsduration,
          { value: ethers.utils.parseEther("0.1") });

      let lockerInfo = await lockerFactory.lockerInfo(1);

      expect(await testCoin.balanceOf(lockerInfo.locker)).to.be.equal(ethers.utils.parseEther("10.0"));
      expect(lockerInfo.numOfTokens).to.be.equal(ethers.utils.parseEther("10.0"));

      await testCoin.mint(user1.address, ethers.utils.parseEther("5.0"));
      await testCoin.connect(user1).approve(lockerFactory.address, ethers.utils.parseEther("5.0"));

      await expect(
        lockerFactory.connect(user1).addTokenstoALocker(1, ethers.utils.parseEther("5.0"), { value: ethers.utils.parseEther("0.0049") })
      ).to.be.reverted;

      await expect(
        lockerFactory.connect(user1).addTokenstoALocker(1, ethers.utils.parseEther("0"), { value: ethers.utils.parseEther("0.05") })
      ).to.be.reverted;

      await lockerFactory.connect(user1).addTokenstoALocker(1, ethers.utils.parseEther("5.0"), { value: ethers.utils.parseEther("0.05") });

      lockerInfo = await lockerFactory.lockerInfo(1);

      expect(await testCoin.balanceOf(lockerInfo.locker)).to.be.equal(ethers.utils.parseEther("15.0"));
      expect(lockerInfo.numOfTokens).to.be.equal(ethers.utils.parseEther("15.0"));


    })

    it("after locking, user can increase the locking period by paying update fee", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneYearsduration = Number(await time.duration.years(1));

      await testCoin.mint(user1.address, ethers.utils.parseEther("10.0"));
      await testCoin.connect(user1).approve(lockerFactory.address, ethers.utils.parseEther("10.0"));

      await lockerFactory.connect(user1)
        .createLcoker(
          Type.TOKEN,
          user1.address,
          testCoin.address,
          ethers.utils.parseEther("10.0"),
          latestBlock.timestamp + OneYearsduration,
          { value: ethers.utils.parseEther("0.1") }
        );

      await expect(
        lockerFactory.connect(user1).increaseLocktime(5, OneYearsduration, { value: ethers.utils.parseEther("0.05") })
      ).to.be.reverted;

      await expect(
        lockerFactory.connect(user1).increaseLocktime(1, 0, { value: ethers.utils.parseEther("0.05") })
      ).to.be.reverted;

      await expect(
        lockerFactory.connect(user1).increaseLocktime(1, OneYearsduration, { value: ethers.utils.parseEther("0.049") })
      ).to.be.reverted;

      await lockerFactory.connect(user1).increaseLocktime(1, OneYearsduration, { value: ethers.utils.parseEther("0.05") });

      let lockerInfo = await lockerFactory.lockerInfo(1);
      expect(Number(lockerInfo.unlockTime)).to.be.equal(latestBlock.timestamp + 2 * OneYearsduration);

      await network.provider.send("evm_increaseTime", [2 * OneYearsduration])
      await network.provider.send("evm_mine")


      await expect(
        lockerFactory.connect(user1).increaseLocktime(1, OneYearsduration, { value: ethers.utils.parseEther("0.05") })
      ).to.be.reverted;


    })

    it("User can create multiple lockers", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneYearsduration = Number(await time.duration.years(1));

      await testCoin.mint(user1.address, ethers.utils.parseEther("10.0"));
      await testCoin.connect(user1).approve(lockerFactory.address, ethers.utils.parseEther("10.0"));

      await lockerFactory.connect(user1)
        .createLcoker(
          Type.TOKEN,
          user1.address,
          testCoin.address,
          ethers.utils.parseEther("10.0"),
          latestBlock.timestamp + OneYearsduration,
          { value: ethers.utils.parseEther("0.1") });

      await testCoin2.mint(user1.address, ethers.utils.parseEther("5.0"));
      await testCoin2.connect(user1).approve(lockerFactory.address, ethers.utils.parseEther("5.0"));

      await lockerFactory.connect(user1)
        .createLcoker(
          Type.TOKEN,
          user1.address,
          testCoin2.address,
          ethers.utils.parseEther("5.0"),
          latestBlock.timestamp + OneYearsduration,
          { value: ethers.utils.parseEther("0.1") });


      await testCoin3.mint(user1.address, ethers.utils.parseEther("1"));
      await testCoin3.connect(user1).approve(lockerFactory.address, ethers.utils.parseEther("1"));

      await lockerFactory.connect(user1)
        .createLcoker(
          Type.TOKEN,
          user1.address,
          testCoin3.address,
          ethers.utils.parseEther("1.0"),
          latestBlock.timestamp + OneYearsduration,
          { value: ethers.utils.parseEther("0.1") });

      const locksListbyUser = await lockerFactory.getLockersListbyUser(user1.address);
      expect(locksListbyUser[0]).to.be.equal(BigNumber.from("1"));
      expect(locksListbyUser[1]).to.be.equal(BigNumber.from("2"));
      expect(locksListbyUser[2]).to.be.equal(BigNumber.from("3"));

      expect(Number(await lockerFactory.getLockersListbyToken(testCoin.address))).to.be.equal(1);
      expect(Number(await lockerFactory.getLockersListbyToken(testCoin2.address))).to.be.equal(2);
      expect(Number(await lockerFactory.getLockersListbyToken(testCoin3.address))).to.be.equal(3);

      const lock1details1 = await lockerFactory.lockerInfo(1);
      expect(lock1details1.owner).to.be.equal(user1.address);
      expect(lock1details1.token).to.be.equal(testCoin.address);

      const lock1details2 = await lockerFactory.lockerInfo(2);
      expect(lock1details2.owner).to.be.equal(user1.address);
      expect(lock1details2.token).to.be.equal(testCoin2.address);

      const lock1details3 = await lockerFactory.lockerInfo(3);
      expect(lock1details3.owner).to.be.equal(user1.address);
      expect(lock1details3.token).to.be.equal(testCoin3.address);

    });

    it("User can withdraw their tokens partially in many turns once the locking time is over ", async () => {

      let locker1Info;
      let latestBlock = await ethers.provider.getBlock("latest")
      const OneYearsduration = Number(await time.duration.years(1));

      await testCoin.mint(user1.address, ethers.utils.parseEther("10.0"));
      await testCoin.connect(user1).approve(lockerFactory.address, ethers.utils.parseEther("10.0"));

      await lockerFactory.connect(user1)
        .createLcoker(
          Type.TOKEN,
          user1.address,
          testCoin.address,
          ethers.utils.parseEther("10.0"),
          latestBlock.timestamp + OneYearsduration,
          { value: ethers.utils.parseEther("0.1") });

      locker1Info = await lockerFactory.lockerInfo(1);
      // console.log("Unlock time ", new Date( Number(locker1Info.unlockTime) * 1000 ) )
      expect(await testCoin.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther("0.0"))
      expect(await testCoin.balanceOf(locker1Info.locker)).to.be.equal(ethers.utils.parseEther("10.0"))
      expect(locker1Info.numOfTokens).to.be.equal(ethers.utils.parseEther("10.0"))


      await expect(lockerFactory.connect(user1).unlockTokens(0, ethers.utils.parseEther("5.0"))).to.be.reverted;
      await expect(lockerFactory.connect(user1).unlockTokens(1, ethers.utils.parseEther("5.0"))).to.be.reverted;

      await network.provider.send("evm_increaseTime", [OneYearsduration])
      await network.provider.send("evm_mine")

      await expect(lockerFactory.connect(user1).unlockTokens(1, ethers.utils.parseEther("11.0"))).to.be.reverted;
      await expect(lockerFactory.connect(user2).unlockTokens(1, ethers.utils.parseEther("5.0"))).to.be.reverted;
      await lockerFactory.connect(user1).unlockTokens(1, ethers.utils.parseEther("5.0"));

      locker1Info = await lockerFactory.lockerInfo(1);
      expect(await testCoin.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther("5.0"));
      expect(await testCoin.balanceOf(locker1Info.locker)).to.be.equal(ethers.utils.parseEther("5.0"));
      expect(locker1Info.numOfTokens).to.be.equal(ethers.utils.parseEther("5.0"));

      await lockerFactory.connect(user1).unlockTokens(1, ethers.utils.parseEther("5.0"));

      locker1Info = await lockerFactory.lockerInfo(1);
      expect(await testCoin.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther("10.0"))
      expect(await testCoin.balanceOf(locker1Info.locker)).to.be.equal(ethers.utils.parseEther("0"))
      expect(locker1Info.numOfTokens).to.be.equal(ethers.utils.parseEther("0"))

      await expect(lockerFactory.connect(user1).unlockTokens(0, 1, ethers.utils.parseEther("5.0"))).to.be.reverted;


    });

    it("No one can directly interact with a locker contract expect going through factory contract ", async () => {

      let locker1Info;
      let latestBlock = await ethers.provider.getBlock("latest");
      const OneYearsduration = Number(await time.duration.years(1));

      await testCoin.mint(user1.address, ethers.utils.parseEther("10.0"));
      await testCoin.connect(user1).approve(lockerFactory.address, ethers.utils.parseEther("10.0"));

      await lockerFactory.connect(user1)
        .createLcoker(
          Type.TOKEN,
          user1.address,
          testCoin.address,
          ethers.utils.parseEther("10.0"),
          latestBlock.timestamp + OneYearsduration,
          { value: ethers.utils.parseEther("0.1") });

      locker1Info = await lockerFactory.lockerInfo(1);
      // console.log("locker address ", locker1Info.locker );

      const Locker: Locker__factory  = await ethers.getContractFactory("Locker");
      locker = Locker.attach(locker1Info.locker);

      // expect(lockerFactory.address).to.be.equal(await locker.master())
 
      await expect( locker.increaseLocktime(OneYearsduration) ).to.be.reverted;

      await testCoin.mint(user1.address, ethers.utils.parseEther("10.0"));
      await testCoin.connect(user1).approve(locker.address, ethers.utils.parseEther("10.0"));
      await expect( locker.addTokenstoALocker(ethers.utils.parseEther("10")) ).to.be.reverted;

      await network.provider.send("evm_increaseTime", [OneYearsduration])
      await network.provider.send("evm_mine")

      await expect( locker.unlockTokens(ethers.utils.parseEther("10.0"))).to.be.reverted;


    });


  });


});
