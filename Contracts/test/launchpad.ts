const { time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
// const { ethers, waffle } = require("hardhat");
import { ethers, waffle } from "hardhat";
const provider = waffle.provider;
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { network } from "hardhat";
import { LokcerFactory, LokcerFactory__factory, PresaleToken, PresaleToken__factory, UniswapV2Factory, UniswapV2Factory__factory, UniswapV2Pair, UniswapV2Pair__factory, UniswapV2Router02, UniswapV2Router02__factory, WETH9, WETH9__factory } from "../typechain";
import { Launchpad__factory } from "../typechain/factories/Launchpad__factory";
import { Launchpad } from "../typechain/Launchpad";

let deployer: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress, user3: SignerWithAddress, user4: SignerWithAddress, teamAddr: SignerWithAddress, devAddr: SignerWithAddress
let launchpad: Launchpad, presaleToken: PresaleToken, WBNBAddr: WETH9
let factory: UniswapV2Factory, router: UniswapV2Router02, uniswapV2Pair: UniswapV2Pair;
let lockerFactory: LokcerFactory;

const zeroAddress = "0x0000000000000000000000000000000000000000";

const overrides = {
  gasLimit: 9999999
}

// let latestBlock = await ethers.provider.getBlock("latest")
// latestBlock.timestamp
// await network.provider.send("evm_increaseTime", [Number(time.duration.days(1))])
// await network.provider.send("evm_mine")

describe("PICNIC Launchpad Stack", () => {

  beforeEach(async () => {

    [deployer, user1, user2, user3, user4, teamAddr, devAddr] = await ethers.getSigners();

    const UniswapV2Factory: UniswapV2Factory__factory = await ethers.getContractFactory("UniswapV2Factory");
    const UniswapV2Pair: UniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
    const UniswapV2Router02: UniswapV2Router02__factory = await ethers.getContractFactory('UniswapV2Router02');
    const WBNB: WETH9__factory = await ethers.getContractFactory('WETH9');
    const PresaleToken: PresaleToken__factory = await ethers.getContractFactory('PresaleToken');
    const Launchpad: Launchpad__factory = await ethers.getContractFactory("Launchpad");

    // router = await UniswapV2Router02.attach(router.address);
    presaleToken = await PresaleToken.deploy();
    factory = await UniswapV2Factory.deploy(deployer.address);
    WBNBAddr = await WBNB.deploy();
    router = await UniswapV2Router02.deploy(factory.address, WBNBAddr.address, overrides);

    const LokcerFactory: LokcerFactory__factory = await ethers.getContractFactory("LokcerFactory");
    lockerFactory = await LokcerFactory.deploy();

    launchpad = await Launchpad.deploy(factory.address, router.address, WBNBAddr.address, teamAddr.address, devAddr.address, lockerFactory.address);

    await lockerFactory.setLaunchPadAddress(launchpad.address);

    // const uniswapV2PairAddress = await factory.getPair(myWETH.address, onPlanet.address);
    // uniswapV2Pair = await UniswapV2Pair.attach(uniswapV2PairAddress);
  });

  it("Deployement", async () => {
    expect(launchpad.address).to.be.properAddress;
    // console.log(launchpad.address)
  })

  describe("As master ", async () => {

    it("should be able to update the overall fees", async () => {

      const Upfrontfee = await launchpad.upfrontfee(); // 100;
      const fee = await launchpad.salesFeeInPercent(); // = 2;

      expect(Upfrontfee).to.be.equal(ethers.utils.parseEther("0.2"));
      expect(fee).to.be.equal(2);

      await launchpad.updateFees(ethers.utils.parseEther("0.3"), 3)

      const UpfrontfeeAfter = await launchpad.upfrontfee(); // 200;
      const feeAfter = await launchpad.salesFeeInPercent(); // = 3;

      expect(UpfrontfeeAfter).to.be.equal(ethers.utils.parseEther("0.3"));
      expect(feeAfter).to.be.equal(3);



    });

    it("should be able to whitelist users to start a free presale", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      await launchpad.whiteListUsersToStartProject(user1.address)
      const isWhiteListed = await launchpad.isUserWhitelistedToStartProject(user1.address);
      expect(isWhiteListed).to.be.equal(true);

      await presaleToken.mint(user1.address, ethers.utils.parseEther("17"));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther("17"));

      await launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("0.02"),
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("0.01"),
          maxTokensReq: ethers.utils.parseEther("0.05"),
          softCap: ethers.utils.parseEther("5")
        },
      )

      const count = await launchpad.count();
      expect(count).to.be.equal(1);

    });

    it("himself can start a free presale", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      // await launchpad.whiteListUsersToStartProject(user1.address);
      // const isWhiteListed = await launchpad.isUserWhitelistedToStartProject(user1.address);
      // expect(isWhiteListed).to.be.equal(true);

      await presaleToken.mint(deployer.address, ethers.utils.parseEther("17"));
      await presaleToken.approve(launchpad.address, ethers.utils.parseEther("17"));

      await launchpad.createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("0.02"),
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("0.01"),
          maxTokensReq: ethers.utils.parseEther("0.05"),
          softCap: ethers.utils.parseEther("5")
        },
        // { value: ethers.utils.parseEther("0.2") }
      )

      const count = await launchpad.count();
      expect(count).to.be.equal(1);


    });

  });

  describe("As a user ", async () => {

    it("can start a presale by paying fee", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      //Presale project address can't be null
      await expect(launchpad.connect(user1).createPresale(
        0,
        zeroAddress,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("0.02"),
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("0.01"),
          maxTokensReq: ethers.utils.parseEther("0.05"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("0.19") }
      )
      ).to.be.reverted;

      //Insufficient funds to start
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("0.02"),
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("0.01"),
          maxTokensReq: ethers.utils.parseEther("0.05"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("0.19") }
      )
      ).to.be.reverted;

      //criteria token project address can't be null
      await expect(launchpad.connect(user1).createPresale(
        2,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("0.02"),
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("0.01"),
          maxTokensReq: ethers.utils.parseEther("0.05"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("0.2") }
      )
      ).to.be.reverted;

      // liquidity should be at least 50% or more
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        49,
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("0.02"),
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("0.01"),
          maxTokensReq: ethers.utils.parseEther("0.05"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      // liquidity should be at least 50% or more
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        101,
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("0.02"),
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("0.01"),
          maxTokensReq: ethers.utils.parseEther("0.05"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      // softcap should be at least 50% or more
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("0.02"),
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("0.01"),
          maxTokensReq: ethers.utils.parseEther("0.05"),
          softCap: ethers.utils.parseEther("4.9")
        },
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      //tokens for sale must be more than 0
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("0"),
        ethers.utils.parseEther("0.02"),
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("0.01"),
          maxTokensReq: ethers.utils.parseEther("0.05"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      //_minTokensReq should be more than zero
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("0.02"),
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("0.0"),
          maxTokensReq: ethers.utils.parseEther("0.05"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      //_maxTokensReq > _minTokensReq
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("0.02"),
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("0.05"),
          maxTokensReq: ethers.utils.parseEther("0.04"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      //startedAt should be more than 15 minutes from now
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("0.02"),
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute - OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("0.01"),
          maxTokensReq: ethers.utils.parseEther("0.05"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      //expiredAt should be more than one day from now
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("0.02"),
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay - OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("5"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      //Lockup period should be  7 or more days from now time
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("0.02"),
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay - OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("5"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      //Unable to transfer presale tokens to the contract
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("0.02"),
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("5"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      //_priceOfEachToken should be more than zero
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("0"),
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("5"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;


      await presaleToken.mint(user1.address, ethers.utils.parseEther("17"));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther("17"));

      expect(await launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("0.02"),
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("0.01"),
          maxTokensReq: ethers.utils.parseEther("0.05"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("0.20") }
      )
      )

      const count = await launchpad.count();
      expect(count).to.be.equal(1);

    });

    it("other users can participate once the sale is live", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      await presaleToken.mint(user1.address, ethers.utils.parseEther("17"));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther("17"));

      await launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        1,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("5") }
      )

      const count = await launchpad.count();
      expect(count).to.be.equal(1);

      await network.provider.send("evm_increaseTime", [15 * OneMinute + OneMinute])
      await network.provider.send("evm_mine")

      await launchpad.connect(user2).buyTokensOnPresale(1, ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });
      await launchpad.connect(user3).buyTokensOnPresale(1, ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });
      await launchpad.connect(user4).buyTokensOnPresale(1, ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });

      const p2 = await launchpad.participant(1, user2.address);
      expect(p2.tokens).to.be.equal(ethers.utils.parseEther("2"))
      expect(p2.value).to.be.equal(ethers.utils.parseEther("2"))

      const p3 = await launchpad.participant(1, user3.address);
      expect(p3.tokens).to.be.equal(ethers.utils.parseEther("2"))
      expect(p3.value).to.be.equal(ethers.utils.parseEther("2"))

      const p4 = await launchpad.participant(1, user4.address);
      expect(p4.tokens).to.be.equal(ethers.utils.parseEther("1"))
      expect(p4.value).to.be.equal(ethers.utils.parseEther("1"))

      await network.provider.send("evm_increaseTime", [OneDay])
      await network.provider.send("evm_mine")

      await expect(launchpad.connect(user4).buyTokensOnPresale(1, ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") }))
        .to.be.reverted;


    });

    it("After getting expired, user can end a successfull presale", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      await presaleToken.mint(user1.address, ethers.utils.parseEther("17"));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther("17"));

      await launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        1,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("5") }
      )

      const count = await launchpad.count();
      expect(count).to.be.equal(1);

      await network.provider.send("evm_increaseTime", [15 * OneMinute + OneMinute])
      await network.provider.send("evm_mine")

      await launchpad.connect(user2).buyTokensOnPresale(1, ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });
      await launchpad.connect(user3).buyTokensOnPresale(1, ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });
      await launchpad.connect(user4).buyTokensOnPresale(1, ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });

      const p2 = await launchpad.participant(1, user2.address);
      expect(p2.tokens).to.be.equal(ethers.utils.parseEther("2"))
      expect(p2.value).to.be.equal(ethers.utils.parseEther("2"))

      const p3 = await launchpad.participant(1, user3.address);
      expect(p3.tokens).to.be.equal(ethers.utils.parseEther("2"))
      expect(p3.value).to.be.equal(ethers.utils.parseEther("2"))

      const p4 = await launchpad.participant(1, user4.address);
      expect(p4.tokens).to.be.equal(ethers.utils.parseEther("1"))
      expect(p4.value).to.be.equal(ethers.utils.parseEther("1"))

      await network.provider.send("evm_increaseTime", [OneDay])
      await network.provider.send("evm_mine")

      await expect(launchpad.connect(user4).buyTokensOnPresale(1, ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") }))
        .to.be.reverted;

      await launchpad.connect(user1).endPresale(1);

      const saleInfo = await launchpad.presaleInfo(1);
      expect(saleInfo.preSaleStatus).to.be.equal(2);


    });

    it("After getting expired, user can end a unsuccessfull presale", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      await presaleToken.mint(user1.address, ethers.utils.parseEther("17"));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther("17"));

      await launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        1,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,

        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("5") }
      )

      const count = await launchpad.count();
      expect(count).to.be.equal(1);

      await network.provider.send("evm_increaseTime", [15 * OneMinute + OneMinute])
      await network.provider.send("evm_mine")

      await launchpad.connect(user2).buyTokensOnPresale(1, ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });
      await launchpad.connect(user3).buyTokensOnPresale(1, ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });
      // await launchpad.connect(user4).buyTokensOnPresale(1, ethers.utils.parseEther("1"), {value: ethers.utils.parseEther("1")});

      const p2 = await launchpad.participant(1, user2.address);
      expect(p2.tokens).to.be.equal(ethers.utils.parseEther("2"))
      expect(p2.value).to.be.equal(ethers.utils.parseEther("2"))

      const p3 = await launchpad.participant(1, user3.address);
      expect(p3.tokens).to.be.equal(ethers.utils.parseEther("2"))
      expect(p3.value).to.be.equal(ethers.utils.parseEther("2"))

      const p4 = await launchpad.participant(1, user4.address);
      expect(p4.tokens).to.be.equal(ethers.utils.parseEther("0"))
      expect(p4.value).to.be.equal(ethers.utils.parseEther("0"))

      await network.provider.send("evm_increaseTime", [OneDay])
      await network.provider.send("evm_mine")

      await expect(launchpad.connect(user4).buyTokensOnPresale(1, ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") }))
        .to.be.reverted;

      await launchpad.connect(user1).endPresale(1);

      const saleInfo = await launchpad.presaleInfo(1);
      expect(saleInfo.preSaleStatus).to.be.equal(3);


    });

    it("After selling out, user can end a sale successfully before expiry time ", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      await presaleToken.mint(user1.address, ethers.utils.parseEther("17"));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther("17"));

      await launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        1,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("4"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("5") }
      )

      const count = await launchpad.count();
      expect(count).to.be.equal(1);

      await network.provider.send("evm_increaseTime", [15 * OneMinute + OneMinute])
      await network.provider.send("evm_mine")

      await launchpad.connect(user2).buyTokensOnPresale(1, ethers.utils.parseEther("4"), { value: ethers.utils.parseEther("4") });
      await launchpad.connect(user3).buyTokensOnPresale(1, ethers.utils.parseEther("3"), { value: ethers.utils.parseEther("3") });
      await launchpad.connect(user4).buyTokensOnPresale(1, ethers.utils.parseEther("3"), { value: ethers.utils.parseEther("3") });


      await launchpad.connect(user1).endPresale(1);

      const saleInfo = await launchpad.presaleInfo(1);
      expect(saleInfo.preSaleStatus).to.be.equal(2);

      await expect(
        launchpad.connect(user2).buyTokensOnPresale(1, ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") })
      ).to.be.reverted;


    });

    it("After successfull presale, launchpad will store all data about distribution, lock the tokens to the locker, and only owner of the sale can redeem them after lockup time", async () => {

      let latestBlock = await ethers.provider.getBlock("latest");
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      await presaleToken.mint(user1.address, ethers.utils.parseEther("17"));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther("17"));

      await launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        1,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")

        },
        { value: ethers.utils.parseEther("5") }
      )

      const count = await launchpad.count();
      expect(count).to.be.equal(1);

      await network.provider.send("evm_increaseTime", [15 * OneMinute + OneMinute])
      await network.provider.send("evm_mine")

      await launchpad.connect(user2).buyTokensOnPresale(1, ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });
      await launchpad.connect(user3).buyTokensOnPresale(1, ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });
      await launchpad.connect(user4).buyTokensOnPresale(1, ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });

      const p2 = await launchpad.participant(1, user2.address);
      expect(p2.tokens).to.be.equal(ethers.utils.parseEther("2"))
      expect(p2.value).to.be.equal(ethers.utils.parseEther("2"))

      const p3 = await launchpad.participant(1, user3.address);
      expect(p3.tokens).to.be.equal(ethers.utils.parseEther("2"))
      expect(p3.value).to.be.equal(ethers.utils.parseEther("2"))

      const p4 = await launchpad.participant(1, user4.address);
      expect(p4.tokens).to.be.equal(ethers.utils.parseEther("1"))
      expect(p4.value).to.be.equal(ethers.utils.parseEther("1"))

      await network.provider.send("evm_increaseTime", [OneDay])
      await network.provider.send("evm_mine")

      await expect(launchpad.connect(user4).buyTokensOnPresale(1, ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") }))
        .to.be.reverted;

      await expect(launchpad.connect(user1).endPresale(2)).to.be.reverted;

      await launchpad.connect(user1).endPresale(1);

      const saleInfo = await launchpad.presaleInfo(1);
      expect(saleInfo.preSaleStatus).to.be.equal(2);

      const uniswapV2PairAddress = await factory.getPair(presaleToken.address, WBNBAddr.address);
      const UniswapV2Pair: UniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
      uniswapV2Pair = await UniswapV2Pair.attach(uniswapV2PairAddress);

      const internalData = await launchpad.internalData(1)
      // console.log( "internalData.totalLP ", ethers.utils.parseEther(internalData.totalLP.toString()) )
      // console.log( "internalData.lockerID ", internalData.lockerID.toString())

      let lockerInfo = await lockerFactory.lockerInfo(Number(internalData.lockerID));
      expect(lockerInfo.owner).to.be.equal(user1.address);
      expect(internalData.totalLP).to.be.equal(lockerInfo.numOfTokens);
      expect(lockerInfo.status).to.be.equal(0);

      await network.provider.send("evm_increaseTime", [6 * OneDay])
      await network.provider.send("evm_mine")

      const locker_balance_of_pairTokens_before_unlocking = await uniswapV2Pair.balanceOf(lockerInfo.locker);
      await lockerFactory.connect(user1).unlockTokens(internalData.lockerID.toString(), internalData.totalLP.toString())
      const user_balance_of_pairTokens_after_unlocking = await uniswapV2Pair.balanceOf(user1.address);
      expect(locker_balance_of_pairTokens_before_unlocking).to.be.equal(user_balance_of_pairTokens_after_unlocking);

      lockerInfo = await lockerFactory.lockerInfo(Number(internalData.lockerID));
      expect(lockerInfo.status).to.be.equal(1);


    });

    it("After successfull presale, users can claim their new tokens only once and owner can widthraw remaining tokens. ", async () => {

      let latestBlock = await ethers.provider.getBlock("latest");
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      await presaleToken.mint(user1.address, ethers.utils.parseEther("17"));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther("17"));

      await expect(() =>
        launchpad.connect(user1).createPresale(
          0,
          presaleToken.address,
          zeroAddress,
          70,
          ethers.utils.parseEther("10"),
          1,
          0,
          {
            startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
            expiredAt: latestBlock.timestamp + OneDay + OneMinute,
            lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          },
          {
            minTokensReq: ethers.utils.parseEther("1"),
            maxTokensReq: ethers.utils.parseEther("3"),
            softCap: ethers.utils.parseEther("5")
          },
          { value: ethers.utils.parseEther("5") }
        )
      ).to.changeEtherBalance(launchpad, ethers.utils.parseEther("5"))

      const count = await launchpad.count();
      expect(count).to.be.equal(1);


      // const criteria = await launchpad.presaleParticipationCriteria(1);
      // console.log("presaleTimes.startedAt ", Number(criteria.presaleTimes.startedAt) );
      // console.log("latestBlock.timestamp ", Number(latestBlock.timestamp) );


      // console.log("devTeamShareBNB ", ethers.utils.formatEther(internaldata.devTeamShareBNB));
      // console.log("ownersShareBNB ", ethers.utils.formatEther(internaldata.ownersShareBNB));


      await expect(
        launchpad.connect(user2).buyTokensOnPresale(1, ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") })
      ).to.be.reverted;

      await network.provider.send("evm_increaseTime", [15 * OneMinute + OneMinute])
      await network.provider.send("evm_mine")

      await launchpad.connect(user2).buyTokensOnPresale(1, ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });
      await launchpad.connect(user3).buyTokensOnPresale(1, ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });
      await launchpad.connect(user4).buyTokensOnPresale(1, ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });


      // 17 - 5 - 3.5

      await network.provider.send("evm_increaseTime", [OneDay])
      await network.provider.send("evm_mine")

      // const teamAddrbalance = await provider.getBalance(teamAddr.address);
      // const teamAddrbalanceETH = Number(ethers.utils.formatEther(teamAddrbalance))


      await expect(launchpad.connect(user2).endPresale(1)).to.be.reverted;

      await expect(() => launchpad.connect(user1).endPresale(1))
        .to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("5")}`)
      // .to.changeEtherBalance(user1, ethers.utils.parseEther(String(1.4)))
      // .to.changeEtherBalance(devAddr, ethers.utils.parseEther(String(0.1*0.75)));
      // .to.changeEtherBalance(teamAddr, ethers.utils.parseEther(String(0.1*0.25)));

      // poolShareBNB  3.5
      // devTeamShareBNB  0.1
      // ownersShareBNB  1.4
      // const contractBalance = await provider.getBalance(launchpad.address);



      // const internaldata = await launchpad.internalData(1);
      // console.log("poolShareBNB ", ethers.utils.formatEther(internaldata.poolShareBNB));
      // console.log("devTeamShareBNB ", ethers.utils.formatEther(internaldata.devTeamShareBNB));
      // console.log("ownersShareBNB ", ethers.utils.formatEther(internaldata.ownersShareBNB));

      expect(await presaleToken.balanceOf(launchpad.address)).to.be.equal(ethers.utils.parseEther(String(17 - 5 * 0.7)));
      // console.log(" token balance of contract before anyone withdraw ", await presaleToken.balanceOf(launchpad.address))

      expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("0"));
      await launchpad.connect(user2).claimTokensOrARefund(1);
      expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("2"));


      // console.log(" token balance of contract after user2 withdraw ", await presaleToken.balanceOf(launchpad.address))


      expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("0"))
      await launchpad.connect(user3).claimTokensOrARefund(1);
      expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("2"))


      // console.log(" token balance of contract after user3 withdraw ", await presaleToken.balanceOf(launchpad.address))


      expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther("0"))
      await launchpad.connect(user4).claimTokensOrARefund(1);
      expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther("1"))

      // console.log(" token balance of contract after user3 withdraw ", await presaleToken.balanceOf(launchpad.address))


      // const internalData = await launchpad.internalData(1);
      // console.log("internalData.extraTokens ", ethers.utils.formatEther(internalData.extraTokens))

      expect(await presaleToken.balanceOf(launchpad.address)).to.be.equal(ethers.utils.parseEther(String(17 - 5 - 5 * 0.7)))

      await expect(launchpad.connect(user2).claimTokensOrARefund(1)).to.be.reverted;
      await expect(launchpad.connect(user3).claimTokensOrARefund(1)).to.be.reverted;
      await expect(launchpad.connect(user4).claimTokensOrARefund(1)).to.be.reverted;

      expect(await presaleToken.balanceOf(launchpad.address)).to.be.equal(ethers.utils.parseEther("8.5"))
      expect(await presaleToken.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther("0"))
      await launchpad.connect(user1).burnOrWithdrawTokens(1, 1);
      expect(await presaleToken.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther("8.5"))
      expect(await presaleToken.balanceOf(launchpad.address)).to.be.equal(ethers.utils.parseEther("0"))

      await expect(launchpad.connect(user1).burnOrWithdrawTokens(1, 1)).to.be.reverted;

      await expect(
        launchpad.connect(user2).buyTokensOnPresale(1, ethers.utils.parseEther("2"),
          { value: ethers.utils.parseEther("2") })
      ).to.be.reverted;


    });

    it("After unsuccessfull presale, users can claim their Ethers only once and owner can burn remaining tokens. ", async () => {

      let latestBlock = await ethers.provider.getBlock("latest");
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      await presaleToken.mint(user1.address, ethers.utils.parseEther("17"));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther("17"));

      await launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        zeroAddress,
        70,
        ethers.utils.parseEther("10"),
        1,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        { value: ethers.utils.parseEther("0.2") }
      )

      expect(await provider.getBalance(launchpad.address)).to.be.equal(ethers.utils.parseEther("0.2"));


      const count = await launchpad.count();
      expect(count).to.be.equal(1);

      await network.provider.send("evm_increaseTime", [15 * OneMinute + OneMinute])
      await network.provider.send("evm_mine")

      await launchpad.connect(user2).buyTokensOnPresale(1, ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });
      await launchpad.connect(user3).buyTokensOnPresale(1, ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });
      // await launchpad.connect(user4).buyTokensOnPresale(1, ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });

      expect(await provider.getBalance(launchpad.address)).to.be.equal(ethers.utils.parseEther(String(0.2 + 4)));
      expect(await presaleToken.balanceOf(launchpad.address)).to.be.equal(ethers.utils.parseEther("17"));

      await network.provider.send("evm_increaseTime", [OneDay]);
      await network.provider.send("evm_mine");

      await launchpad.connect(user1).endPresale(1);
      const saleInfo = await launchpad.presaleInfo(1);
      expect(saleInfo.preSaleStatus).to.be.equal(3);

      // const internalData = await launchpad.internalData(1);
      // console.log("internalData.extraTokens ", ethers.utils.formatEther(internalData.extraTokens));

      expect(await provider.getBalance(launchpad.address)).to.be.equal(ethers.utils.parseEther("4.2"));
      expect(await presaleToken.balanceOf(launchpad.address)).to.be.equal(ethers.utils.parseEther("17"));

      await launchpad.connect(user2).claimTokensOrARefund(1);
      await launchpad.connect(user3).claimTokensOrARefund(1);

      await expect(launchpad.connect(user4).claimTokensOrARefund(1)).to.be.reverted;

      expect(await provider.getBalance(launchpad.address)).to.be.equal(ethers.utils.parseEther("0.2"));


      await expect(launchpad.connect(user2).claimTokensOrARefund(1)).to.be.reverted;
      await expect(launchpad.connect(user3).claimTokensOrARefund(1)).to.be.reverted;
      await expect(launchpad.connect(user4).claimTokensOrARefund(1)).to.be.reverted;

      expect(await presaleToken.balanceOf(launchpad.address)).to.be.equal(ethers.utils.parseEther("17"))
      expect(await presaleToken.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther("0"))
      await launchpad.connect(user1).burnOrWithdrawTokens(1, 0);
      expect(await presaleToken.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther("0"))
      expect(await presaleToken.balanceOf(launchpad.address)).to.be.equal(ethers.utils.parseEther("0"))

      await expect(launchpad.connect(user1).burnOrWithdrawTokens(1, 0)).to.be.reverted;



    });

  });

})


