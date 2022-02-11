const { time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
// const { ethers, waffle } = require("hardhat");
import { ethers, waffle } from "hardhat";
const provider = waffle.provider;
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { network } from "hardhat";
import { Launchpadv2, Launchpadv2__factory, LokcerFactory, LokcerFactory__factory, LPLocker__factory, LPLokcerManager, LPLokcerManager__factory, Presale, PresaleToken, PresaleToken__factory, Presale__factory, UniswapV2Factory, UniswapV2Factory__factory, UniswapV2Pair, UniswapV2Pair__factory, UniswapV2Router02, UniswapV2Router02__factory, WETH9, WETH9__factory } from "../typechain";
import { Launchpad__factory } from "../typechain/factories/Launchpad__factory";
import { Launchpad } from "../typechain/Launchpad";

let deployer: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress, user3: SignerWithAddress, user4: SignerWithAddress, user5: SignerWithAddress, user6: SignerWithAddress, teamAddr: SignerWithAddress, devAddr: SignerWithAddress
let launchpad: Launchpadv2, presale: Presale, presaleToken: PresaleToken, criteriaToken: PresaleToken, WBNBAddr: WETH9

let factory: UniswapV2Factory, router: UniswapV2Router02, uniswapV2Pair: UniswapV2Pair;
let lpLockerManager: LPLokcerManager;

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

    [deployer, user1, user2, user3, user4, user5, user6, teamAddr, devAddr] = await ethers.getSigners();

    const UniswapV2Factory: UniswapV2Factory__factory = await ethers.getContractFactory("UniswapV2Factory");
    const UniswapV2Pair: UniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
    const UniswapV2Router02: UniswapV2Router02__factory = await ethers.getContractFactory('UniswapV2Router02');
    const WBNB: WETH9__factory = await ethers.getContractFactory('WETH9');
    const PresaleToken: PresaleToken__factory = await ethers.getContractFactory('PresaleToken');
    const Launchpad: Launchpadv2__factory = await ethers.getContractFactory("Launchpadv2");
    const LPLockerManager: LPLokcerManager__factory = await ethers.getContractFactory("LPLokcerManager");


    // router = await UniswapV2Router02.attach(router.address);
    presaleToken = await PresaleToken.deploy();
    criteriaToken = await PresaleToken.deploy();
    factory = await UniswapV2Factory.deploy(deployer.address);
    WBNBAddr = await WBNB.deploy();
    router = await UniswapV2Router02.deploy(factory.address, WBNBAddr.address, overrides);
    lpLockerManager = await LPLockerManager.deploy();

    launchpad = await Launchpad.deploy({
      pancakeSwapFactoryAddr: factory.address,
      pancakeSwapRouterAddr: router.address,
      WBNBAddr: WBNBAddr.address,
      teamAddr: teamAddr.address,
      devAddr: devAddr.address
    }
     
      );

    // const uniswapV2PairAddress = await factory.getPair(myWETH.address, onPlanet.address);
    // uniswapV2Pair = await presale_factory.attach(uniswapV2PairAddress);


  });

  it("Deployement", async () => {
    expect(launchpad.address).to.be.properAddress;
    // console.log(launchpad.address);
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


      await launchpad.whiteListUsersToStartProject([user1.address]);

      await presaleToken.mint(user1.address, ethers.utils.parseEther("27"));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther("27"));

      await launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        ethers.utils.parseEther("10"),
        70,
        ethers.utils.parseEther("10"),
        zeroAddress,
        1,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        0,
        { value: ethers.utils.parseEther("0.20") }
      )

      const presaleCount = await launchpad.presaleCount();
      expect(presaleCount).to.be.equal(1);

      const pressaleAddress = await launchpad.presaleRecordByID(presaleCount);
      const pressaleAddress2 = await launchpad.presaleRecordByToken(presaleToken.address);

      expect(pressaleAddress).to.be.equal(pressaleAddress2);

      const presale_factory = await ethers.getContractFactory("Presale");
      presale = await presale_factory.attach(pressaleAddress);

    });

    it("himself can start a free presale", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));


      await presaleToken.mint(deployer.address, ethers.utils.parseEther("27"));
      await presaleToken.approve(launchpad.address, ethers.utils.parseEther("27"));

      await launchpad.createPresale(
        0,
        presaleToken.address,
        ethers.utils.parseEther("10"),
        70,
        ethers.utils.parseEther("10"),
        zeroAddress,
        1,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        0,
        { value: ethers.utils.parseEther("0.20") }
      )

      const presaleCount = await launchpad.presaleCount();
      expect(presaleCount).to.be.equal(1);

      const pressaleAddress = await launchpad.presaleRecordByID(presaleCount);
      const pressaleAddress2 = await launchpad.presaleRecordByToken(presaleToken.address);

      expect(pressaleAddress).to.be.equal(pressaleAddress2);

      const presale_factory = await ethers.getContractFactory("Presale");
      presale = await presale_factory.attach(pressaleAddress);



    });

    it("can start a presale by paying fee", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      await presaleToken.mint(user1.address, ethers.utils.parseEther("27"));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther("27"));

      await launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        ethers.utils.parseEther("10"),
        70,
        ethers.utils.parseEther("10"),
        zeroAddress,
        1,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        0,
        { value: ethers.utils.parseEther("0.20") }
      )

      await presaleToken.mint(user2.address, ethers.utils.parseEther("27"));
      await presaleToken.connect(user2).approve(launchpad.address, ethers.utils.parseEther("27"));

      await launchpad.connect(user2).createPresale(
        0,
        presaleToken.address,
        ethers.utils.parseEther("10"),
        70,
        ethers.utils.parseEther("10"),
        zeroAddress,
        1,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        0,
        { value: ethers.utils.parseEther("0.20") }
      )

      await expect(launchpad.connect(user1).withdrawBNBs()).to.be.reverted;
      await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(deployer, ethers.utils.parseEther("0.4"))


    });

  });

  describe("As a user ", async () => {

    it("Can't start a sale with wrong data provided", async () => {
      let latestBlock = await ethers.provider.getBlock("latest")
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));


      //Presale project address can't be null
      await expect(launchpad.connect(user1).createPresale(
        0,
        zeroAddress,
        ethers.utils.parseEther("10"),
        70,
        ethers.utils.parseEther("10"),
        zeroAddress,
        0,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        0,
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      //criteria token project address can't be null
      await expect(launchpad.connect(user1).createPresale(
        2,
        presaleToken.address,
        ethers.utils.parseEther("10"),
        70,
        ethers.utils.parseEther("10"),
        zeroAddress,
        0,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        0,
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      // liquidity should be at least 50% or more
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        ethers.utils.parseEther("10"),
        49,
        ethers.utils.parseEther("10"),
        zeroAddress,
        0,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        0,
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      // liquidity should be at least 50% or more
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        ethers.utils.parseEther("10"),
        101,
        ethers.utils.parseEther("10"),
        zeroAddress,
        0,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        0,
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      // softcap should be at least 50% or more
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        ethers.utils.parseEther("10"),
        70,
        ethers.utils.parseEther("10"),
        zeroAddress,
        0,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("4.9")
        },
        0,
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      //tokens for sale must be more than 0
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        ethers.utils.parseEther("0"),
        70,
        ethers.utils.parseEther("10"),
        zeroAddress,
        0,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        0,
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      //_minTokensReq should be more than zero
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        ethers.utils.parseEther("10"),
        70,
        ethers.utils.parseEther("10"),
        zeroAddress,
        0,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("0"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        0,
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      //_maxTokensReq > _minTokensReq
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        ethers.utils.parseEther("10"),
        70,
        ethers.utils.parseEther("10"),
        zeroAddress,
        0,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("3"),
          maxTokensReq: ethers.utils.parseEther("1"),
          softCap: ethers.utils.parseEther("5")
        },
        0,
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      //_priceOfEachToken should be more than zero
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        ethers.utils.parseEther("10"),
        70,
        ethers.utils.parseEther("10"),
        zeroAddress,
        0,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        0,
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      //Unable to transfer presale tokens to the contract
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        ethers.utils.parseEther("10"),
        70,
        ethers.utils.parseEther("10"),
        zeroAddress,
        0,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        0,
        { value: ethers.utils.parseEther("0.20") }
      )
      ).to.be.reverted;

      //Insufficient funds to start
      await expect(launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        ethers.utils.parseEther("10"),
        70,
        ethers.utils.parseEther("10"),
        zeroAddress,
        0,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        0,
        { value: ethers.utils.parseEther("0.19") }
      )
      ).to.be.reverted;
    })

    it("can start a presale by paying fee", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));



      await presaleToken.mint(user1.address, ethers.utils.parseEther("27"));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther("27"));

      await launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        ethers.utils.parseEther("10"),
        70,
        ethers.utils.parseEther("10"),
        zeroAddress,
        1,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        1,
        { value: ethers.utils.parseEther("0.20") }
      )

      const presaleCount = await launchpad.presaleCount();
      expect(presaleCount).to.be.equal(1);

      const pressaleAddress = await launchpad.presaleRecordByID(presaleCount);
      const pressaleAddress2 = await launchpad.presaleRecordByToken(presaleToken.address);

      expect(pressaleAddress).to.be.equal(pressaleAddress2);

      const presale_factory = await ethers.getContractFactory("Presale");
      presale = await presale_factory.attach(pressaleAddress);

      // await presale.connect(user1).setAddresses(
      //   factory.address, router.address, WBNBAddr.address, teamAddr.address, devAddr.address, lpLockerManager.address)

      expect(await presale.owner()).to.be.equal(user1.address);
      expect(await presale.preSaleStatus()).to.be.equal(0);

      await network.provider.send("evm_increaseTime", [15 * OneMinute + OneMinute])
      await network.provider.send("evm_mine")

      expect(await presale.preSaleStatus()).to.be.equal(0);

      await presale.connect(user2).buyTokensOnPresale(ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });
      await presale.connect(user3).buyTokensOnPresale(ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });
      await presale.connect(user4).buyTokensOnPresale(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });

      const p2 = await presale.participant(user2.address);
      expect(p2.tokens).to.be.equal(ethers.utils.parseEther("2"))
      expect(p2.value).to.be.equal(ethers.utils.parseEther("2"))

      const p3 = await presale.participant(user3.address);
      expect(p3.tokens).to.be.equal(ethers.utils.parseEther("2"))
      expect(p3.value).to.be.equal(ethers.utils.parseEther("2"))

      const p4 = await presale.participant(user4.address);
      expect(p4.tokens).to.be.equal(ethers.utils.parseEther("1"))
      expect(p4.value).to.be.equal(ethers.utils.parseEther("1"))

      expect(await presale.preSaleStatus()).to.be.equal(1);
      await expect(presale.connect(user1).finalizePresale()).to.be.reverted;

      await network.provider.send("evm_increaseTime", [OneDay])
      await network.provider.send("evm_mine")

      await expect(presale.connect(user4).buyTokensOnPresale(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") }))
        .to.be.reverted;

      await presale.connect(user1).finalizePresale();
      expect(await presale.preSaleStatus()).to.be.equal(2);

      expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("0"));
      await presale.connect(user2).claimTokensOrARefund();
      expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("2"));

      expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("0"))
      await presale.connect(user3).claimTokensOrARefund();
      expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("2"))

      expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther("0"))
      await presale.connect(user4).claimTokensOrARefund();
      expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther("1"))

      const pairaddress = await factory.getPair(presaleToken.address, WBNBAddr.address);
      const UniswapV2Pair: UniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
      uniswapV2Pair = await UniswapV2Pair.attach(pairaddress);

      const internalData = await presale.internalData();
      const presaleInfo = await presale.presaleInfo();

      // console.log("Extra tokens ", ethers.utils.formatEther(String(internalData.extraTokens)));
      // console.log("tokenForLocker ", ethers.utils.formatEther(String(presaleInfo.tokenForLocker)));

      // console.log("Token balance of owner", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));
      // console.log("Token balance of launchpad", ethers.utils.formatEther(String(await presaleToken.balanceOf(launchpad.address))));
      // console.log("Token balance of presale contract", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));

      // console.log("LP balance of owner", ethers.utils.formatEther(String(await uniswapV2Pair.balanceOf(user1.address))));
      // console.log("LP balance of presale contract", ethers.utils.formatEther(String(await uniswapV2Pair.balanceOf(presale.address))));


      await presale.connect(user1).withdrawExtraTokens();

      // console.log("Token balance of owner after extra token withdraw", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));
      // console.log("Token balance of presale contract after extra token withdraw", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));


      await expect(presale.connect(user1).unlockLPTokens()).to.be.reverted;

      await network.provider.send("evm_increaseTime", [6 * OneDay])
      await network.provider.send("evm_mine")

      await presale.connect(user1).unlockLPTokens();

      // console.log("LP balance of owner after unlockLPTokens", ethers.utils.formatEther(String(await uniswapV2Pair.balanceOf(user1.address))));
      // console.log("LP balance of presale contract after unlockLPTokens", ethers.utils.formatEther(String(await uniswapV2Pair.balanceOf(presale.address))));

      await expect(presale.connect(user1).unlockTokens()).to.be.reverted;

      await network.provider.send("evm_increaseTime", [3 * OneDay])
      await network.provider.send("evm_mine")

      await presale.connect(user1).unlockTokens();

      // console.log("Token balance of owner after unlockTokens", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));
      // console.log("Token balance of presale contract after unlockTokens", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));


    });

    it("Owner can change the sale type at any moment of the sale", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));


      await presaleToken.mint(user1.address, ethers.utils.parseEther("27"));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther("27"));

      await launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        ethers.utils.parseEther("10"),
        70,
        ethers.utils.parseEther("10"),
        zeroAddress,
        1,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        0,
        { value: ethers.utils.parseEther("0.20") }
      )

      const presaleCount = await launchpad.presaleCount();
      expect(presaleCount).to.be.equal(1);

      const pressaleAddress = await launchpad.presaleRecordByToken(presaleToken.address);

      const presale_factory = await ethers.getContractFactory("Presale");
      presale = await presale_factory.attach(pressaleAddress);

      const presaleInfo = await presale.presaleInfo();
      expect(presaleInfo.typeOfPresale).to.be.equal(0);

      await network.provider.send("evm_increaseTime", [15 * OneMinute + OneMinute])
      await network.provider.send("evm_mine")

      await presale.connect(user2).buyTokensOnPresale(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });


      await presale.connect(user1).chageSaleType(1, zeroAddress, 0);

      await expect(presale.connect(user3).buyTokensOnPresale(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") })).to.be.reverted;
      await presale.connect(user1).whiteListUsers([user3.address, user6.address]);
      await presale.connect(user3).buyTokensOnPresale(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });
      await presale.connect(user3).buyTokensOnPresale(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });

      await presale.connect(user1).chageSaleType(2, criteriaToken.address, ethers.utils.parseEther("200"));

      await expect(presale.connect(user4).buyTokensOnPresale(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") })).to.be.reverted;
      await criteriaToken.mint(user3.address, ethers.utils.parseEther("100"))
      await expect(presale.connect(user4).buyTokensOnPresale(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") })).to.be.reverted;
      await criteriaToken.mint(user3.address, ethers.utils.parseEther("100"))
      await presale.connect(user3).buyTokensOnPresale(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });


      await presale.connect(user1).chageSaleType(0, zeroAddress, 0);
      await presale.connect(user5).buyTokensOnPresale(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });


      await presale.connect(user1).chageSaleType(1, zeroAddress, 0);

      await expect(presale.connect(user2).buyTokensOnPresale(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") })).to.be.reverted;
      await expect(presale.connect(user4).buyTokensOnPresale(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") })).to.be.reverted;
      await expect(presale.connect(user5).buyTokensOnPresale(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") })).to.be.reverted;

    });

    it("can finalize a successfull sale, users can claim their tokens ", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      await presaleToken.mint(user1.address, ethers.utils.parseEther("27"));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther("27"));

      await launchpad.connect(user1).createPresale(
        0,
        presaleToken.address,
        ethers.utils.parseEther("10"),
        70,
        ethers.utils.parseEther("10"),
        zeroAddress,
        1,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("5")
        },
        0,
        { value: ethers.utils.parseEther("0.20") }
      )

      const presaleCount = await launchpad.presaleCount();
      expect(presaleCount).to.be.equal(1);

      const pressaleAddress = await launchpad.presaleRecordByID(presaleCount);
      const pressaleAddress2 = await launchpad.presaleRecordByToken(presaleToken.address);

      expect(pressaleAddress).to.be.equal(pressaleAddress2);

      const presale_factory = await ethers.getContractFactory("Presale");
      presale = await presale_factory.attach(pressaleAddress);

      expect(await presale.owner()).to.be.equal(user1.address);
      expect(await presale.preSaleStatus()).to.be.equal(0);

      await network.provider.send("evm_increaseTime", [15 * OneMinute + OneMinute])
      await network.provider.send("evm_mine")

      expect(await presale.preSaleStatus()).to.be.equal(0);

      await presale.connect(user2).buyTokensOnPresale(ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });
      await presale.connect(user3).buyTokensOnPresale(ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });
      await presale.connect(user4).buyTokensOnPresale(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });

      const p2 = await presale.participant(user2.address);
      expect(p2.tokens).to.be.equal(ethers.utils.parseEther("2"))
      expect(p2.value).to.be.equal(ethers.utils.parseEther("2"))

      const p3 = await presale.participant(user3.address);
      expect(p3.tokens).to.be.equal(ethers.utils.parseEther("2"))
      expect(p3.value).to.be.equal(ethers.utils.parseEther("2"))

      const p4 = await presale.participant(user4.address);
      expect(p4.tokens).to.be.equal(ethers.utils.parseEther("1"))
      expect(p4.value).to.be.equal(ethers.utils.parseEther("1"))

      expect(await presale.preSaleStatus()).to.be.equal(1);
      await expect(presale.connect(user1).finalizePresale()).to.be.reverted;

      await network.provider.send("evm_increaseTime", [OneDay])
      await network.provider.send("evm_mine")

      await expect(presale.connect(user4).buyTokensOnPresale(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") }))
        .to.be.reverted;

      await presale.connect(user1).finalizePresale();
      expect(await presale.preSaleStatus()).to.be.equal(2);

      expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("0"));
      await presale.connect(user2).claimTokensOrARefund();
      expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("2"));

      expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("0"))
      await presale.connect(user3).claimTokensOrARefund();
      expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("2"))

      expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther("0"))
      await presale.connect(user4).claimTokensOrARefund();
      expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther("1"))

    });

    it("can finalize a unsuccessful sale, users can claim their refund and owner can withdraw all tokens ", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      await presaleToken.mint(user1.address, ethers.utils.parseEther("27"));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther("27"));

      await launchpad.connect(user1).createPresale (
        0,
        presaleToken.address,
        ethers.utils.parseEther("10"),
        70,
        ethers.utils.parseEther("10"),
        zeroAddress,
        1,
        0,
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
          lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
          tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
        },
        {
          minTokensReq: ethers.utils.parseEther("1"),
          maxTokensReq: ethers.utils.parseEther("3"),
          softCap: ethers.utils.parseEther("9")
        },
        1,
        { value: ethers.utils.parseEther("0.20") }
      )

      const presaleCount = await launchpad.presaleCount();
      expect(presaleCount).to.be.equal(1);

      const pressaleAddress = await launchpad.presaleRecordByID(presaleCount);
      const pressaleAddress2 = await launchpad.presaleRecordByToken(presaleToken.address);

      expect(pressaleAddress).to.be.equal(pressaleAddress2);

      const presale_factory = await ethers.getContractFactory("Presale");
      presale = await presale_factory.attach(pressaleAddress);

      expect(await presale.owner()).to.be.equal(user1.address);
      expect(await presale.preSaleStatus()).to.be.equal(0);

      await network.provider.send("evm_increaseTime", [15 * OneMinute + OneMinute])
      await network.provider.send("evm_mine")

      expect(await presale.preSaleStatus()).to.be.equal(0);

      await presale.connect(user2).buyTokensOnPresale(ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });
      await presale.connect(user3).buyTokensOnPresale(ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });
      await presale.connect(user4).buyTokensOnPresale(ethers.utils.parseEther("2"), { value: ethers.utils.parseEther("2") });

      const p2 = await presale.participant(user2.address);
      expect(p2.tokens).to.be.equal(ethers.utils.parseEther("2"))
      expect(p2.value).to.be.equal(ethers.utils.parseEther("2"))

      const p3 = await presale.participant(user3.address);
      expect(p3.tokens).to.be.equal(ethers.utils.parseEther("2"))
      expect(p3.value).to.be.equal(ethers.utils.parseEther("2"))

      const p4 = await presale.participant(user4.address);
      expect(p4.tokens).to.be.equal(ethers.utils.parseEther("2"))
      expect(p4.value).to.be.equal(ethers.utils.parseEther("2"))

      expect(await presale.preSaleStatus()).to.be.equal(1);
      await expect(presale.connect(user1).finalizePresale()).to.be.reverted;

      await network.provider.send("evm_increaseTime", [OneDay])
      await network.provider.send("evm_mine")

      await expect(presale.connect(user4).buyTokensOnPresale(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") }))
        .to.be.reverted;

      await presale.connect(user1).finalizePresale();
      expect(await presale.preSaleStatus()).to.be.equal(3);

      expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("0"));
      
      await expect(()=> presale.connect(user2).claimTokensOrARefund()).to.changeEtherBalance(user2, ethers.utils.parseEther("2"))
      
      expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("0"));

      expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("0"))
      
      await expect(()=> presale.connect(user3).claimTokensOrARefund()).to.changeEtherBalance(user3, ethers.utils.parseEther("2"))
      
      expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("0"))

      expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther("0"))

      await expect(()=> presale.connect(user4).claimTokensOrARefund()).to.changeEtherBalance(user4, ethers.utils.parseEther("2"))
      
      expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther("0"))


      expect(await presaleToken.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther("0"))
      await presale.connect(user1).withdrawExtraTokens();
      expect(await presaleToken.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther("27"))

      // await expect(presale.)


    });


  });

})


