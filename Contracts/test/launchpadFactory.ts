const { time } = require('@openzeppelin/test-helpers');
import { expect } from 'chai';
// const { ethers, waffle } = require("hardhat");
import { ethers, waffle } from "hardhat";
const provider = waffle.provider;
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { BigNumber } from "ethers";
import { network } from "hardhat";
import { Launchpadv2, Launchpadv2__factory, LPLokcerManager, LPLokcerManager__factory, Presale, PresaleToken, PresaleToken__factory, UniswapV2Factory, UniswapV2Factory__factory, UniswapV2Pair, UniswapV2Pair__factory, UniswapV2Router02, UniswapV2Router02__factory, WETH9, WETH9__factory } from "../typechain";

let deployer: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress, user3: SignerWithAddress, user4: SignerWithAddress, user5: SignerWithAddress, user6: SignerWithAddress, user7: SignerWithAddress, user8: SignerWithAddress, teamAddr: SignerWithAddress, devAddr: SignerWithAddress
let launchpad: Launchpadv2, presale: Presale, presaleToken: PresaleToken, criteriaToken: PresaleToken, WBNBAddr: WETH9

let factory: UniswapV2Factory, router: UniswapV2Router02, uniswapV2Pair: UniswapV2Pair;
// let lpLockerManager: LPLokcerManager;

const zeroAddress = "0x0000000000000000000000000000000000000000";
enum PresaleType { PUBLIC, WHITELISTED, TOKENHOLDERS }
enum PreSaleStatus { PENDING, INPROGRESS, SUCCEED, FAILED }
enum RefundType { BURN, WITHDRAW }

const overrides = {
  gasLimit: 9999999
}

// let latestBlock = await ethers.provider.getBlock("latest")
// latestBlock.timestamp
// await network.provider.send("evm_increaseTime", [Number(time.duration.days(1))])
// await network.provider.send("evm_mine")

describe("PICNIC Launchpad Stack", () => {

  beforeEach(async () => {

    [deployer, user1, user2, user3, user4, user5, user6, user7, user8, teamAddr, devAddr] = await ethers.getSigners();

    const UniswapV2Factory: UniswapV2Factory__factory = await ethers.getContractFactory("UniswapV2Factory");
    const UniswapV2Pair: UniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
    const UniswapV2Router02: UniswapV2Router02__factory = await ethers.getContractFactory('UniswapV2Router02');
    const WBNB: WETH9__factory = await ethers.getContractFactory('WETH9');
    const PresaleToken: PresaleToken__factory = await ethers.getContractFactory('PresaleToken');
    const Launchpad: Launchpadv2__factory = await ethers.getContractFactory("Launchpadv2");

    presaleToken = await PresaleToken.deploy();
    criteriaToken = await PresaleToken.deploy();
    factory = await UniswapV2Factory.deploy(deployer.address);
    WBNBAddr = await WBNB.deploy();
    router = await UniswapV2Router02.deploy(factory.address, WBNBAddr.address, overrides);

    launchpad = await Launchpad.deploy(router.address, teamAddr.address, devAddr.address);

  });

  it("Deployement", async () => {
    expect(launchpad.address).to.be.properAddress;
  })

  describe("As master ", async () => {

    // it("should be able to update the overall fees", async () => {

    //   const Upfrontfee = await launchpad.upfrontfee(); // 100;
    //   const fee = await launchpad.salesFeeInPercent(); // = 2;

    //   expect(Upfrontfee).to.be.equal(ethers.utils.parseEther("0.2"));
    //   expect(fee).to.be.equal(2);

    //   await launchpad.updateFees(ethers.utils.parseEther("0.3"), 3)

    //   const UpfrontfeeAfter = await launchpad.upfrontfee(); // 200;
    //   const feeAfter = await launchpad.salesFeeInPercent(); // = 3;

    //   expect(UpfrontfeeAfter).to.be.equal(ethers.utils.parseEther("0.3"));
    //   expect(feeAfter).to.be.equal(3);

    // });

    // it("should be able to whitelist users to start a free presale", async () => {

    //   await launchpad.whiteListUsersToStartProject([user1.address]);

    //   let latestBlock = await ethers.provider.getBlock("latest");
    //   const OneMinute = Number(await time.duration.minutes(1));
    //   const OneDay = Number(await time.duration.days(1));

    //   await presaleToken.mint(user1.address, ethers.utils.parseEther("270"));
    //   await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther("270"));

    //   await launchpad.connect(user1).createPresale(
    //     {
    //       preSaleToken: presaleToken.address,
    //       name: "ALI COIN",
    //       symbol: "ALI",
    //       decimals: 18
    //     },
    //     {
    //       tokensForSale: 100,                                          // 100
    //       tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 70
    //       tokensForLocker: 100
    //     },
    //     {
    //       typeOfPresale: PresaleType.PUBLIC,
    //       priceOfEachToken: ethers.utils.parseEther("0.001"),
    //       criteriaToken: zeroAddress,
    //       minTokensForParticipation: ethers.utils.parseEther("0"),
    //       refundType: RefundType.WITHDRAW
    //     },
    //     {
    //       startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
    //       expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
    //       lpLockupDuration: latestBlock.timestamp + 7 * OneDay + OneMinute,
    //       tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
    //     },
    //     {
    //       minTokensReq: 10,
    //       maxTokensReq: 20,
    //       softCap: 50
    //     },
    //     { value: ethers.utils.parseEther("0") }
    //   )


    //   const presaleCount = await launchpad.presaleCount();
    //   expect(presaleCount).to.be.equal(1);

    //   const pressaleAddress = await launchpad.presaleRecordByID(presaleCount);
    //   const pressaleAddress2 = await launchpad.presaleRecordByToken(presaleToken.address);

    //   expect(pressaleAddress).to.be.equal(pressaleAddress2);

    //   const presale_factory = await ethers.getContractFactory("Presale");
    //   presale = await presale_factory.attach(pressaleAddress);

    // });

    // it("himself can start a free presale", async () => {

    //   let latestBlock = await ethers.provider.getBlock("latest")
    //   const OneMinute = Number(await time.duration.minutes(1));
    //   const OneDay = Number(await time.duration.days(1));

    //   await presaleToken.mint(deployer.address, ethers.utils.parseEther("270"));
    //   await presaleToken.connect(deployer).approve(launchpad.address, ethers.utils.parseEther("270"));

    //   await launchpad.connect(deployer).createPresale(
    //     {
    //       preSaleToken: presaleToken.address,
    //       name: "ALI COIN",
    //       symbol: "ALI",
    //       decimals: 18
    //     },
    //     {
    //       tokensForSale: 100,                                          // 100
    //       tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 70
    //       tokensForLocker: 100
    //     },
    //     {
    //       typeOfPresale: PresaleType.PUBLIC,
    //       priceOfEachToken: ethers.utils.parseEther("0.001"),
    //       criteriaToken: zeroAddress,
    //       minTokensForParticipation: ethers.utils.parseEther("0"),
    //       refundType: RefundType.WITHDRAW
    //     },
    //     {
    //       startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
    //       expiredAt: latestBlock.timestamp + 1 * OneDay + OneMinute,
    //       lpLockupDuration: latestBlock.timestamp + 7 * OneDay + OneMinute,
    //       tokenLockupTime: latestBlock.timestamp + 10 * OneDay + OneMinute
    //     },
    //     {
    //       minTokensReq: 10,
    //       maxTokensReq: 20,
    //       softCap: 50
    //     },
    //     { value: ethers.utils.parseEther("0") }
    //   )

    //   const presaleCount = await launchpad.presaleCount();
    //   expect(presaleCount).to.be.equal(1);

    //   const pressaleAddress = await launchpad.presaleRecordByID(presaleCount);
    //   const pressaleAddress2 = await launchpad.presaleRecordByToken(presaleToken.address);

    //   expect(pressaleAddress).to.be.equal(pressaleAddress2);

    //   const presale_factory = await ethers.getContractFactory("Presale");
    //   presale = await presale_factory.attach(pressaleAddress);



    // });

  });

  const StratPresale = async () => {

    let latestBlock = await ethers.provider.getBlock("latest");
    const OneMinute = Number(await time.duration.minutes(1));
    const OneDay = Number(await time.duration.days(1));

    await presaleToken.mint(user1.address, ethers.utils.parseEther(String(8584726 + 1000000 * 1.7)));
    await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther(String(8584726 + 1000000 * 1.7)));

    await expect(launchpad.withdrawBNBs()).to.be.reverted;

    await launchpad.connect(user1).createPresale(
      {
        id: 0,
        presaleOwner: user1.address,
        preSaleStatus: 0,
        preSaleToken: presaleToken.address,
        decimals: 18
      },
      {
        tokensForSale: 100,                                          // 1000
        tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
        typeOfPresale: PresaleType.PUBLIC,
        priceOfEachToken: ethers.utils.parseEther("0.001"),
        criteriaToken: zeroAddress,
        minTokensForParticipation: ethers.utils.parseEther("0"),
        refundType: RefundType.BURN
      },
      {
        startedAt: latestBlock.timestamp + 15 * OneMinute,
        expiredAt: latestBlock.timestamp + 1 * OneDay,
        lpLockupDuration: 10 * OneMinute,
      },
      {
        minTokensReq: 10,
        maxTokensReq: 20,
        softCap: 50
      },
      {
        isEnabled: true,
        firstReleasePC: 20,
        vestingPeriodOfEachCycle: 10,
        tokensReleaseEachCyclePC: 10
      },
      {
        isEnabled: false,
        vestingTokens: 100,
        firstReleaseTime: 100,
        firstReleasePC: 50,
        vestingPeriodOfEachCycle: 100,
        tokensReleaseEachCyclePC: 10
      },
      {
        logoURL: "",
        websiteURL: "",
        twitterURL: "",
        telegramURL: "",
        discordURL: "",
        description: ""
      },
      { value: ethers.utils.parseEther("0.20") }

    )

    await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)

    const presaleCount = await launchpad.presaleCount();
    const pressaleAddress = await launchpad.presaleRecordByID(presaleCount);
    const presale_factory = await ethers.getContractFactory("Presale");
    presale = await presale_factory.attach(pressaleAddress);

    return presale;

  }

  describe("As a user ", async () => {

    it("can start a presale by paying fee", async () => {


      let latestBlock = await ethers.provider.getBlock("latest");
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      await presaleToken.mint(user1.address, ethers.utils.parseEther(String(100 * 1.7)));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther(String(100 * 1.7)));

      await expect(launchpad.withdrawBNBs()).to.be.reverted;
      await launchpad.connect(user1).createPresale(
        {
          id: 0,
          presaleOwner: user1.address,
          preSaleStatus: 0,
          preSaleToken: presaleToken.address,
          decimals: 18
        },
        {
          tokensForSale: 100,                                          // 1000
          tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
          typeOfPresale: PresaleType.PUBLIC,
          priceOfEachToken: ethers.utils.parseEther("0.001"),
          criteriaToken: zeroAddress,
          minTokensForParticipation: ethers.utils.parseEther("0"),
          refundType: RefundType.BURN
        },
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay,
          lpLockupDuration: 10 * OneMinute,
        },
        {
          minTokensReq: 10,
          maxTokensReq: 20,
          softCap: 50
        },
        {
          isEnabled: true,
          firstReleasePC: 20,
          vestingPeriodOfEachCycle: 10,
          tokensReleaseEachCyclePC: 10
        },
        {
          isEnabled: false,
          vestingTokens: 0,
          firstReleaseTime: 0,
          firstReleasePC: 0,
          vestingPeriodOfEachCycle: 0,
          tokensReleaseEachCyclePC: 0
        },
        {
          logoURL: "",
          websiteURL: "",
          twitterURL: "",
          telegramURL: "",
          discordURL: "",
          description: ""
        },
        { value: ethers.utils.parseEther("0.20") }

      )

      await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)

      const presaleCount = await launchpad.presaleCount();
      expect(presaleCount).to.be.equal(1);

      const pressaleAddress = await launchpad.presaleRecordByID(presaleCount);
      const pressaleAddress2 = await launchpad.getPresaleRecordsByToken(presaleToken.address);

      expect(pressaleAddress).to.be.equal(pressaleAddress2[0]);

      const presale_factory = await ethers.getContractFactory("Presale");
      presale = await presale_factory.attach(pressaleAddress);

      // expect(await presale.owner()).to.be.equal(user1.address);
      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

      await network.provider.send("evm_increaseTime", [15 * OneMinute])
      await network.provider.send("evm_mine");

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

      await presale.connect(user2).buyTokensOnPresale(20, { value: ethers.utils.parseEther(String(0.001 * 20)) });
      await presale.connect(user3).buyTokensOnPresale(20, { value: ethers.utils.parseEther(String(0.001 * 20)) });
      await presale.connect(user4).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) });

      const p2 = await presale.participant(user2.address);
      expect(p2.tokens).to.be.equal("20")
      expect(p2.value).to.be.equal(ethers.utils.parseEther(String(0.001 * 20)))

      const p3 = await presale.participant(user3.address);
      expect(p3.tokens).to.be.equal("20")
      expect(p3.value).to.be.equal(ethers.utils.parseEther(String(0.001 * 20)))

      const p4 = await presale.participant(user4.address);
      expect(p4.tokens).to.be.equal("10")
      expect(p4.value).to.be.equal(ethers.utils.parseEther(String(0.001 * 10)))

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(1);
      // await expect(presale.connect(user1).finalizePresale()).to.be.reverted;

      await network.provider.send("evm_increaseTime", [OneDay - 15 * OneMinute])
      await network.provider.send("evm_mine")

      await expect(presale.connect(user4).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) }))
        .to.be.reverted;

      await presale.connect(user1).finalizePresale();

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(2);

      {
        expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("0"));
        await presale.connect(user2).claimTokensOrARefund();
        await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2)));

        expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("0"));
        await presale.connect(user3).claimTokensOrARefund();
        await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2)));

        expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther("0"));
        await presale.connect(user4).claimTokensOrARefund();
        await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther(String(10 * 0.2)));
      }

      {

        await network.provider.send("evm_increaseTime", [10 * OneMinute])
        await network.provider.send("evm_mine")

        await presale.connect(user2).claimTokensOrARefund();
        await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 0.1)));

        await presale.connect(user3).claimTokensOrARefund();
        await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 0.1)));

        await presale.connect(user4).claimTokensOrARefund();
        await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther(String(10 * 0.2 + 10 * 0.8 * 0.1)));

      }

      {
        await network.provider.send("evm_increaseTime", [10 * OneMinute])
        await network.provider.send("evm_mine")

        await presale.connect(user2).claimTokensOrARefund();
        await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 0.2)));

        await presale.connect(user3).claimTokensOrARefund();
        await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 0.2)));

        await presale.connect(user4).claimTokensOrARefund();
        await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther(String(10 * 0.2 + 10 * 0.8 * 0.2)));
      }

      {
        await network.provider.send("evm_increaseTime", [40 * OneMinute])
        await network.provider.send("evm_mine")

        await presale.connect(user2).claimTokensOrARefund();
        await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 0.6)));

        await presale.connect(user3).claimTokensOrARefund();
        await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 0.6)));

        await presale.connect(user4).claimTokensOrARefund();
        await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther(String(10 * 0.2 + 10 * 0.8 * 0.6)));
      }

      {
        await network.provider.send("evm_increaseTime", [20 * OneMinute])
        await network.provider.send("evm_mine")

        await presale.connect(user2).claimTokensOrARefund();
        await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 0.8)));

        await presale.connect(user3).claimTokensOrARefund();
        await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 0.8)));

        await presale.connect(user4).claimTokensOrARefund();
        await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther(String(10 * 0.2 + 10 * 0.8 * 0.8)));

      }

      {
        await network.provider.send("evm_increaseTime", [20 * OneMinute])
        await network.provider.send("evm_mine")

        await presale.connect(user2).claimTokensOrARefund();
        await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 1)));

        await presale.connect(user3).claimTokensOrARefund();
        await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 1)));

        await presale.connect(user4).claimTokensOrARefund();
        await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther(String(10 * 0.2 + 10 * 0.8 * 1)));

      }

      {
        await network.provider.send("evm_increaseTime", [100 * OneMinute])
        await network.provider.send("evm_mine")
        await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
        await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
        await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
      }

      const pairaddress = await factory.getPair(presaleToken.address, WBNBAddr.address);
      const UniswapV2Pair: UniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
      uniswapV2Pair = await UniswapV2Pair.attach(pairaddress);

    });

    it("on seccessful presale, users can buy and claim their tokens according to contributors vesting period", async () => {


      let latestBlock = await ethers.provider.getBlock("latest");
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      await presaleToken.mint(user1.address, ethers.utils.parseEther(String(8584726 + 1000000 * 1.7)));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther(String(8584726 + 1000000 * 1.7)));

      await expect(launchpad.withdrawBNBs()).to.be.reverted;

      await launchpad.connect(user1).createPresale(
        {
          id: 0,
          presaleOwner: user1.address,
          preSaleStatus: 0,
          preSaleToken: presaleToken.address,
          decimals: 18
        },
        {
          tokensForSale: 100,                                          // 1000
          tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
          typeOfPresale: PresaleType.PUBLIC,
          priceOfEachToken: ethers.utils.parseEther("0.001"),
          criteriaToken: zeroAddress,
          minTokensForParticipation: ethers.utils.parseEther("0"),
          refundType: RefundType.BURN
        },
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay,
          lpLockupDuration: 10 * OneMinute,
        },
        {
          minTokensReq: 10,
          maxTokensReq: 20,
          softCap: 50
        },
        {
          isEnabled: true,
          firstReleasePC: 20,
          vestingPeriodOfEachCycle: 10,
          tokensReleaseEachCyclePC: 10
        },
        {
          isEnabled: false,
          vestingTokens: 100,
          firstReleaseTime: 100,
          firstReleasePC: 50,
          vestingPeriodOfEachCycle: 100,
          tokensReleaseEachCyclePC: 10
        },
        {
          logoURL: "",
          websiteURL: "",
          twitterURL: "",
          telegramURL: "",
          discordURL: "",
          description: ""
        },
        { value: ethers.utils.parseEther("0.20") }

      )

      await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)

      const presaleCount = await launchpad.presaleCount();
      expect(presaleCount).to.be.equal(1);

      const pressaleAddress = await launchpad.presaleRecordByID(presaleCount);
      const pressaleAddress2 = await launchpad.getPresaleRecordsByToken(presaleToken.address);

      expect(pressaleAddress).to.be.equal(pressaleAddress2[0]);

      const presale_factory = await ethers.getContractFactory("Presale");
      presale = await presale_factory.attach(pressaleAddress);

      // expect(await presale.owner()).to.be.equal(user1.address);
      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

      await network.provider.send("evm_increaseTime", [15 * OneMinute])
      await network.provider.send("evm_mine");

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

      await presale.connect(user2).buyTokensOnPresale(20, { value: ethers.utils.parseEther(String(0.001 * 20)) });
      await presale.connect(user3).buyTokensOnPresale(20, { value: ethers.utils.parseEther(String(0.001 * 20)) });
      await presale.connect(user4).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) });

      const p2 = await presale.participant(user2.address);
      expect(p2.tokens).to.be.equal("20")
      expect(p2.value).to.be.equal(ethers.utils.parseEther(String(0.001 * 20)))

      const p3 = await presale.participant(user3.address);
      expect(p3.tokens).to.be.equal("20")
      expect(p3.value).to.be.equal(ethers.utils.parseEther(String(0.001 * 20)))

      const p4 = await presale.participant(user4.address);
      expect(p4.tokens).to.be.equal("10")
      expect(p4.value).to.be.equal(ethers.utils.parseEther(String(0.001 * 10)))

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(1);

      await network.provider.send("evm_increaseTime", [OneDay - 15 * OneMinute])
      await network.provider.send("evm_mine")

      await expect(presale.connect(user4).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) }))
        .to.be.reverted;

      await presale.connect(user1).finalizePresale();

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(2);

      {
        expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("0"));
        await presale.connect(user2).claimTokensOrARefund();
        await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2)));

        expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("0"));
        await presale.connect(user3).claimTokensOrARefund();
        await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2)));

        expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther("0"));
        await presale.connect(user4).claimTokensOrARefund();
        await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther(String(10 * 0.2)));
      }

      {

        await network.provider.send("evm_increaseTime", [10 * OneMinute])
        await network.provider.send("evm_mine")

        await presale.connect(user2).claimTokensOrARefund();
        await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 0.1)));

        await presale.connect(user3).claimTokensOrARefund();
        await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 0.1)));

        await presale.connect(user4).claimTokensOrARefund();
        await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther(String(10 * 0.2 + 10 * 0.8 * 0.1)));

      }

      {
        await network.provider.send("evm_increaseTime", [10 * OneMinute])
        await network.provider.send("evm_mine")

        await presale.connect(user2).claimTokensOrARefund();
        await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 0.2)));

        await presale.connect(user3).claimTokensOrARefund();
        await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 0.2)));

        await presale.connect(user4).claimTokensOrARefund();
        await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther(String(10 * 0.2 + 10 * 0.8 * 0.2)));
      }

      {
        await network.provider.send("evm_increaseTime", [40 * OneMinute])
        await network.provider.send("evm_mine")

        await presale.connect(user2).claimTokensOrARefund();
        await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 0.6)));

        await presale.connect(user3).claimTokensOrARefund();
        await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 0.6)));

        await presale.connect(user4).claimTokensOrARefund();
        await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther(String(10 * 0.2 + 10 * 0.8 * 0.6)));
      }

      {
        await network.provider.send("evm_increaseTime", [20 * OneMinute])
        await network.provider.send("evm_mine")

        await presale.connect(user2).claimTokensOrARefund();
        await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 0.8)));

        await presale.connect(user3).claimTokensOrARefund();
        await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 0.8)));

        await presale.connect(user4).claimTokensOrARefund();
        await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther(String(10 * 0.2 + 10 * 0.8 * 0.8)));

      }

      {
        await network.provider.send("evm_increaseTime", [20 * OneMinute])
        await network.provider.send("evm_mine")

        await presale.connect(user2).claimTokensOrARefund();
        await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 1)));

        await presale.connect(user3).claimTokensOrARefund();
        await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther(String(20 * 0.2 + 20 * 0.8 * 1)));

        await presale.connect(user4).claimTokensOrARefund();
        await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther(String(10 * 0.2 + 10 * 0.8 * 1)));

      }

      {
        await network.provider.send("evm_increaseTime", [100 * OneMinute])
        await network.provider.send("evm_mine")
        await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
        await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
        await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;

      }


      const pairaddress = await factory.getPair(presaleToken.address, WBNBAddr.address);
      const UniswapV2Pair: UniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
      uniswapV2Pair = await UniswapV2Pair.attach(pairaddress);



    });

    it("on seccessful presale, users can buy and claim their tokens directily there is no contributors vesting", async () => {


      let latestBlock = await ethers.provider.getBlock("latest");
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      await presaleToken.mint(user1.address, ethers.utils.parseEther(String(8584726 + 1000000 * 1.7)));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther(String(8584726 + 1000000 * 1.7)));

      await expect(launchpad.withdrawBNBs()).to.be.reverted;

      await launchpad.connect(user1).createPresale(
        {
          id: 0,
          presaleOwner: user1.address,
          preSaleStatus: 0,
          preSaleToken: presaleToken.address,
          decimals: 18
        },
        {
          tokensForSale: 100,                                          // 1000
          tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
          typeOfPresale: PresaleType.PUBLIC,
          priceOfEachToken: ethers.utils.parseEther("0.001"),
          criteriaToken: zeroAddress,
          minTokensForParticipation: ethers.utils.parseEther("0"),
          refundType: RefundType.BURN
        },
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay,
          lpLockupDuration: 10 * OneMinute,
        },
        {
          minTokensReq: 10,
          maxTokensReq: 20,
          softCap: 50
        },
        {
          isEnabled: false,
          firstReleasePC: 0,
          vestingPeriodOfEachCycle: 0,
          tokensReleaseEachCyclePC: 0
        },
        {
          isEnabled: false,
          vestingTokens: 100,
          firstReleaseTime: 100,
          firstReleasePC: 50,
          vestingPeriodOfEachCycle: 100,
          tokensReleaseEachCyclePC: 10
        },
        {
          logoURL: "",
          websiteURL: "",
          twitterURL: "",
          telegramURL: "",
          discordURL: "",
          description: ""
        },
        { value: ethers.utils.parseEther("0.20") }

      )

      await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)

      const presaleCount = await launchpad.presaleCount();
      expect(presaleCount).to.be.equal(1);

      const pressaleAddress = await launchpad.presaleRecordByID(presaleCount);
      const pressaleAddress2 = await launchpad.getPresaleRecordsByToken(presaleToken.address);

      expect(pressaleAddress).to.be.equal(pressaleAddress2[0]);

      const presale_factory = await ethers.getContractFactory("Presale");
      presale = await presale_factory.attach(pressaleAddress);

      // expect(await presale.owner()).to.be.equal(user1.address);
      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

      await network.provider.send("evm_increaseTime", [15 * OneMinute])
      await network.provider.send("evm_mine");

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

      await presale.connect(user2).buyTokensOnPresale(20, { value: ethers.utils.parseEther(String(0.001 * 20)) });
      await presale.connect(user3).buyTokensOnPresale(20, { value: ethers.utils.parseEther(String(0.001 * 20)) });
      await presale.connect(user4).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) });

      const p2 = await presale.participant(user2.address);
      expect(p2.tokens).to.be.equal("20")
      expect(p2.value).to.be.equal(ethers.utils.parseEther(String(0.001 * 20)))

      const p3 = await presale.participant(user3.address);
      expect(p3.tokens).to.be.equal("20")
      expect(p3.value).to.be.equal(ethers.utils.parseEther(String(0.001 * 20)))

      const p4 = await presale.participant(user4.address);
      expect(p4.tokens).to.be.equal("10")
      expect(p4.value).to.be.equal(ethers.utils.parseEther(String(0.001 * 10)))

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(1);

      await network.provider.send("evm_increaseTime", [OneDay - 15 * OneMinute])
      await network.provider.send("evm_mine")

      await expect(presale.connect(user4).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) }))
        .to.be.reverted;

      await presale.connect(user1).finalizePresale();

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(2);


      expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther(String(0)));
      await presale.connect(user2).claimTokensOrARefund();
      await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
      expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther(String(20)));

      expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther(String(0)));
      await presale.connect(user3).claimTokensOrARefund();
      await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
      expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther(String(20)));

      expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther(String(0)));
      await presale.connect(user4).claimTokensOrARefund();
      await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
      expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther(String(10)));

      {
        await network.provider.send("evm_increaseTime", [100 * OneMinute])
        await network.provider.send("evm_mine")
        await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
        await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
        await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;

      }


      const pairaddress = await factory.getPair(presaleToken.address, WBNBAddr.address);
      const UniswapV2Pair: UniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
      uniswapV2Pair = await UniswapV2Pair.attach(pairaddress);



    });

    it("on unseccessful presale, users can buy and claim a refund ", async () => {


      let latestBlock = await ethers.provider.getBlock("latest");
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      await presaleToken.mint(user1.address, ethers.utils.parseEther(String(270)));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther(String(270)));

      await expect(launchpad.withdrawBNBs()).to.be.reverted;

      await launchpad.connect(user1).createPresale(
        {
          id: 0,
          presaleOwner: user1.address,
          preSaleStatus: 0,
          preSaleToken: presaleToken.address,
          decimals: 18
        },
        {
          tokensForSale: 100,                                          // 1000
          tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
          typeOfPresale: PresaleType.PUBLIC,
          priceOfEachToken: ethers.utils.parseEther("0.001"),
          criteriaToken: zeroAddress,
          minTokensForParticipation: ethers.utils.parseEther("0"),
          refundType: RefundType.BURN
        },
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay,
          lpLockupDuration: 10 * OneMinute,
        },
        {
          minTokensReq: 10,
          maxTokensReq: 20,
          softCap: 50
        },
        {
          isEnabled: true,
          firstReleasePC: 50,
          vestingPeriodOfEachCycle: 10,
          tokensReleaseEachCyclePC: 10
        },
        {
          isEnabled: false,
          vestingTokens: 100,
          firstReleaseTime: 100,
          firstReleasePC: 50,
          vestingPeriodOfEachCycle: 100,
          tokensReleaseEachCyclePC: 10
        },
        {
          logoURL: "",
          websiteURL: "",
          twitterURL: "",
          telegramURL: "",
          discordURL: "",
          description: ""
        },
        { value: ethers.utils.parseEther("0.20") }

      )

      const presaleCount = await launchpad.presaleCount();
      expect(presaleCount).to.be.equal(1);

      const pressaleAddress = await launchpad.presaleRecordByID(presaleCount);
      const presale_factory = await ethers.getContractFactory("Presale");
      presale = await presale_factory.attach(pressaleAddress);

      await network.provider.send("evm_increaseTime", [15 * OneMinute])
      await network.provider.send("evm_mine");

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

      await presale.connect(user2).buyTokensOnPresale(20, { value: ethers.utils.parseEther(String(0.001 * 20)) });
      await presale.connect(user3).buyTokensOnPresale(20, { value: ethers.utils.parseEther(String(0.001 * 20)) });
      // await presale.connect(user4).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) });

      const p2 = await presale.participant(user2.address);
      expect(p2.tokens).to.be.equal("20")
      expect(p2.value).to.be.equal(ethers.utils.parseEther(String(0.001 * 20)))

      const p3 = await presale.participant(user3.address);
      expect(p3.tokens).to.be.equal("20")
      expect(p3.value).to.be.equal(ethers.utils.parseEther(String(0.001 * 20)))

      const p4 = await presale.participant(user4.address);
      expect(p4.tokens).to.be.equal("0")
      expect(p4.value).to.be.equal(ethers.utils.parseEther(String(0.001 * 0)))

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(1);

      await network.provider.send("evm_increaseTime", [OneDay - 15 * OneMinute])
      await network.provider.send("evm_mine")

      await expect(presale.connect(user4).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) }))
        .to.be.reverted;

      // console.log("Eth balance of presale", ethers.utils.formatEther(String(await provider.getBalance(presale.address))))


      await presale.connect(user1).finalizePresale();

      // console.log("Eth balance of presale", ethers.utils.formatEther(String(await provider.getBalance(presale.address))))


      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(3);

      {
        expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("0"));
        await expect(() => presale.connect(user2).claimTokensOrARefund())
          .to.changeEtherBalances([user2, presale], [ethers.utils.parseEther(String(0.001 * 20)), ethers.utils.parseEther(String(-0.001 * 20))])
        await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("0"));

        expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("0"));
        await expect(() => presale.connect(user3).claimTokensOrARefund())
          .to.changeEtherBalances([user3, presale], [ethers.utils.parseEther(String(0.001 * 20)), ethers.utils.parseEther(String(-0.001 * 20))])
        await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("0"));

        expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther("0"));
        await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
        expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("0"));
      }

      // console.log("Eth balance of presale", ethers.utils.formatEther(String(await provider.getBalance(presale.address))))

      {
        await network.provider.send("evm_increaseTime", [100 * OneMinute])
        await network.provider.send("evm_mine")
        await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
        await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
        await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;

      }


    });

    it("on seccessful presale, with team vesting at 100% initial release works as expected, ", async () => {


      let latestBlock = await ethers.provider.getBlock("latest");
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      await presaleToken.mint(user1.address, ethers.utils.parseEther(String(8584726 + 1000000 * 1.7)));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther(String(8584726 + 1000000 * 1.7)));

      await expect(launchpad.withdrawBNBs()).to.be.reverted;

      await launchpad.connect(user1).createPresale(
        {
          id: 0,
          presaleOwner: user1.address,
          preSaleStatus: 0,
          preSaleToken: presaleToken.address,
          decimals: 18
        },
        {
          tokensForSale: 100,                                          // 1000
          tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
          typeOfPresale: PresaleType.PUBLIC,
          priceOfEachToken: ethers.utils.parseEther("0.001"),
          criteriaToken: zeroAddress,
          minTokensForParticipation: ethers.utils.parseEther("0"),
          refundType: RefundType.BURN
        },
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay,
          lpLockupDuration: 10 * OneMinute,
        },
        {
          minTokensReq: 10,
          maxTokensReq: 20,
          softCap: 50
        },
        {
          isEnabled: true,
          firstReleasePC: 20,
          vestingPeriodOfEachCycle: 10,
          tokensReleaseEachCyclePC: 10
        },
        {
          isEnabled: true,
          vestingTokens: 100,
          firstReleaseTime: 10,
          firstReleasePC: 100,
          vestingPeriodOfEachCycle: 0,
          tokensReleaseEachCyclePC: 0
        },
        {
          logoURL: "",
          websiteURL: "",
          twitterURL: "",
          telegramURL: "",
          discordURL: "",
          description: ""
        },
        { value: ethers.utils.parseEther("0.20") }

      )

      await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)

      const presaleCount = await launchpad.presaleCount();
      expect(presaleCount).to.be.equal(1);

      const pressaleAddress = await launchpad.presaleRecordByID(presaleCount);
      const pressaleAddress2 = await launchpad.getPresaleRecordsByToken(presaleToken.address);

      expect(pressaleAddress).to.be.equal(pressaleAddress2[0]);

      const presale_factory = await ethers.getContractFactory("Presale");
      presale = await presale_factory.attach(pressaleAddress);

      // expect(await presale.owner()).to.be.equal(user1.address);
      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

      await network.provider.send("evm_increaseTime", [15 * OneMinute])
      await network.provider.send("evm_mine");

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

      await presale.connect(user2).buyTokensOnPresale(20, { value: ethers.utils.parseEther(String(0.001 * 20)) });
      await presale.connect(user3).buyTokensOnPresale(20, { value: ethers.utils.parseEther(String(0.001 * 20)) });
      await presale.connect(user4).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) });

      await network.provider.send("evm_increaseTime", [OneDay - 15 * OneMinute])
      await network.provider.send("evm_mine")

      // console.log("Token balance of contract", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));
      // console.log("Token balance of user1", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));

      await presale.connect(user1).finalizePresale();

      // console.log("Token balance of contract", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));
      // console.log("Token balance of user1", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(2);

      await expect(presale.connect(user1).unlockTokens()).to.be.reverted;

      await network.provider.send("evm_increaseTime", [10 * OneMinute])
      await network.provider.send("evm_mine")

      await presale.connect(user1).unlockTokens();

      // console.log("Token balance of contract", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));
      // console.log("Token balance of user1", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));

      // const pairaddress = await factory.getPair(presaleToken.address, WBNBAddr.address);
      // const UniswapV2Pair: UniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
      // uniswapV2Pair = await UniswapV2Pair.attach(pairaddress);

      // console.log("cycle initially", (await presale.teamVestingRecord(0)).cycle)
      // console.log("tokens initially", (await presale.teamVestingRecord(0)).tokens)
      // console.log("releaseTime initially", (await presale.teamVestingRecord(0)).releaseTime)
      // console.log("percentageToRelease initially", (await presale.teamVestingRecord(0)).percentageToRelease)
      // console.log("releaseStatus initially", (await presale.teamVestingRecord(0)).releaseStatus)
      // console.log("Block timestamp ", (await ethers.provider.getBlock("latest")).timestamp)

      // latestBlock = await ethers.provider.getBlock("latest");
      // console.log("releaseTime initially", (await presale.teamVestingRecord(0)).releaseTime)

      // console.log("Token balance of contract", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));

      // await presale.connect(user1).unlockTokens()

      // console.log("releaseTime 1", (await presale.teamVestingRecord(1)).releaseTime)
      // await presale.connect(user1).unlockTokens()
      // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;


      // await network.provider.send("evm_increaseTime", [100*OneMinute])
      // await network.provider.send("evm_mine")
      // console.log("releaseTime 2", (await presale.teamVestingRecord(2)).releaseTime)
      // await presale.connect(user1).unlockTokens()
      // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;

      // await network.provider.send("evm_increaseTime", [10*OneMinute])
      // await network.provider.send("evm_mine")
      // console.log("releaseTime 2", (await presale.teamVestingRecord(2)).releaseTime)
      // await presale.connect(user1).unlockTokens()
      // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;

      // await network.provider.send("evm_increaseTime", [10*OneMinute])
      // await network.provider.send("evm_mine")
      // console.log("releaseTime 2", (await presale.teamVestingRecord(2)).releaseTime)
      // await presale.connect(user1).unlockTokens()
      // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;


      // await network.provider.send("evm_increaseTime", [2000*OneMinute])
      // await network.provider.send("evm_mine")
      // console.log("releaseTime 2", (await presale.teamVestingRecord(2)).releaseTime)
      // await presale.connect(user1).unlockTokens()
      // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;

      // await network.provider.send("evm_increaseTime", [110*OneMinute])
      // await network.provider.send("evm_mine")
      // console.log("Token balance of contract", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));
      // console.log("releaseTime 2", (await presale.teamVestingRecord(2)).releaseTime)
      // await presale.connect(user1).unlockTokens()
      // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;



      // console.log("releaseTime initially", (await presale.teamVestingRecord(0)).releaseTime)
      // console.log("releaseStatus initially", (await presale.teamVestingRecord(0)).releaseStatus)
      // console.log("Block timestamp ", (await ethers.provider.getBlock("latest")).timestamp)
      // await presale.connect(user1).unlockLPTokens()
      // console.log("releaseTime initially", (await presale.teamVestingRecord(0)).releaseTime)
      // console.log("releaseStatus initially", (await presale.teamVestingRecord(0)).releaseStatus)
      // console.log("Block timestamp ", (await ethers.provider.getBlock("latest")).timestamp)

      // const tokenomics = await presale.tokenomics();

      // console.log("Extra tokens ", ethers.utils.formatEther(String(internalData.extraTokens)));
      // console.log("tokenForLocker ", ethers.utils.formatEther(String(tokenomics.tokensForLocker)));

      // console.log("Token balance of owner", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));
      // console.log("Token balance of launchpad", ethers.utils.formatEther(String(await presaleToken.balanceOf(launchpad.address))));
      // console.log("Token balance of presale contract", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));

      // console.log("LP balance of owner", ethers.utils.formatEther(String(await uniswapV2Pair.balanceOf(user1.address))));
      // console.log("LP balance of presale contract", ethers.utils.formatEther(String(await uniswapV2Pair.balanceOf(presale.address))));


      // await presale.connect(user1).withdrawExtraTokens();

      // console.log("Token balance of owner after extra token withdraw", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));
      // console.log("Token balance of presale contract after extra token withdraw", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));


      // await network.provider.send("evm_increaseTime", [6 * OneDay])
      // await network.provider.send("evm_mine")
      // await presale.connect(user1).unlockLPTokens();
      // await expect(presale.connect(user1).unlockLPTokens()).to.be.reverted;

      // console.log("LP balance of owner after unlockLPTokens", ethers.utils.formatEther(String(await uniswapV2Pair.balanceOf(user1.address))));
      // console.log("LP balance of presale contract after unlockLPTokens", ethers.utils.formatEther(String(await uniswapV2Pair.balanceOf(presale.address))));


      // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
      // await network.provider.send("evm_increaseTime", [3 * OneDay])
      // await network.provider.send("evm_mine")
      // await presale.connect(user1).unlockTokens();
      // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;

      // console.log("Token balance of owner after unlockTokens", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));
      // console.log("Token balance of presale contract after unlockTokens", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));


    });

    it("on seccessful presale, with team vesting at less than 100% initial release works as expected, ", async () => {


      let latestBlock = await ethers.provider.getBlock("latest");
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));

      await presaleToken.mint(user1.address, ethers.utils.parseEther(String(320)));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther(String(320)));

      await expect(launchpad.withdrawBNBs()).to.be.reverted;

      await launchpad.connect(user1).createPresale(
        {
          id: 0,
          presaleOwner: user1.address,
          preSaleStatus: 0,
          preSaleToken: presaleToken.address,
          decimals: 18
        },
        {
          tokensForSale: 100,                                          // 1000
          tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
          typeOfPresale: PresaleType.PUBLIC,
          priceOfEachToken: ethers.utils.parseEther("0.001"),
          criteriaToken: zeroAddress,
          minTokensForParticipation: ethers.utils.parseEther("0"),
          refundType: RefundType.BURN
        },
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay,
          lpLockupDuration: 10 * OneMinute,
        },
        {
          minTokensReq: 10,
          maxTokensReq: 20,
          softCap: 50
        },
        {
          isEnabled: false,
          firstReleasePC: 20,
          vestingPeriodOfEachCycle: 10,
          tokensReleaseEachCyclePC: 10
        },
        {
          isEnabled: true,
          vestingTokens: 150,
          firstReleaseTime: 10,
          firstReleasePC: 50,
          vestingPeriodOfEachCycle: 10,
          tokensReleaseEachCyclePC: 5
        },
        {
          logoURL: "",
          websiteURL: "",
          twitterURL: "",
          telegramURL: "",
          discordURL: "",
          description: ""
        },
        { value: ethers.utils.parseEther("0.20") }

      )

      await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)

      const presaleCount = await launchpad.presaleCount();
      expect(presaleCount).to.be.equal(1);

      const pressaleAddress = await launchpad.presaleRecordByID(presaleCount);
      const pressaleAddress2 = await launchpad.getPresaleRecordsByToken(presaleToken.address);

      expect(pressaleAddress).to.be.equal(pressaleAddress2[0]);

      const presale_factory = await ethers.getContractFactory("Presale");
      presale = await presale_factory.attach(pressaleAddress);

      // expect(await presale.owner()).to.be.equal(user1.address);
      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

      await network.provider.send("evm_increaseTime", [15 * OneMinute])
      await network.provider.send("evm_mine");

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

      await presale.connect(user2).buyTokensOnPresale(20, { value: ethers.utils.parseEther(String(0.001 * 20)) });
      await presale.connect(user3).buyTokensOnPresale(20, { value: ethers.utils.parseEther(String(0.001 * 20)) });
      await presale.connect(user4).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) });

      await network.provider.send("evm_increaseTime", [OneDay - 15 * OneMinute])
      await network.provider.send("evm_mine")

      // console.log("Token balance of contract", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));
      // console.log("Token balance of user1", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));

      await presale.connect(user1).finalizePresale();

      // console.log("Token balance of contract", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));
      // console.log("Token balance of user1", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(2);

      await expect(presale.connect(user1).unlockTokens()).to.be.reverted;

      await network.provider.send("evm_increaseTime", [10 * OneMinute])
      await network.provider.send("evm_mine")
      // await presale.connect(user1).unlockTokens();
      // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;



      await network.provider.send("evm_increaseTime", [200 * OneMinute])
      await network.provider.send("evm_mine")
      await presale.connect(user1).unlockTokens();
      // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;

      // console.log("Token balance of contract", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));
      // console.log("Token balance of user1", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));

      // const pairaddress = await factory.getPair(presaleToken.address, WBNBAddr.address);
      // const UniswapV2Pair: UniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
      // uniswapV2Pair = await UniswapV2Pair.attach(pairaddress);

      // console.log("cycle initially", (await presale.teamVestingRecord(0)).cycle)
      // console.log("tokens initially", (await presale.teamVestingRecord(0)).tokens)
      // console.log("releaseTime initially", (await presale.teamVestingRecord(0)).releaseTime)
      // console.log("percentageToRelease initially", (await presale.teamVestingRecord(0)).percentageToRelease)
      // console.log("releaseStatus initially", (await presale.teamVestingRecord(0)).releaseStatus)
      // console.log("Block timestamp ", (await ethers.provider.getBlock("latest")).timestamp)

      // latestBlock = await ethers.provider.getBlock("latest");
      // console.log("releaseTime initially", (await presale.teamVestingRecord(0)).releaseTime)

      // console.log("Token balance of contract", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));

      // await presale.connect(user1).unlockTokens()

      // console.log("releaseTime 1", (await presale.teamVestingRecord(1)).releaseTime)
      // await presale.connect(user1).unlockTokens()
      // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;


      // await network.provider.send("evm_increaseTime", [100*OneMinute])
      // await network.provider.send("evm_mine")
      // console.log("releaseTime 2", (await presale.teamVestingRecord(2)).releaseTime)
      // await presale.connect(user1).unlockTokens()
      // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;

      // await network.provider.send("evm_increaseTime", [10*OneMinute])
      // await network.provider.send("evm_mine")
      // console.log("releaseTime 2", (await presale.teamVestingRecord(2)).releaseTime)
      // await presale.connect(user1).unlockTokens()
      // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;

      // await network.provider.send("evm_increaseTime", [10*OneMinute])
      // await network.provider.send("evm_mine")
      // console.log("releaseTime 2", (await presale.teamVestingRecord(2)).releaseTime)
      // await presale.connect(user1).unlockTokens()
      // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;


      // await network.provider.send("evm_increaseTime", [2000*OneMinute])
      // await network.provider.send("evm_mine")
      // console.log("releaseTime 2", (await presale.teamVestingRecord(2)).releaseTime)
      // await presale.connect(user1).unlockTokens()
      // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;

      // await network.provider.send("evm_increaseTime", [110*OneMinute])
      // await network.provider.send("evm_mine")
      // console.log("Token balance of contract", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));
      // console.log("releaseTime 2", (await presale.teamVestingRecord(2)).releaseTime)
      // await presale.connect(user1).unlockTokens()
      // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;



      // console.log("releaseTime initially", (await presale.teamVestingRecord(0)).releaseTime)
      // console.log("releaseStatus initially", (await presale.teamVestingRecord(0)).releaseStatus)
      // console.log("Block timestamp ", (await ethers.provider.getBlock("latest")).timestamp)
      // await presale.connect(user1).unlockLPTokens()
      // console.log("releaseTime initially", (await presale.teamVestingRecord(0)).releaseTime)
      // console.log("releaseStatus initially", (await presale.teamVestingRecord(0)).releaseStatus)
      // console.log("Block timestamp ", (await ethers.provider.getBlock("latest")).timestamp)

      // const tokenomics = await presale.tokenomics();

      // console.log("Extra tokens ", ethers.utils.formatEther(String(internalData.extraTokens)));
      // console.log("tokenForLocker ", ethers.utils.formatEther(String(tokenomics.tokensForLocker)));

      // console.log("Token balance of owner", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));
      // console.log("Token balance of launchpad", ethers.utils.formatEther(String(await presaleToken.balanceOf(launchpad.address))));
      // console.log("Token balance of presale contract", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));

      // console.log("LP balance of owner", ethers.utils.formatEther(String(await uniswapV2Pair.balanceOf(user1.address))));
      // console.log("LP balance of presale contract", ethers.utils.formatEther(String(await uniswapV2Pair.balanceOf(presale.address))));


      // await presale.connect(user1).withdrawExtraTokens();

      // console.log("Token balance of owner after extra token withdraw", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));
      // console.log("Token balance of presale contract after extra token withdraw", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));


      // await network.provider.send("evm_increaseTime", [6 * OneDay])
      // await network.provider.send("evm_mine")
      // await presale.connect(user1).unlockLPTokens();
      // await expect(presale.connect(user1).unlockLPTokens()).to.be.reverted;

      // console.log("LP balance of owner after unlockLPTokens", ethers.utils.formatEther(String(await uniswapV2Pair.balanceOf(user1.address))));
      // console.log("LP balance of presale contract after unlockLPTokens", ethers.utils.formatEther(String(await uniswapV2Pair.balanceOf(presale.address))));


      // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
      // await network.provider.send("evm_increaseTime", [3 * OneDay])
      // await network.provider.send("evm_mine")
      // await presale.connect(user1).unlockTokens();
      // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;

      // console.log("Token balance of owner after unlockTokens", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));
      // console.log("Token balance of presale contract after unlockTokens", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));


    });

    it("Owner can change the sale type at any moment of the sale", async () => {

      const OneMinute = Number(await time.duration.minutes(1));

      const presale = await StratPresale();

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

      await network.provider.send("evm_increaseTime", [15 * OneMinute])
      await network.provider.send("evm_mine")

      await presale.connect(user2).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) });

      await presale.connect(user1).chageSaleType(PresaleType.WHITELISTED, zeroAddress, 0);

      await expect(presale.connect(user3).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) })).to.be.reverted;
      await presale.connect(user1).whiteListUsers([user3.address, user6.address]);
      await presale.connect(user3).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) });

      await presale.connect(user1).chageSaleType(PresaleType.TOKENHOLDERS, criteriaToken.address, ethers.utils.parseEther("200"));

      await expect(presale.connect(user4).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) })).to.be.reverted;
      await criteriaToken.mint(user4.address, ethers.utils.parseEther("100"))
      await expect(presale.connect(user4).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) })).to.be.reverted;
      await criteriaToken.mint(user4.address, ethers.utils.parseEther("100"))
      await presale.connect(user4).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) });


      await presale.connect(user1).chageSaleType(PresaleType.PUBLIC, zeroAddress, 0);
      await presale.connect(user5).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) });


      await presale.connect(user1).chageSaleType(PresaleType.WHITELISTED, zeroAddress, 0);

      await expect(presale.connect(user2).buyTokensOnPresale(1, { value: ethers.utils.parseEther(String(0.001 * 10)) })).to.be.reverted;
      await expect(presale.connect(user4).buyTokensOnPresale(1, { value: ethers.utils.parseEther(String(0.001 * 10)) })).to.be.reverted;
      await expect(presale.connect(user5).buyTokensOnPresale(1, { value: ethers.utils.parseEther(String(0.001 * 10)) })).to.be.reverted;

    });

    it("Can't start a sale with wrong data provided", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneDay = Number(await time.duration.days(1));
      const OneMinute = Number(await time.duration.minutes(1));     

      //Presale project address can't be null
      await expect(
        launchpad.connect(user1).createPresale(
          {
            id: 0,
            presaleOwner: user1.address,
            preSaleStatus: 0,
            preSaleToken: zeroAddress,
            decimals: 18
          },
          {
            tokensForSale: 100,                                          // 1000
            tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
            typeOfPresale: PresaleType.PUBLIC,
            priceOfEachToken: ethers.utils.parseEther("0.001"),
            criteriaToken: zeroAddress,
            minTokensForParticipation: ethers.utils.parseEther("0"),
            refundType: RefundType.BURN
          },
          {
            startedAt: latestBlock.timestamp + 15 * OneMinute,
            expiredAt: latestBlock.timestamp + 1 * OneDay,
            lpLockupDuration: 10 * OneMinute,
          },
          {
            minTokensReq: 10,
            maxTokensReq: 20,
            softCap: 50
          },
          {
            isEnabled: true,
            firstReleasePC: 20,
            vestingPeriodOfEachCycle: 10,
            tokensReleaseEachCyclePC: 10
          },
          {
            isEnabled: false,
            vestingTokens: 100,
            firstReleaseTime: 100,
            firstReleasePC: 50,
            vestingPeriodOfEachCycle: 100,
            tokensReleaseEachCyclePC: 10
          },
          {
            logoURL: "",
            websiteURL: "",
            twitterURL: "",
            telegramURL: "",
            discordURL: "",
            description: ""
          },    
          { value: ethers.utils.parseEther("0.20") }
    
        )
      ).to.be.reverted;

      //criteria token project address can't be null
      await expect(
        launchpad.connect(user1).createPresale(
          {
            id: 0,
            presaleOwner: user1.address,
            preSaleStatus: 0,
            preSaleToken: zeroAddress,
            decimals: 18
          },
          {
            tokensForSale: 100,                                          // 1000
            tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
            typeOfPresale: PresaleType.TOKENHOLDERS,
            priceOfEachToken: ethers.utils.parseEther("0.001"),
            criteriaToken: zeroAddress,
            minTokensForParticipation: ethers.utils.parseEther("0"),
            refundType: RefundType.BURN
          },
          {
            startedAt: latestBlock.timestamp + 15 * OneMinute,
            expiredAt: latestBlock.timestamp + 1 * OneDay,
            lpLockupDuration: 10 * OneMinute,
          },
          {
            minTokensReq: 10,
            maxTokensReq: 20,
            softCap: 50
          },
          {
            isEnabled: true,
            firstReleasePC: 20,
            vestingPeriodOfEachCycle: 10,
            tokensReleaseEachCyclePC: 10
          },
          {
            isEnabled: false,
            vestingTokens: 100,
            firstReleaseTime: 100,
            firstReleasePC: 50,
            vestingPeriodOfEachCycle: 100,
            tokensReleaseEachCyclePC: 10
          },
          {
            logoURL: "",
            websiteURL: "",
            twitterURL: "",
            telegramURL: "",
            discordURL: "",
            description: ""
          },  
          { value: ethers.utils.parseEther("0.20") }
    
        )
      ).to.be.reverted;

      // liquidity should be at least 50% or more
      await expect(
        launchpad.connect(user1).createPresale(
          {
            id: 0,
            presaleOwner: user1.address,
            preSaleStatus: 0,
            preSaleToken: zeroAddress,
            decimals: 18
          },
          {
            tokensForSale: 100,                                          // 1000
            tokensPCForLP: 49,                                           // 70% = 0.7   =>   1700/1.7 = 700
            typeOfPresale: PresaleType.PUBLIC,
            priceOfEachToken: ethers.utils.parseEther("0.001"),
            criteriaToken: zeroAddress,
            minTokensForParticipation: ethers.utils.parseEther("0"),
            refundType: RefundType.BURN
          },
          {
            startedAt: latestBlock.timestamp + 15 * OneMinute,
            expiredAt: latestBlock.timestamp + 1 * OneDay,
            lpLockupDuration: 10 * OneMinute,
          },
          {
            minTokensReq: 10,
            maxTokensReq: 20,
            softCap: 50
          },
          {
            isEnabled: true,
            firstReleasePC: 20,
            vestingPeriodOfEachCycle: 10,
            tokensReleaseEachCyclePC: 10
          },
          {
            isEnabled: false,
            vestingTokens: 100,
            firstReleaseTime: 100,
            firstReleasePC: 50,
            vestingPeriodOfEachCycle: 100,
            tokensReleaseEachCyclePC: 10
          },
          {
            logoURL: "",
            websiteURL: "",
            twitterURL: "",
            telegramURL: "",
            discordURL: "",
            description: ""
          },  
          { value: ethers.utils.parseEther("0.20") }
    
        )
      ).to.be.reverted;

      // liquidity should be at least 50% or more
      await expect(
        launchpad.connect(user1).createPresale(
          {
            id: 0,
            presaleOwner: user1.address,
            preSaleStatus: 0,
            preSaleToken: zeroAddress,
            decimals: 18
          },
          {
            tokensForSale: 100,                                          // 1000
            tokensPCForLP: 100,                                           // 70% = 0.7   =>   1700/1.7 = 700
            typeOfPresale: PresaleType.PUBLIC,
            priceOfEachToken: ethers.utils.parseEther("0.001"),
            criteriaToken: zeroAddress,
            minTokensForParticipation: ethers.utils.parseEther("0"),
            refundType: RefundType.BURN
          },
          {
            startedAt: latestBlock.timestamp + 15 * OneMinute,
            expiredAt: latestBlock.timestamp + 1 * OneDay,
            lpLockupDuration: 10 * OneMinute,
          },
          {
            minTokensReq: 10,
            maxTokensReq: 20,
            softCap: 50
          },
          {
            isEnabled: true,
            firstReleasePC: 20,
            vestingPeriodOfEachCycle: 10,
            tokensReleaseEachCyclePC: 10
          },
          {
            isEnabled: false,
            vestingTokens: 100,
            firstReleaseTime: 100,
            firstReleasePC: 50,
            vestingPeriodOfEachCycle: 100,
            tokensReleaseEachCyclePC: 10
          },
          {
            logoURL: "",
            websiteURL: "",
            twitterURL: "",
            telegramURL: "",
            discordURL: "",
            description: ""
          },  
          { value: ethers.utils.parseEther("0.20") }
    
        )
      ).to.be.reverted;

      // softcap should be at least 50% or more
      await expect(
        launchpad.connect(user1).createPresale(
          {
            id: 0,
            presaleOwner: user1.address,
            preSaleStatus: 0,
            preSaleToken: zeroAddress,
            decimals: 18
          },
          {
            tokensForSale: 100,                                          // 1000
            tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
            typeOfPresale: PresaleType.PUBLIC,
            priceOfEachToken: ethers.utils.parseEther("0.001"),
            criteriaToken: zeroAddress,
            minTokensForParticipation: ethers.utils.parseEther("0"),
            refundType: RefundType.BURN
          },
          {
            startedAt: latestBlock.timestamp + 15 * OneMinute,
            expiredAt: latestBlock.timestamp + 1 * OneDay,
            lpLockupDuration: 10 * OneMinute,
          },
          {
            minTokensReq: 10,
            maxTokensReq: 20,
            softCap: 49
          },
          {
            isEnabled: true,
            firstReleasePC: 20,
            vestingPeriodOfEachCycle: 10,
            tokensReleaseEachCyclePC: 10
          },
          {
            isEnabled: false,
            vestingTokens: 100,
            firstReleaseTime: 100,
            firstReleasePC: 50,
            vestingPeriodOfEachCycle: 100,
            tokensReleaseEachCyclePC: 10
          },
          {
            logoURL: "",
            websiteURL: "",
            twitterURL: "",
            telegramURL: "",
            discordURL: "",
            description: ""
          },  
          { value: ethers.utils.parseEther("0.20") }
    
        )
      ).to.be.reverted;

      //tokens for sale must be more than 0
      await expect(
        launchpad.connect(user1).createPresale(
          {
            id: 0,
            presaleOwner: user1.address,
            preSaleStatus: 0,
            preSaleToken: zeroAddress,
            decimals: 18
          },
          {
            tokensForSale: 0,                                          // 1000
            tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
            typeOfPresale: PresaleType.PUBLIC,
            priceOfEachToken: ethers.utils.parseEther("0.001"),
            criteriaToken: zeroAddress,
            minTokensForParticipation: ethers.utils.parseEther("0"),
            refundType: RefundType.BURN
          },
          {
            startedAt: latestBlock.timestamp + 15 * OneMinute,
            expiredAt: latestBlock.timestamp + 1 * OneDay,
            lpLockupDuration: 10 * OneMinute,
          },
          {
            minTokensReq: 10,
            maxTokensReq: 20,
            softCap: 50
          },
          {
            isEnabled: true,
            firstReleasePC: 20,
            vestingPeriodOfEachCycle: 10,
            tokensReleaseEachCyclePC: 10
          },
          {
            isEnabled: false,
            vestingTokens: 100,
            firstReleaseTime: 100,
            firstReleasePC: 50,
            vestingPeriodOfEachCycle: 100,
            tokensReleaseEachCyclePC: 10
          },
          {
            logoURL: "",
            websiteURL: "",
            twitterURL: "",
            telegramURL: "",
            discordURL: "",
            description: ""
          },  
          { value: ethers.utils.parseEther("0.20") }
    
        )
      ).to.be.reverted;

      //_minTokensReq should be more than zero
      await expect(
        launchpad.connect(user1).createPresale(
          {
            id: 0,
            presaleOwner: user1.address,
            preSaleStatus: 0,
            preSaleToken: zeroAddress,
            decimals: 18
          },
          {
            tokensForSale: 100,                                          // 1000
            tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
            typeOfPresale: PresaleType.PUBLIC,
            priceOfEachToken: ethers.utils.parseEther("0.001"),
            criteriaToken: zeroAddress,
            minTokensForParticipation: ethers.utils.parseEther("0"),
            refundType: RefundType.BURN
          },
          {
            startedAt: latestBlock.timestamp + 15 * OneMinute,
            expiredAt: latestBlock.timestamp + 1 * OneDay,
            lpLockupDuration: 10 * OneMinute,
          },
          {
            minTokensReq: 0,
            maxTokensReq: 20,
            softCap: 50
          },
          {
            isEnabled: true,
            firstReleasePC: 20,
            vestingPeriodOfEachCycle: 10,
            tokensReleaseEachCyclePC: 10
          },
          {
            isEnabled: false,
            vestingTokens: 100,
            firstReleaseTime: 100,
            firstReleasePC: 50,
            vestingPeriodOfEachCycle: 100,
            tokensReleaseEachCyclePC: 10
          },
          {
            logoURL: "",
            websiteURL: "",
            twitterURL: "",
            telegramURL: "",
            discordURL: "",
            description: ""
          },  
          { value: ethers.utils.parseEther("0.20") }
    
        )
      ).to.be.reverted;


      //_maxTokensReq > _minTokensReq
      await expect(
        launchpad.connect(user1).createPresale(
          {
            id: 0,
            presaleOwner: user1.address,
            preSaleStatus: 0,
            preSaleToken: zeroAddress,
            decimals: 18
          },
          {
            tokensForSale: 100,                                          // 1000
            tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
            typeOfPresale: PresaleType.PUBLIC,
            priceOfEachToken: ethers.utils.parseEther("0.001"),
            criteriaToken: zeroAddress,
            minTokensForParticipation: ethers.utils.parseEther("0"),
            refundType: RefundType.BURN
          },
          {
            startedAt: latestBlock.timestamp + 15 * OneMinute,
            expiredAt: latestBlock.timestamp + 1 * OneDay,
            lpLockupDuration: 10 * OneMinute,
          },
          {
            minTokensReq: 30,
            maxTokensReq: 20,
            softCap: 50
          },
          {
            isEnabled: true,
            firstReleasePC: 20,
            vestingPeriodOfEachCycle: 10,
            tokensReleaseEachCyclePC: 10
          },
          {
            isEnabled: false,
            vestingTokens: 100,
            firstReleaseTime: 100,
            firstReleasePC: 50,
            vestingPeriodOfEachCycle: 100,
            tokensReleaseEachCyclePC: 10
          },
          {
            logoURL: "",
            websiteURL: "",
            twitterURL: "",
            telegramURL: "",
            discordURL: "",
            description: ""
          },  
          { value: ethers.utils.parseEther("0.20") }
    
        )
      ).to.be.reverted;

      //_priceOfEachToken should be more than zero
      await expect(
        launchpad.connect(user1).createPresale(
          {
            id: 0,
            presaleOwner: user1.address,
            preSaleStatus: 0,
            preSaleToken: zeroAddress,
            decimals: 18
          },
          {
            tokensForSale: 100,                                          // 1000
            tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
            typeOfPresale: PresaleType.PUBLIC,
            priceOfEachToken: ethers.utils.parseEther("0.0"),
            criteriaToken: zeroAddress,
            minTokensForParticipation: ethers.utils.parseEther("0"),
            refundType: RefundType.BURN
          },
          {
            startedAt: latestBlock.timestamp + 15 * OneMinute,
            expiredAt: latestBlock.timestamp + 1 * OneDay,
            lpLockupDuration: 10 * OneMinute,
          },
          {
            minTokensReq: 10,
            maxTokensReq: 20,
            softCap: 50
          },
          {
            isEnabled: true,
            firstReleasePC: 20,
            vestingPeriodOfEachCycle: 10,
            tokensReleaseEachCyclePC: 10
          },
          {
            isEnabled: false,
            vestingTokens: 100,
            firstReleaseTime: 100,
            firstReleasePC: 50,
            vestingPeriodOfEachCycle: 100,
            tokensReleaseEachCyclePC: 10
          },
          {
            logoURL: "",
            websiteURL: "",
            twitterURL: "",
            telegramURL: "",
            discordURL: "",
            description: ""
          },  
          { value: ethers.utils.parseEther("0.20") }
    
        )
      ).to.be.reverted;

      // Unable to transfer presale tokens to the contract
      await expect(
        launchpad.connect(user1).createPresale(
          {
            id: 0,
            presaleOwner: user1.address,
            preSaleStatus: 0,
            preSaleToken: zeroAddress,
            decimals: 18
          },
          {
            tokensForSale: 100,                                          // 1000
            tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
            typeOfPresale: PresaleType.PUBLIC,
            priceOfEachToken: ethers.utils.parseEther("0.001"),
            criteriaToken: zeroAddress,
            minTokensForParticipation: ethers.utils.parseEther("0"),
            refundType: RefundType.BURN
          },
          {
            startedAt: latestBlock.timestamp + 15 * OneMinute,
            expiredAt: latestBlock.timestamp + 1 * OneDay,
            lpLockupDuration: 10 * OneMinute,
          },
          {
            minTokensReq: 10,
            maxTokensReq: 20,
            softCap: 50
          },
          {
            isEnabled: true,
            firstReleasePC: 20,
            vestingPeriodOfEachCycle: 10,
            tokensReleaseEachCyclePC: 10
          },
          {
            isEnabled: false,
            vestingTokens: 100,
            firstReleaseTime: 100,
            firstReleasePC: 50,
            vestingPeriodOfEachCycle: 100,
            tokensReleaseEachCyclePC: 10
          },
          {
            logoURL: "",
            websiteURL: "",
            twitterURL: "",
            telegramURL: "",
            discordURL: "",
            description: ""
          },  
          { value: ethers.utils.parseEther("0.20") }
    
        )
      ).to.be.reverted;

      // Insufficient funds to start
      await expect(
        launchpad.connect(user1).createPresale(
          {
            id: 0,
            presaleOwner: user1.address,
            preSaleStatus: 0,
            preSaleToken: zeroAddress,
            decimals: 18
          },
          {
            tokensForSale: 100,                                          // 1000
            tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
            typeOfPresale: PresaleType.PUBLIC,
            priceOfEachToken: ethers.utils.parseEther("0.001"),
            criteriaToken: zeroAddress,
            minTokensForParticipation: ethers.utils.parseEther("0"),
            refundType: RefundType.BURN
          },
          {
            startedAt: latestBlock.timestamp + 15 * OneMinute,
            expiredAt: latestBlock.timestamp + 1 * OneDay,
            lpLockupDuration: 10 * OneMinute,
          },
          {
            minTokensReq: 10,
            maxTokensReq: 20,
            softCap: 50
          },
          {
            isEnabled: true,
            firstReleasePC: 20,
            vestingPeriodOfEachCycle: 10,
            tokensReleaseEachCyclePC: 10
          },
          {
            isEnabled: false,
            vestingTokens: 100,
            firstReleaseTime: 100,
            firstReleasePC: 50,
            vestingPeriodOfEachCycle: 100,
            tokensReleaseEachCyclePC: 10
          },
          {
            logoURL: "",
            websiteURL: "",
            twitterURL: "",
            telegramURL: "",
            discordURL: "",
            description: ""
          },  
          { value: ethers.utils.parseEther("0.19") }
    
        )
      ).to.be.reverted;


    })

    it("Whitelisting works properly ", async () => {

      const OneDay = Number(await time.duration.days(1));
      const OneMinute = Number(await time.duration.minutes(1));
      const presale = await StratPresale();

      await network.provider.send("evm_increaseTime", [15 * OneMinute + OneMinute]);
      await network.provider.send("evm_mine");

      await presale.connect(user1).chageSaleType(PresaleType.WHITELISTED, zeroAddress, 0);
      await presale.connect(user1).whiteListUsers([user2.address, user3.address, user4.address, user5.address, user6.address]);
      expect((await presale.getWhiteListUsers())[0] ).to.be.equal(user2.address);
      expect((await presale.getWhiteListUsers())[1] ).to.be.equal(user3.address);
      expect((await presale.getWhiteListUsers())[2] ).to.be.equal(user4.address);
      expect((await presale.getWhiteListUsers())[3] ).to.be.equal(user5.address);
      expect((await presale.getWhiteListUsers())[4] ).to.be.equal(user6.address);
      // await expect((await presale.getWhiteListUsers())[5] ).to.be.reverted;

      await presale.connect(user1).removeWhiteListUsers([user5.address, user6.address]);

      await presale.connect(user1).whiteListUsers([user2.address, user3.address, user4.address]);
      expect((await presale.getWhiteListUsers())[0] ).to.be.equal(user2.address);
      expect((await presale.getWhiteListUsers())[1] ).to.be.equal(user3.address);
      expect((await presale.getWhiteListUsers())[2] ).to.be.equal(user4.address);
      // await expect((await presale.getWhiteListUsers())[3] ).to.be.reverted;

    
      await presale.connect(user2).buyTokensOnPresale(20, { value: ethers.utils.parseEther(String(0.001 * 20)) });
      await presale.connect(user3).buyTokensOnPresale(20, { value: ethers.utils.parseEther(String(0.001 * 20)) });
      await presale.connect(user4).buyTokensOnPresale(20, { value: ethers.utils.parseEther(String(0.001 * 20)) });

      await network.provider.send("evm_increaseTime", [2 * OneDay]);
      await network.provider.send("evm_mine");

      await presale.connect(user1).finalizePresale();
      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(2);

      expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("0"));
      await presale.connect(user2).claimTokensOrARefund();
      expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("20"));

      expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("0"));
      await presale.connect(user3).claimTokensOrARefund();
      expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("20"));

      expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther("0"));
      await presale.connect(user4).claimTokensOrARefund();
      expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther("20"));

    });

    it("emergencyWithdraw works properly ", async () => {

      const OneDay = Number(await time.duration.days(1));
      const OneMinute = Number(await time.duration.minutes(1));
      const presale = await StratPresale();

      await network.provider.send("evm_increaseTime", [15 * OneMinute + OneMinute]);
      await network.provider.send("evm_mine");

      // expect(await presale.owner()).to.be.equal(user1.address);
      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

      await presale.connect(user2).buyTokensOnPresale(20, { value: ethers.utils.parseEther(String(0.001 * 20)) });
      await presale.connect(user3).buyTokensOnPresale(20, { value: ethers.utils.parseEther(String(0.001 * 20)) });
      await presale.connect(user4).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) });

      expect((await presale.presaleCounts()).contributors).to.be.equal(3);
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(50);
      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0.001 * 50)));

      let p2 = await presale.participant(user2.address);
      expect(p2.tokens).to.be.equal("20")
      expect(p2.value).to.be.equal(ethers.utils.parseEther(String(0.001 * 20)))

      let p3 = await presale.participant(user3.address);
      expect(p3.tokens).to.be.equal("20")
      expect(p3.value).to.be.equal(ethers.utils.parseEther(String(0.001 * 20)))

      let p4 = await presale.participant(user4.address);
      expect(p4.tokens).to.be.equal("10")
      expect(p4.value).to.be.equal(ethers.utils.parseEther(String(0.001 * 10)))

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(1);


      await expect(() => presale.connect(user2).emergencyWithdraw()).to.changeEtherBalance(user2, ethers.utils.parseEther(String(0.001 * 20 * 0.95)))
      await expect(() => presale.connect(user3).emergencyWithdraw()).to.changeEtherBalance(user3, ethers.utils.parseEther(String(0.001 * 20 * 0.95)))
      await expect(() => presale.connect(user4).emergencyWithdraw()).to.changeEtherBalance(user4, ethers.utils.parseEther(String(0.001 * 10 * 0.95)))


      expect((await presale.presaleCounts()).contributors).to.be.equal(0);
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(100);
      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0)));

      p2 = await presale.participant(user2.address);
      expect(p2.tokens).to.be.equal("0")
      expect(p2.value).to.be.equal("0");

      p3 = await presale.participant(user3.address);
      expect(p3.tokens).to.be.equal("0")
      expect(p3.value).to.be.equal("0");

      p4 = await presale.participant(user4.address);
      expect(p4.tokens).to.be.equal("0")
      expect(p4.value).to.be.equal("0");

    });

    it("Successful presale", async () => {

      let latestBlock = await ethers.provider.getBlock("latest");
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));
  
      await presaleToken.mint(user1.address, ethers.utils.parseEther(String(500_000 + 2_000_000 * 1.7)));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther(String(500_000 + 2_000_000 * 1.7)));
  
      await expect(launchpad.withdrawBNBs()).to.be.reverted;
  
      await launchpad.connect(user1).createPresale(
        {
          id: 0,
          presaleOwner: user1.address,
          preSaleStatus: 0,
          preSaleToken: presaleToken.address,
          decimals: 18
        },
        {
          tokensForSale: 2_000_000,                                          // 1000
          tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
          typeOfPresale: PresaleType.PUBLIC,
          priceOfEachToken: ethers.utils.parseEther("0.0001"),
          criteriaToken: zeroAddress,
          minTokensForParticipation: ethers.utils.parseEther("0"),
          refundType: RefundType.WITHDRAW
        },
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay,
          lpLockupDuration: 10 * OneMinute,
        },
        {
          minTokensReq: 100_000,
          maxTokensReq: 200_000,
          softCap: 1_000_000
        },
        {
          isEnabled: false,
          firstReleasePC: 20,
          vestingPeriodOfEachCycle: 10,
          tokensReleaseEachCyclePC: 10
        },
        {
          isEnabled: true,
          vestingTokens: 500_000,
          firstReleaseTime: 10,
          firstReleasePC: 50,
          vestingPeriodOfEachCycle: 10,
          tokensReleaseEachCyclePC: 10
        },
        {
          logoURL: "",
          websiteURL: "",
          twitterURL: "",
          telegramURL: "",
          discordURL: "",
          description: ""
        },  
        { value: ethers.utils.parseEther("0.20") }
  
      )
  
      await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)
  
      const presaleCount = await launchpad.presaleCount();
      const pressaleAddress = await launchpad.presaleRecordByID(presaleCount);
      const presale_factory = await ethers.getContractFactory("Presale");
      presale = await presale_factory.attach(pressaleAddress);

      await network.provider.send("evm_increaseTime", [15*OneMinute]);
      await network.provider.send("evm_mine")

      // user2, user3, user4 are buying 200_000 tokens each
      await presale.connect(user2).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user3).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user4).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });

      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0.0001 * 300_000)))
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(2_000_000 - 300_000)
      expect((await presale.presaleCounts()).contributors).to.be.equal(3)

      // user2, user3, user4 are buying 200_000 tokens each again
      await presale.connect(user2).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user3).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user4).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });

      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0.0001 * 600_000)))
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(2_000_000 - 600_000)
      expect((await presale.presaleCounts()).contributors).to.be.equal(3)

      // user5, user6, user7 are buying 200_000 tokens each
      await presale.connect(user5).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user6).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user7).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });

      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0.0001 * 900_000)))
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(2_000_000 - 900_000)
      expect((await presale.presaleCounts()).contributors).to.be.equal(6)


      // user2, user3 are withdrwaing their funds
      await expect(() => presale.connect(user2).emergencyWithdraw()).to.be.changeEtherBalances(
        [presale, launchpad, user2],
        [
          ethers.utils.parseEther(String(-0.0001 * 200_000 * 1)),
          ethers.utils.parseEther(String(0.0001 * 200_000 * 0.05)),
          ethers.utils.parseEther(String(0.0001 * 200_000 * 0.95)),
        ]
      )

      await expect(() => presale.connect(user3).emergencyWithdraw()).to.be.changeEtherBalances(
        [presale, launchpad, user3],
        [
          ethers.utils.parseEther(String(-0.0001 * 200_000 * 1)),
          ethers.utils.parseEther(String(0.0001 * 200_000 * 0.05)),
          ethers.utils.parseEther(String(0.0001 * 200_000 * 0.95)),
        ]
      )

      await expect(() => presale.connect(user4).emergencyWithdraw()).to.be.changeEtherBalances(
        [presale, launchpad, user4],
        [
          ethers.utils.parseEther(String(-0.0001 * 200_000 * 1)),
          ethers.utils.parseEther(String(0.0001 * 200_000 * 0.05)),
          ethers.utils.parseEther(String(0.0001 * 200_000 * 0.95)),
        ]
      )
      
      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0.0001 * 300_000)))
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(2_000_000 - 300_000)
      expect((await presale.presaleCounts()).contributors).to.be.equal(3)
      // console.log(await presale.getContributorsList());


      // user2, user3, user4, user5, user6, are buying 200_000 tokens each again
      await presale.connect(user2).buyTokensOnPresale(200_000, { value: ethers.utils.parseEther(String(0.0001 * 200_000)) });
      await presale.connect(user3).buyTokensOnPresale(200_000, { value: ethers.utils.parseEther(String(0.0001 * 200_000)) });
      await presale.connect(user4).buyTokensOnPresale(200_000, { value: ethers.utils.parseEther(String(0.0001 * 200_000)) });

      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0.0001 * 900_000)))
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(2_000_000 - 900_000)
      expect((await presale.presaleCounts()).contributors).to.be.equal(6)
      // console.log(await presale.getContributorsList());

      await presale.connect(user5).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user6).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user7).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });

      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0.0001 * 1_200_000)))
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(2_000_000 - 1_200_000)
      expect((await presale.presaleCounts()).contributors).to.be.equal(6)

      const p2 = await presale.participant(user2.address);
      expect(p2.tokens).to.be.equal(200_000)
      expect(p2.value).to.be.equal(ethers.utils.parseEther(String(0.0001 * 200_000)))

      const p3 = await presale.participant(user3.address);
      expect(p3.tokens).to.be.equal(200_000)
      expect(p3.value).to.be.equal(ethers.utils.parseEther(String(0.0001 * 200_000)))

      const p4 = await presale.participant(user4.address);
      expect(p4.tokens).to.be.equal(200_000)
      expect(p4.value).to.be.equal(ethers.utils.parseEther(String(0.0001 * 200_000)))

      const p5 = await presale.participant(user5.address);
      expect(p5.tokens).to.be.equal(200_000)
      expect(p5.value).to.be.equal(ethers.utils.parseEther(String(0.0001 * 200_000)))

      const p6 = await presale.participant(user6.address);
      expect(p6.tokens).to.be.equal(200_000)
      expect(p6.value).to.be.equal(ethers.utils.parseEther(String(0.0001 * 200_000)))

      let p7 = await presale.participant(user7.address);
      expect(p7.tokens).to.be.equal(200_000)
      expect(p7.value).to.be.equal(ethers.utils.parseEther(String(0.0001 * 200_000)))


      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0.0001 * 1_200_000)))
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(2_000_000 - 1_200_000)
      expect((await presale.presaleCounts()).contributors).to.be.equal(6)

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(1);

      await expect(presale.connect(user7).buyTokensOnPresale(200_000, { value: ethers.utils.parseEther(String(0.0001 * 200_000)) })).to.be.reverted;

      await network.provider.send("evm_increaseTime", [OneDay - 15*OneMinute])
      await network.provider.send("evm_mine")


      await expect(presale.connect(user2).finalizePresale()).to.be.reverted;
      await expect(() => presale.connect(user1).finalizePresale()).to.changeEtherBalances(
        [presale, user1, launchpad],
        [
          ethers.utils.parseEther(String(-0.0001 * 1_200_000 * 1)),
          ethers.utils.parseEther(String(0.0001 * 1_200_000 * 0.28)),
          ethers.utils.parseEther(String(0.0001 * 1_200_000 * 0.02))
        ]
      )
      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(2);
      expect(await provider.getBalance(presale.address)).to.be.equal(ethers.utils.parseEther("0"));
      expect(await presaleToken.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther(String( (2_000_000 - 1_200_000) * 1.7 )))
      // console.log(Number(await presaleToken.balanceOf(user1.address)));

      expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("0"));
      await presale.connect(user2).claimTokensOrARefund();
      await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
      expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("200000"));

      expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("0"))
      await presale.connect(user3).claimTokensOrARefund();
      await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
      expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("200000"))

      expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther("0"))
      await presale.connect(user4).claimTokensOrARefund();
      await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
      expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther("200000"))

      expect(await presaleToken.balanceOf(user5.address)).to.be.equal(ethers.utils.parseEther("0"));
      await presale.connect(user5).claimTokensOrARefund();
      await expect(presale.connect(user5).claimTokensOrARefund()).to.be.reverted;
      expect(await presaleToken.balanceOf(user5.address)).to.be.equal(ethers.utils.parseEther("200000"));

      expect(await presaleToken.balanceOf(user6.address)).to.be.equal(ethers.utils.parseEther("0"))
      await presale.connect(user6).claimTokensOrARefund();
      await expect(presale.connect(user6).claimTokensOrARefund()).to.be.reverted;
      expect(await presaleToken.balanceOf(user6.address)).to.be.equal(ethers.utils.parseEther("200000"))

      expect(await presaleToken.balanceOf(user7.address)).to.be.equal(ethers.utils.parseEther("0"))
      await presale.connect(user7).claimTokensOrARefund();
      await expect(presale.connect(user7).claimTokensOrARefund()).to.be.reverted;
      expect(await presaleToken.balanceOf(user7.address)).to.be.equal(ethers.utils.parseEther("200000"))


      expect((await presale.presaleCounts()).claimsCount).to.be.equal(6);

      const pairaddress = await factory.getPair(presaleToken.address, WBNBAddr.address);
      const UniswapV2Pair: UniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
      uniswapV2Pair = await UniswapV2Pair.attach(pairaddress);

      expect(await uniswapV2Pair.balanceOf(presale.address)).not.to.be.equal("0")
      expect(await uniswapV2Pair.balanceOf(user1.address)).to.be.equal("0")
      expect(await presaleToken.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther(String( (2_000_000 - 1_200_000) * 1.7)))
      
      await expect(presale.connect(user1).unlockLPTokens()).to.be.reverted;
      await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
      
      await network.provider.send("evm_increaseTime", [10*OneMinute]);
      await network.provider.send("evm_mine")
      
      await presale.connect(user1).unlockLPTokens();
      await expect(presale.connect(user1).unlockLPTokens()).to.be.reverted;
      
      await presale.connect(user1).unlockTokens();
      await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
      
      expect(await uniswapV2Pair.balanceOf(user1.address)).not.to.be.equal("0")
      expect(await uniswapV2Pair.balanceOf(presale.address)).to.be.equal("0")
      expect(await presaleToken.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther(String( (2_000_000 - 1_200_000) * 1.7 + 500_000*0.5 )))


      await network.provider.send("evm_increaseTime", [10*OneMinute]);
      await network.provider.send("evm_mine")
      await presale.connect(user1).unlockTokens();
      await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
      expect(await presaleToken.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther(String( (2_000_000 - 1_200_000) * 1.7 + 500_000*0.55 )))

      await network.provider.send("evm_increaseTime", [90*OneMinute]);
      await network.provider.send("evm_mine")
      await presale.connect(user1).unlockTokens();
      await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
      expect(await presaleToken.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther(String( (2_000_000 - 1_200_000) * 1.7 + 500_000*1 )))

      // Project completed

    });

    it("Unsuccessful presale", async () => {

      let latestBlock = await ethers.provider.getBlock("latest");
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));
  
      await presaleToken.mint(user1.address, ethers.utils.parseEther(String(500_000 + 2_000_000 * 1.7)));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther(String(500_000 + 2_000_000 * 1.7)));
  
      await expect(launchpad.withdrawBNBs()).to.be.reverted;
  
      await launchpad.connect(user1).createPresale(
        {
          id: 0,
          presaleOwner: user1.address,
          preSaleStatus: 0,
          preSaleToken: presaleToken.address,
          decimals: 18
        },
        {
          tokensForSale: 2_000_000,                                          // 1000
          tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
          typeOfPresale: PresaleType.PUBLIC,
          priceOfEachToken: ethers.utils.parseEther("0.0001"),
          criteriaToken: zeroAddress,
          minTokensForParticipation: ethers.utils.parseEther("0"),
          refundType: RefundType.WITHDRAW
        },
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay,
          lpLockupDuration: 10 * OneMinute,
        },
        {
          minTokensReq: 100_000,
          maxTokensReq: 200_000,
          softCap: 1_000_000
        },
        {
          isEnabled: false,
          firstReleasePC: 20,
          vestingPeriodOfEachCycle: 10,
          tokensReleaseEachCyclePC: 10
        },
        {
          isEnabled: true,
          vestingTokens: 500_000,
          firstReleaseTime: 10,
          firstReleasePC: 50,
          vestingPeriodOfEachCycle: 10,
          tokensReleaseEachCyclePC: 10
        },
        {
          logoURL: "",
          websiteURL: "",
          twitterURL: "",
          telegramURL: "",
          discordURL: "",
          description: ""
        },  
        { value: ethers.utils.parseEther("0.20") }
  
      )
  
      await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)
  
      const presaleCount = await launchpad.presaleCount();
      const pressaleAddress = await launchpad.presaleRecordByID(presaleCount);
      const presale_factory = await ethers.getContractFactory("Presale");
      presale = await presale_factory.attach(pressaleAddress);

      await network.provider.send("evm_increaseTime", [15*OneMinute]);
      await network.provider.send("evm_mine")

      // user2, user3, user4 are buying 200_000 tokens each
      await presale.connect(user2).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user3).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user4).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });

      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0.0001 * 300_000)))
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(2_000_000 - 300_000)
      expect((await presale.presaleCounts()).contributors).to.be.equal(3)

      // user5, user6, user7 are buying 200_000 tokens each
      await presale.connect(user5).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user6).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user7).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });

      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0.0001 * 600_000)))
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(2_000_000 - 600_000)
      expect((await presale.presaleCounts()).contributors).to.be.equal(6)

      const p2 = await presale.participant(user2.address);
      expect(p2.tokens).to.be.equal(100_000)
      expect(p2.value).to.be.equal(ethers.utils.parseEther(String(0.0001 * 100_000)))

      const p3 = await presale.participant(user3.address);
      expect(p3.tokens).to.be.equal(100_000)
      expect(p3.value).to.be.equal(ethers.utils.parseEther(String(0.0001 * 100_000)))

      const p4 = await presale.participant(user4.address);
      expect(p4.tokens).to.be.equal(100_000)
      expect(p4.value).to.be.equal(ethers.utils.parseEther(String(0.0001 * 100_000)))

      const p5 = await presale.participant(user5.address);
      expect(p5.tokens).to.be.equal(100_000)
      expect(p5.value).to.be.equal(ethers.utils.parseEther(String(0.0001 * 100_000)))

      const p6 = await presale.participant(user6.address);
      expect(p6.tokens).to.be.equal(100_000)
      expect(p6.value).to.be.equal(ethers.utils.parseEther(String(0.0001 * 100_000)))

      let p7 = await presale.participant(user7.address);
      expect(p7.tokens).to.be.equal(100_000)
      expect(p7.value).to.be.equal(ethers.utils.parseEther(String(0.0001 * 100_000)))


      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0.0001 * 600_000)))
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(2_000_000 - 600_000)
      expect((await presale.presaleCounts()).contributors).to.be.equal(6)

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(1);

      await network.provider.send("evm_increaseTime", [OneDay - 15*OneMinute])
      await network.provider.send("evm_mine")

      await expect(() => presale.connect(user1).finalizePresale()).to.changeEtherBalances(
        [presale, user1, launchpad],
        [
          ethers.utils.parseEther("0"),
          ethers.utils.parseEther("0"),
          ethers.utils.parseEther("0")
        ]
      )
      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(3);
      expect(await provider.getBalance(presale.address)).to.be.equal(ethers.utils.parseEther(String(0.0001 * 600_000)));
      expect(await presaleToken.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther(String( 500_000 + 2_000_000 * 1.7 )))


      await expect(() => presale.connect(user2).claimTokensOrARefund()).to.changeEtherBalances(
        [presale, user2],
        [
          ethers.utils.parseEther(String(-0.0001 * 100_000)),
          ethers.utils.parseEther(String(0.0001 * 100_000)),
        ]
      )
      await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
      expect((await presale.presaleCounts()).claimsCount).to.be.equal(1);


      await expect(() => presale.connect(user3).claimTokensOrARefund()).to.changeEtherBalances(
        [presale, user3],
        [
          ethers.utils.parseEther(String(-0.0001 * 100_000)),
          ethers.utils.parseEther(String(0.0001 * 100_000)),
        ]
      )
      await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
      expect((await presale.presaleCounts()).claimsCount).to.be.equal(2);


      await expect(() => presale.connect(user4).claimTokensOrARefund()).to.changeEtherBalances(
        [presale, user4],
        [
          ethers.utils.parseEther(String(-0.0001 * 100_000)),
          ethers.utils.parseEther(String(0.0001 * 100_000)),
        ]
      )
      await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
      expect((await presale.presaleCounts()).claimsCount).to.be.equal(3);


      await expect(() => presale.connect(user5).claimTokensOrARefund()).to.changeEtherBalances(
        [presale, user5],
        [
          ethers.utils.parseEther(String(-0.0001 * 100_000)),
          ethers.utils.parseEther(String(0.0001 * 100_000)),
        ]
      )
      await expect(presale.connect(user5).claimTokensOrARefund()).to.be.reverted;
      expect((await presale.presaleCounts()).claimsCount).to.be.equal(4);


      await expect(() => presale.connect(user6).claimTokensOrARefund()).to.changeEtherBalances(
        [presale, user6],
        [
          ethers.utils.parseEther(String(-0.0001 * 100_000)),
          ethers.utils.parseEther(String(0.0001 * 100_000)),
        ]
      )
      await expect(presale.connect(user6).claimTokensOrARefund()).to.be.reverted;
      expect((await presale.presaleCounts()).claimsCount).to.be.equal(5);


      await expect(() => presale.connect(user7).claimTokensOrARefund()).to.changeEtherBalances(
        [presale, user7],
        [
          ethers.utils.parseEther(String(-0.0001 * 100_000)),
          ethers.utils.parseEther(String(0.0001 * 100_000)),
        ]
      )
      await expect(presale.connect(user7).claimTokensOrARefund()).to.be.reverted;
      expect((await presale.presaleCounts()).claimsCount).to.be.equal(6);
      
      await expect(presale.connect(user1).unlockLPTokens()).to.be.reverted;
      await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
      
      await network.provider.send("evm_increaseTime", [100*OneMinute]);
      await network.provider.send("evm_mine")
      
      await expect(presale.connect(user1).unlockLPTokens()).to.be.reverted;
      await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
      
      // Project completed

    });
















    it("Successful presale", async () => {

      let latestBlock = await ethers.provider.getBlock("latest");
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));
  
      await presaleToken.mint(user1.address, ethers.utils.parseEther(String(500_000 + 2_000_000 * 1.7)));
      await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther(String(500_000 + 2_000_000 * 1.7)));
  
      await expect(launchpad.withdrawBNBs()).to.be.reverted;
  
      await launchpad.connect(user1).createPresale(
        {
          id: 0,
          presaleOwner: user1.address,
          preSaleStatus: 0,
          preSaleToken: presaleToken.address,
          decimals: 18
        },
        {
          tokensForSale: 2_000_000,                                          // 1000
          tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
          typeOfPresale: PresaleType.PUBLIC,
          priceOfEachToken: ethers.utils.parseEther("0.0001"),
          criteriaToken: zeroAddress,
          minTokensForParticipation: ethers.utils.parseEther("0"),
          refundType: RefundType.WITHDRAW
        },
        {
          startedAt: latestBlock.timestamp + 15 * OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay,
          lpLockupDuration: 10 * OneMinute,
        },
        {
          minTokensReq: 100_000,
          maxTokensReq: 200_000,
          softCap: 1_000_000
        },
        {
          isEnabled: false,
          firstReleasePC: 20,
          vestingPeriodOfEachCycle: 10,
          tokensReleaseEachCyclePC: 10
        },
        {
          isEnabled: true,
          vestingTokens: 500_000,
          firstReleaseTime: 10,
          firstReleasePC: 50,
          vestingPeriodOfEachCycle: 10,
          tokensReleaseEachCyclePC: 10
        },
        {
          logoURL: "",
          websiteURL: "",
          twitterURL: "",
          telegramURL: "",
          discordURL: "",
          description: ""
        },  

        { value: ethers.utils.parseEther("0.20") }
  
      )
  
      await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)
  
      const presaleCount = await launchpad.presaleCount();
      const pressaleAddress = await launchpad.presaleRecordByID(presaleCount);
      const presale_factory = await ethers.getContractFactory("Presale");
      presale = await presale_factory.attach(pressaleAddress);

      await network.provider.send("evm_increaseTime", [15*OneMinute]);
      await network.provider.send("evm_mine")

      // user2, user3, user4 are buying 200_000 tokens each
      await presale.connect(user2).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user3).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user4).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });

      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0.0001 * 300_000)))
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(2_000_000 - 300_000)
      expect((await presale.presaleCounts()).contributors).to.be.equal(3)

      // user2, user3, user4 are buying 200_000 tokens each again
      await presale.connect(user2).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user3).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user4).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });

      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0.0001 * 600_000)))
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(2_000_000 - 600_000)
      expect((await presale.presaleCounts()).contributors).to.be.equal(3)

      // user5, user6, user7 are buying 200_000 tokens each
      await presale.connect(user5).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user6).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user7).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });

      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0.0001 * 900_000)))
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(2_000_000 - 900_000)
      expect((await presale.presaleCounts()).contributors).to.be.equal(6)


      // user2, user3 are withdrwaing their funds
      await expect(() => presale.connect(user2).emergencyWithdraw()).to.be.changeEtherBalances(
        [presale, launchpad, user2],
        [
          ethers.utils.parseEther(String(-0.0001 * 200_000 * 1)),
          ethers.utils.parseEther(String(0.0001 * 200_000 * 0.05)),
          ethers.utils.parseEther(String(0.0001 * 200_000 * 0.95)),
        ]
      )

      await expect(() => presale.connect(user3).emergencyWithdraw()).to.be.changeEtherBalances(
        [presale, launchpad, user3],
        [
          ethers.utils.parseEther(String(-0.0001 * 200_000 * 1)),
          ethers.utils.parseEther(String(0.0001 * 200_000 * 0.05)),
          ethers.utils.parseEther(String(0.0001 * 200_000 * 0.95)),
        ]
      )

      await expect(() => presale.connect(user4).emergencyWithdraw()).to.be.changeEtherBalances(
        [presale, launchpad, user4],
        [
          ethers.utils.parseEther(String(-0.0001 * 200_000 * 1)),
          ethers.utils.parseEther(String(0.0001 * 200_000 * 0.05)),
          ethers.utils.parseEther(String(0.0001 * 200_000 * 0.95)),
        ]
      )
      
      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0.0001 * 300_000)))
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(2_000_000 - 300_000)
      expect((await presale.presaleCounts()).contributors).to.be.equal(3)


      // user2, user3, user4, user5, user6, are buying 200_000 tokens each again
      await presale.connect(user2).buyTokensOnPresale(200_000, { value: ethers.utils.parseEther(String(0.0001 * 200_000)) });
      await presale.connect(user3).buyTokensOnPresale(200_000, { value: ethers.utils.parseEther(String(0.0001 * 200_000)) });
      await presale.connect(user4).buyTokensOnPresale(200_000, { value: ethers.utils.parseEther(String(0.0001 * 200_000)) });

      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0.0001 * 900_000)))
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(2_000_000 - 900_000)
      expect((await presale.presaleCounts()).contributors).to.be.equal(6)


      await presale.connect(user5).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user6).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });
      await presale.connect(user7).buyTokensOnPresale(100_000, { value: ethers.utils.parseEther(String(0.0001 * 100_000)) });

      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0.0001 * 1_200_000)))
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(2_000_000 - 1_200_000)
      expect((await presale.presaleCounts()).contributors).to.be.equal(6)

      const p2 = await presale.participant(user2.address);
      expect(p2.tokens).to.be.equal(200_000)
      expect(p2.value).to.be.equal(ethers.utils.parseEther(String(0.0001 * 200_000)))

      const p3 = await presale.participant(user3.address);
      expect(p3.tokens).to.be.equal(200_000)
      expect(p3.value).to.be.equal(ethers.utils.parseEther(String(0.0001 * 200_000)))

      const p4 = await presale.participant(user4.address);
      expect(p4.tokens).to.be.equal(200_000)
      expect(p4.value).to.be.equal(ethers.utils.parseEther(String(0.0001 * 200_000)))

      const p5 = await presale.participant(user5.address);
      expect(p5.tokens).to.be.equal(200_000)
      expect(p5.value).to.be.equal(ethers.utils.parseEther(String(0.0001 * 200_000)))

      const p6 = await presale.participant(user6.address);
      expect(p6.tokens).to.be.equal(200_000)
      expect(p6.value).to.be.equal(ethers.utils.parseEther(String(0.0001 * 200_000)))

      let p7 = await presale.participant(user7.address);
      expect(p7.tokens).to.be.equal(200_000)
      expect(p7.value).to.be.equal(ethers.utils.parseEther(String(0.0001 * 200_000)))


      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther(String(0.0001 * 1_200_000)))
      expect((await presale.presaleCounts()).remainingTokensForSale).to.be.equal(2_000_000 - 1_200_000)
      expect((await presale.presaleCounts()).contributors).to.be.equal(6)

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(1);

      await expect(presale.connect(user7).buyTokensOnPresale(200_000, { value: ethers.utils.parseEther(String(0.0001 * 200_000)) })).to.be.reverted;

      await network.provider.send("evm_increaseTime", [OneDay - 15*OneMinute])
      await network.provider.send("evm_mine")


      await expect(presale.connect(user2).finalizePresale()).to.be.reverted;
      await expect(() => presale.connect(user1).finalizePresale()).to.changeEtherBalances(
        [presale, user1, launchpad],
        [
          ethers.utils.parseEther(String(-0.0001 * 1_200_000 * 1)),
          ethers.utils.parseEther(String(0.0001 * 1_200_000 * 0.28)),
          ethers.utils.parseEther(String(0.0001 * 1_200_000 * 0.02))
        ]
      )
      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(2);
      expect(await provider.getBalance(presale.address)).to.be.equal(ethers.utils.parseEther("0"));
      expect(await presaleToken.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther(String( (2_000_000 - 1_200_000) * 1.7 )))
      // console.log(Number(await presaleToken.balanceOf(user1.address)));

      expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("0"));
      await presale.connect(user2).claimTokensOrARefund();
      await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
      expect(await presaleToken.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("200000"));

      expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("0"))
      await presale.connect(user3).claimTokensOrARefund();
      await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
      expect(await presaleToken.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("200000"))

      expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther("0"))
      await presale.connect(user4).claimTokensOrARefund();
      await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
      expect(await presaleToken.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther("200000"))

      expect(await presaleToken.balanceOf(user5.address)).to.be.equal(ethers.utils.parseEther("0"));
      await presale.connect(user5).claimTokensOrARefund();
      await expect(presale.connect(user5).claimTokensOrARefund()).to.be.reverted;
      expect(await presaleToken.balanceOf(user5.address)).to.be.equal(ethers.utils.parseEther("200000"));

      expect(await presaleToken.balanceOf(user6.address)).to.be.equal(ethers.utils.parseEther("0"))
      await presale.connect(user6).claimTokensOrARefund();
      await expect(presale.connect(user6).claimTokensOrARefund()).to.be.reverted;
      expect(await presaleToken.balanceOf(user6.address)).to.be.equal(ethers.utils.parseEther("200000"))

      expect(await presaleToken.balanceOf(user7.address)).to.be.equal(ethers.utils.parseEther("0"))
      await presale.connect(user7).claimTokensOrARefund();
      await expect(presale.connect(user7).claimTokensOrARefund()).to.be.reverted;
      expect(await presaleToken.balanceOf(user7.address)).to.be.equal(ethers.utils.parseEther("200000"))


      expect((await presale.presaleCounts()).claimsCount).to.be.equal(6);

      const pairaddress = await factory.getPair(presaleToken.address, WBNBAddr.address);
      const UniswapV2Pair: UniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
      uniswapV2Pair = await UniswapV2Pair.attach(pairaddress);

      expect(await uniswapV2Pair.balanceOf(presale.address)).not.to.be.equal("0")
      expect(await uniswapV2Pair.balanceOf(user1.address)).to.be.equal("0")
      expect(await presaleToken.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther(String( (2_000_000 - 1_200_000) * 1.7)))
      
      await expect(presale.connect(user1).unlockLPTokens()).to.be.reverted;
      await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
      
      await network.provider.send("evm_increaseTime", [10*OneMinute]);
      await network.provider.send("evm_mine")
      
      await presale.connect(user1).unlockLPTokens();
      await expect(presale.connect(user1).unlockLPTokens()).to.be.reverted;
      
      await presale.connect(user1).unlockTokens();
      await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
      
      expect(await uniswapV2Pair.balanceOf(user1.address)).not.to.be.equal("0")
      expect(await uniswapV2Pair.balanceOf(presale.address)).to.be.equal("0")
      expect(await presaleToken.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther(String( (2_000_000 - 1_200_000) * 1.7 + 500_000*0.5 )))


      await network.provider.send("evm_increaseTime", [10*OneMinute]);
      await network.provider.send("evm_mine")
      await presale.connect(user1).unlockTokens();
      await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
      expect(await presaleToken.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther(String( (2_000_000 - 1_200_000) * 1.7 + 500_000*0.55 )))

      await network.provider.send("evm_increaseTime", [90*OneMinute]);
      await network.provider.send("evm_mine")
      await presale.connect(user1).unlockTokens();
      await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
      expect(await presaleToken.balanceOf(user1.address)).to.be.equal(ethers.utils.parseEther(String( (2_000_000 - 1_200_000) * 1.7 + 500_000*1 )))

      // Project completed

    });
  
  });

})


