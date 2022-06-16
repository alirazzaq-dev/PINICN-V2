const { time } = require('@openzeppelin/test-helpers');
import { expect } from 'chai';
// const { ethers, waffle } = require("hardhat");
import { ethers, waffle } from "hardhat";
const provider = waffle.provider;
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { BigNumber } from "ethers";
import { network } from "hardhat";
import { BEP20, BEP20__factory, BEP9, BEP9__factory, Launchpadv2, Launchpadv2__factory, LPLokcerManager, LPLokcerManager__factory, Presale, PresaleToken, PresaleToken__factory, UniswapV2Factory, UniswapV2Factory__factory, UniswapV2Pair, UniswapV2Pair__factory, UniswapV2Router02, UniswapV2Router02__factory, WETH9, WETH9__factory } from "../typechain";
import { BigNumber, ContractReceipt } from 'ethers';
import { timeStamp } from 'console';

let deployer: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress, user3: SignerWithAddress, user4: SignerWithAddress, user5: SignerWithAddress, user6: SignerWithAddress, user7: SignerWithAddress, user8: SignerWithAddress, teamAddr: SignerWithAddress, devAddr: SignerWithAddress
let launchpad: Launchpadv2, presale: Presale, presaleToken: BEP20, criteriaToken: BEP20, WBNBAddr: WETH9


let bep9: BEP9


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
    const PresaleToken: BEP20__factory = await ethers.getContractFactory('BEP20');

    const BEP9: BEP9__factory = await ethers.getContractFactory('BEP9');



    const Launchpad: Launchpadv2__factory = await ethers.getContractFactory("Launchpadv2");
    bep9 = await BEP9.deploy();

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

  // const StratPresale = async () => {

  //   let latestBlock = await ethers.provider.getBlock("latest");
  //   const OneMinute = Number(await time.duration.minutes(1));
  //   const OneDay = Number(await time.duration.days(1));

  //   await presaleToken.mint(user1.address, ethers.utils.parseEther(String(8584726 + 1000000 * 1.7)));
  //   await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther(String(8584726 + 1000000 * 1.7)));

  //   await expect(launchpad.withdrawBNBs()).to.be.reverted;

  //   await launchpad.connect(user1).createPresale(
  //     {
  //       tokenAddress: presaleToken.address,
  //       decimals: 18
  //     },
  //     {
  //       presaleType: PresaleType.PUBLIC,
  //       criteriaToken: zeroAddress,
  //       minCriteriaTokens: ethers.utils.parseEther("0"),
  //       presaleRate: "10000",
  //       liquidity: 70,
  //       hardCap: ethers.utils.parseEther("50"),
  //       softCap: ethers.utils.parseEther("25"),
  //       minContribution: ethers.utils.parseEther("0.001"),
  //       maxContribution: ethers.utils.parseEther("0.005"),
  //       refundType: RefundType.BURN
  //     },
  //     {
  //       startedAt: latestBlock.timestamp + 15 * OneMinute,
  //       expiredAt: latestBlock.timestamp + 1 * OneDay,
  //       lpLockupDuration: 10 * OneMinute,
  //     },
  //     {
  //       isEnabled: false,
  //       firstReleasePC: 20,
  //       eachCycleDuration: 10,
  //       eachCyclePC: 10
  //     },
  //     {
  //       isEnabled: false,
  //       vestingTokens: 100,
  //       firstReleaseDelay: 100,
  //       firstReleasePC: 50,
  //       eachCycleDuration: 100,
  //       eachCyclePC: 10
  //     },
  //     {
  //       logoURL: "",
  //       websiteURL: "",
  //       twitterURL: "",
  //       telegramURL: "",
  //       discordURL: "",
  //       description: ""
  //     },
  //     { value: ethers.utils.parseEther("0.20") }

  //   )

  //   await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)

  //   // const presaleCount = await launchpad.presaleCount();
  //   // const pressaleAddress = await launchpad.presaleRecordByID(presaleCount);
  //   // const presale_factory = await ethers.getContractFactory("Presale");
  //   // presale = await presale_factory.attach(pressaleAddress);

  //   // return presale;

  // }

  describe("As a user ", async () => {

    it("update fess function check", async () => {
      
      console.log("Old Fee", (await launchpad.upfrontfee()).toString());

      await launchpad.updateFees(ethers.utils.parseEther("2"), 5);
      
      console.log("New Fee", (await launchpad.upfrontfee()).toString());
      
      await launchpad.updateFees(ethers.utils.parseEther("0.2"), 25);

      console.log("Newwww Fee", (await launchpad.upfrontfee()).toString());
      
      await launchpad.updateFees(ethers.utils.parseEther("0.0002"), 35);

      console.log("Newwwwwwwwww Fee", (await launchpad.upfrontfee()).toString());

    })

    it("hardcore test ", async () => {

      let latestBlock = await ethers.provider.getBlock("latest");
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));
  
      const decimals = await bep9.decimals(); 
      const decimalFactor = 10 ** decimals;
      const presaleRate = 12345;

      const tokensForSale  = 1 * presaleRate *  decimalFactor;
      const tokensForLP  = tokensForSale * 0.70 ;
      const tokensForVesting  = 1500 * decimalFactor;
      const totalTokens = tokensForSale + tokensForLP + tokensForVesting;

      // console.log("tokensForSale ", tokensForSale)
      // console.log("tokensForLP ", tokensForLP)
      // console.log("totalTokens ", totalTokens)

      await bep9.mint(user1.address, String(totalTokens) );
      await bep9.connect(user1).approve(launchpad.address, String(totalTokens ));   
  
      await expect(launchpad.withdrawBNBs()).to.be.reverted;
  
      const tx = await launchpad.connect(user1).createPresale(
        {
          tokenAddress: bep9.address,
          decimals: decimals
        },
        {
          presaleType: PresaleType.PUBLIC,
          criteriaToken: zeroAddress,
          minCriteriaTokens: ethers.utils.parseEther("0"),
          presaleRate: presaleRate,
          liquidity: 70,
          hardCap: ethers.utils.parseEther("1"),
          softCap: ethers.utils.parseEther("0.5"),
          minContribution: ethers.utils.parseEther("0.25"),
          maxContribution: ethers.utils.parseEther("0.5"),
          refundType: RefundType.BURN
        },
        {
          startedAt: latestBlock.timestamp + OneMinute,
          expiredAt: latestBlock.timestamp + 1 * OneDay,
          lpLockupDuration: 50 * OneMinute,
        },
        {
          isEnabled: true,
          firstReleasePC: 50,
          eachCycleDuration: 10,
          eachCyclePC: 20
        },
        {
          isEnabled: true,
          vestingTokens: 1500,
          firstReleaseDelay: 10,
          firstReleasePC: 30,
          eachCycleDuration: 10,
          eachCyclePC: 25
        },
        {
          logoURL: "",
          websiteURL: "",
          twitterURL: "",
          telegramURL: "",
          discordURL: "",
          description: ""
        },
        { value: ethers.utils.parseEther("2") }
  
      )
      
      let receipt: ContractReceipt = await tx.wait();
      const xxxx: any = receipt.events?.filter((x) => {return x.event == "PresaleCreated"})
      
      let presaleAddress =  xxxx[0].args.presaleAddress;
      
      // console.log("Tokens in presale contract ", (await presaleToken.balanceOf(presaleAddress)).toString() );
      expect(await bep9.balanceOf(presaleAddress)).to.be.equal(totalTokens);
      
      const presale_factory = await ethers.getContractFactory("Presale");
      presale = await presale_factory.attach(presaleAddress);
      
      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);
      expect((await bep9.balanceOf(presale.address))).to.be.equal(totalTokens);

      await network.provider.send("evm_increaseTime", [OneMinute]);
      await network.provider.send("evm_mine");

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

     
      await expect((presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("0.51")}))).to.be.reverted;
      await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("0.5")});
      expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("0.5"));
      expect((await presale.participant(user2.address)).tokens).to.be.equal(0.5 * presaleRate * decimalFactor);      
      expect((await presale.participant(user2.address)).unclaimed).to.be.equal(0.5 * presaleRate * decimalFactor);      
      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.5"));

      await expect((presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("0.51")}))).to.be.reverted;
      await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("0.5")});
      expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("0.5"));
      expect((await presale.participant(user3.address)).tokens).to.be.equal(0.5 * presaleRate * decimalFactor);      
      expect((await presale.participant(user3.address)).unclaimed).to.be.equal(0.5 * presaleRate * decimalFactor);      
      expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("1"));

      await expect((presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("0.01")}))).to.be.reverted;
      
      

      // Finalize the sale

      await presale.connect(user1).finalizePresale();

      expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(2);
      


    //   // // Contribitors are claiming their 
      
      const tokensPerHead = 0.5 * presaleRate * decimalFactor
      const unlockedTokensPerCycle = 1500 * decimalFactor;
      const firstRelease = unlockedTokensPerCycle * 0.30;
      const remaingLockedTokens = unlockedTokensPerCycle * 0.70;
      // First cycle

      let factor = 0;

      // await presale.connect(user2).claimTokensOrARefund();
      // expect((await bep9.balanceOf(user2.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      // expect((await presale.participant(user2.address)).unclaimed).to.be.equal(String(tokensPerHead - (tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

      // await presale.connect(user3).claimTokensOrARefund();
      // expect((await bep9.balanceOf(user3.address))).to.be.equal((String(tokensPerHead*0.5 + tokensPerHead*0.5*factor)));
      // expect((await presale.participant(user3.address)).unclaimed).to.be.equal(String(tokensPerHead - (tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      

      await network.provider.send("evm_increaseTime", [10 * OneMinute])
      await network.provider.send("evm_mine");

      await presale.connect(user1).unlockTokens();
      expect((await bep9.balanceOf(user1.address))).to.be.equal((String(firstRelease + remaingLockedTokens * 0 )));

      await network.provider.send("evm_increaseTime", [10 * OneMinute])
      await network.provider.send("evm_mine");

      await presale.connect(user1).unlockTokens();
      expect((await bep9.balanceOf(user1.address))).to.be.equal((String(firstRelease + remaingLockedTokens * 0.25 )));

      await network.provider.send("evm_increaseTime", [10 * OneMinute])
      await network.provider.send("evm_mine");

      await presale.connect(user1).unlockTokens();
      expect((await bep9.balanceOf(user1.address))).to.be.equal((String(firstRelease + remaingLockedTokens * 0.5 )));

      await network.provider.send("evm_increaseTime", [10 * OneMinute])
      await network.provider.send("evm_mine");

      await presale.connect(user1).unlockTokens();
      expect((await bep9.balanceOf(user1.address))).to.be.equal((String(firstRelease + remaingLockedTokens * 0.75 )));

      await network.provider.send("evm_increaseTime", [10 * OneMinute])
      await network.provider.send("evm_mine");

      await presale.connect(user1).unlockTokens();
      expect((await bep9.balanceOf(user1.address))).to.be.equal((String(firstRelease + remaingLockedTokens * 1 )));

      // Second cycle
      
      factor = 0.2;
  

      // await presale.connect(user2).claimTokensOrARefund();
      // expect((await bep9.balanceOf(user2.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      // expect((await presale.participant(user2.address)).unclaimed).to.be.equal(String(tokensPerHead - (tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      
      // await presale.connect(user3).claimTokensOrARefund();
      // expect((await bep9.balanceOf(user3.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      // expect((await presale.participant(user3.address)).unclaimed).to.be.equal(String(tokensPerHead - (tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      


      // Third cycle 

      await network.provider.send("evm_increaseTime", [10 * OneMinute])
      await network.provider.send("evm_mine");

      factor = 0.4;

      // await presale.connect(user1).unlockTokens();
      // expect((await bep9.balanceOf(user1.address))).to.be.equal((String(100000*0.5 * decimalFactor + 100000*0.5*0.2 * decimalFactor)));

      // await presale.connect(user2).claimTokensOrARefund();
      // expect((await bep9.balanceOf(user2.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      // expect((await presale.participant(user2.address)).unclaimed).to.be.equal(String(tokensPerHead - (tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      
      // await presale.connect(user3).claimTokensOrARefund();
      // expect((await bep9.balanceOf(user3.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      // expect((await presale.participant(user3.address)).unclaimed).to.be.equal(String(tokensPerHead - (tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      

      // Fourth cycle 

      await network.provider.send("evm_increaseTime", [10 * OneMinute])
      await network.provider.send("evm_mine");

      factor = 0.6;

      // await presale.connect(user1).unlockTokens();
      // expect((await bep9.balanceOf(user1.address))).to.be.equal((String(100000*0.5 * decimalFactor + 100000*0.5*0.4 * decimalFactor)));

      // await presale.connect(user2).claimTokensOrARefund();
      // expect((await bep9.balanceOf(user2.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      // expect((await presale.participant(user2.address)).unclaimed).to.be.equal(String(tokensPerHead - (tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      
      // await presale.connect(user3).claimTokensOrARefund();
      // expect((await bep9.balanceOf(user3.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      // expect((await presale.participant(user3.address)).unclaimed).to.be.equal(String(tokensPerHead - (tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      

      // Fifth cycle 

      await network.provider.send("evm_increaseTime", [10 * OneMinute])
      await network.provider.send("evm_mine");

      factor = 0.8;

      // await presale.connect(user1).unlockTokens();
      // expect((await bep9.balanceOf(user1.address))).to.be.equal((String(100000*0.5 * decimalFactor + 100000*0.5*0.6 * decimalFactor)));

      // await presale.connect(user2).claimTokensOrARefund();
      // expect((await bep9.balanceOf(user2.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      // expect((await presale.participant(user2.address)).unclaimed).to.be.equal(String(tokensPerHead - (tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      
      // await presale.connect(user3).claimTokensOrARefund();
      // expect((await bep9.balanceOf(user3.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      // expect((await presale.participant(user3.address)).unclaimed).to.be.equal(String(tokensPerHead - (tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      
           

      // Sixth cycle 


      await network.provider.send("evm_increaseTime", [10 * OneMinute])
      await network.provider.send("evm_mine");

      factor = 1;

      // await presale.connect(user1).unlockTokens();
      // expect((await bep9.balanceOf(user1.address))).to.be.equal((String(100000*0.5 * decimalFactor + 100000*0.5*0.8 * decimalFactor)));

      // await presale.connect(user2).claimTokensOrARefund();
      // expect((await bep9.balanceOf(user2.address))).to.be.equal(tokensPerHead);
      // expect((await presale.participant(user2.address)).unclaimed).to.be.equal(0);
      
      // await presale.connect(user3).claimTokensOrARefund();
      // expect((await bep9.balanceOf(user3.address))).to.be.equal(tokensPerHead);
      // expect((await presale.participant(user3.address)).unclaimed).to.be.equal(0);
      

      await network.provider.send("evm_increaseTime", [10 * OneMinute])
      await network.provider.send("evm_mine");


      // await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
      // await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;

      // // Seven cycle 

      // await network.provider.send("evm_increaseTime", [10 * OneMinute])
      // await network.provider.send("evm_mine");

      // await presale.connect(user1).unlockTokens();
      // expect((await bep9.balanceOf(user1.address))).to.be.equal((String(100000*0.5 * decimalFactor + 100000*0.5 * decimalFactor)));

      // await presale.connect(user1).unlockLPTokens();

      // expect((await bep9.balanceOf(presale.address))).to.be.equal((String(0 * decimalFactor)));

      

    })

    // it("hardcore test ", async () => {

    //   let latestBlock = await ethers.provider.getBlock("latest");
    //   const OneMinute = Number(await time.duration.minutes(1));
    //   const OneDay = Number(await time.duration.days(1));
  
    //   const decimals = await bep9.decimals(); 
    //   const decimalFactor = 10 ** decimals;
    //   const presaleRate = 10000;

    //   const tokensForSale  = 0.07 * presaleRate *  decimalFactor;
    //   const tokensForLP  = tokensForSale * 0.70 ;
    //   const tokensForVesting  = 100000 * decimalFactor;
    //   const totalTokens = tokensForSale + tokensForLP + tokensForVesting;

    //   await bep9.mint(user1.address, String(totalTokens) );
    //   await bep9.connect(user1).approve(launchpad.address, String(totalTokens ));   
  
    //   await expect(launchpad.withdrawBNBs()).to.be.reverted;
  
    //   const tx = await launchpad.connect(user1).createPresale(
    //     {
    //       tokenAddress: bep9.address,
    //       decimals: decimals
    //     },
    //     {
    //       presaleType: PresaleType.PUBLIC,
    //       criteriaToken: zeroAddress,
    //       minCriteriaTokens: ethers.utils.parseEther("0"),
    //       presaleRate: 10000,
    //       liquidity: 70,
    //       hardCap: ethers.utils.parseEther("0.07"),
    //       softCap: ethers.utils.parseEther("0.05"),
    //       minContribution: ethers.utils.parseEther("0.001"),
    //       maxContribution: ethers.utils.parseEther("0.01"),
    //       refundType: RefundType.BURN
    //     },
    //     {
    //       startedAt: latestBlock.timestamp + OneMinute,
    //       expiredAt: latestBlock.timestamp + 1 * OneDay,
    //       lpLockupDuration: 50 * OneMinute,
    //     },
    //     {
    //       isEnabled: true,
    //       firstReleasePC: 50,
    //       eachCycleDuration: 10,
    //       eachCyclePC: 20
    //     },
    //     {
    //       isEnabled: true,
    //       vestingTokens: 100000,
    //       firstReleaseDelay: 10,
    //       firstReleasePC: 50,
    //       eachCycleDuration: 10,
    //       eachCyclePC: 20
    //     },
    //     {
    //       logoURL: "",
    //       websiteURL: "",
    //       twitterURL: "",
    //       telegramURL: "",
    //       discordURL: "",
    //       description: ""
    //     },
    //     { value: ethers.utils.parseEther("0.20") }
  
    //   )
      
    //   let receipt: ContractReceipt = await tx.wait();
    //   const xxxx: any = receipt.events?.filter((x) => {return x.event == "PresaleCreated"})
      
    //   let presaleAddress =  xxxx[0].args.presaleAddress;
      
    //   // console.log("Tokens in presale contract ", (await presaleToken.balanceOf(presaleAddress)).toString() );
    //   expect(await bep9.balanceOf(presaleAddress)).to.be.equal(totalTokens);
      
    //   const presale_factory = await ethers.getContractFactory("Presale");
    //   presale = await presale_factory.attach(presaleAddress);
      
    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);
    //   expect((await bep9.balanceOf(presale.address))).to.be.equal(totalTokens);

    //   await network.provider.send("evm_increaseTime", [OneMinute]);
    //   await network.provider.send("evm_mine");

    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

    //  //
    //   await expect((presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("0.011")}))).to.be.reverted;
    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("0.01")});
    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("0.01"));
    //   expect((await presale.participant(user2.address)).tokens).to.be.equal(0.01 * presaleRate * decimalFactor);      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.01"));

    //   await expect((presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("0.011")}))).to.be.reverted;
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("0.01")});
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("0.01"));
    //   expect((await presale.participant(user3.address)).tokens).to.be.equal(0.01 * presaleRate * decimalFactor);      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.02"));

    //   await expect((presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("0.011")}))).to.be.reverted;
    //   await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("0.01")});
    //   expect((await presale.participant(user4.address)).value).to.be.equal(ethers.utils.parseEther("0.01"));
    //   expect((await presale.participant(user4.address)).tokens).to.be.equal(0.01 * presaleRate * decimalFactor);      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.03"));

    //   await expect((presale.connect(user5).contributeToSale({ value: ethers.utils.parseEther("0.011")}))).to.be.reverted;
    //   await presale.connect(user5).contributeToSale({ value: ethers.utils.parseEther("0.01")});
    //   expect((await presale.participant(user5.address)).value).to.be.equal(ethers.utils.parseEther("0.01"));
    //   expect((await presale.participant(user5.address)).tokens).to.be.equal(0.01 * presaleRate * decimalFactor);      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.04"));

    //   await expect((presale.connect(user6).contributeToSale({ value: ethers.utils.parseEther("0.011")}))).to.be.reverted;
    //   await presale.connect(user6).contributeToSale({ value: ethers.utils.parseEther("0.01")});
    //   expect((await presale.participant(user6.address)).value).to.be.equal(ethers.utils.parseEther("0.01"));
    //   expect((await presale.participant(user6.address)).tokens).to.be.equal(0.01 * presaleRate * decimalFactor);      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.05"));

    //   await expect((presale.connect(user7).contributeToSale({ value: ethers.utils.parseEther("0.011")}))).to.be.reverted;
    //   await presale.connect(user7).contributeToSale({ value: ethers.utils.parseEther("0.01")});
    //   expect((await presale.participant(user7.address)).value).to.be.equal(ethers.utils.parseEther("0.01"));
    //   expect((await presale.participant(user7.address)).tokens).to.be.equal(0.01 * presaleRate * decimalFactor);      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.06"));

    //   await expect((presale.connect(user8).contributeToSale({ value: ethers.utils.parseEther("0.011")}))).to.be.reverted;
    //   await presale.connect(user8).contributeToSale({ value: ethers.utils.parseEther("0.01")});
    //   expect((await presale.participant(user8.address)).value).to.be.equal(ethers.utils.parseEther("0.01"));
    //   expect((await presale.participant(user8.address)).tokens).to.be.equal(0.01 * presaleRate * decimalFactor);      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.07"));

      
    //   await expect((presale.connect(user1).contributeToSale({ value: ethers.utils.parseEther("0.01")}))).to.be.reverted;
      
      

    //   // Trying to emergency withdraw all the funds
    //   // //

    //   await presale.connect(user2).emergencyWithdraw();
    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("0"));
    //   expect((await presale.participant(user2.address)).tokens).to.be.equal("0");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.06"));

    //   await presale.connect(user3).emergencyWithdraw();
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("0"));
    //   expect((await presale.participant(user3.address)).tokens).to.be.equal("0");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.05"));

    //   await presale.connect(user4).emergencyWithdraw();
    //   expect((await presale.participant(user4.address)).value).to.be.equal(ethers.utils.parseEther("0"));
    //   expect((await presale.participant(user4.address)).tokens).to.be.equal("0");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.04"));

    //   await presale.connect(user5).emergencyWithdraw();
    //   expect((await presale.participant(user5.address)).value).to.be.equal(ethers.utils.parseEther("0"));
    //   expect((await presale.participant(user5.address)).tokens).to.be.equal("0");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.03"));

    //   await presale.connect(user6).emergencyWithdraw();
    //   expect((await presale.participant(user6.address)).value).to.be.equal(ethers.utils.parseEther("0"));
    //   expect((await presale.participant(user6.address)).tokens).to.be.equal("0");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.02"));

    //   await presale.connect(user7).emergencyWithdraw();
    //   expect((await presale.participant(user7.address)).value).to.be.equal(ethers.utils.parseEther("0"));
    //   expect((await presale.participant(user7.address)).tokens).to.be.equal("0");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.01"));

    //   await presale.connect(user8).emergencyWithdraw();
    //   expect((await presale.participant(user8.address)).value).to.be.equal(ethers.utils.parseEther("0"));
    //   expect((await presale.participant(user8.address)).tokens).to.be.equal("0");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.0"));


    // //   // //


    // //   // // Again contributing
    // //  //
    //  await expect((presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("0.011")}))).to.be.reverted;
    //  await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("0.01")});
    //  expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("0.01"));
    //  expect((await presale.participant(user2.address)).tokens).to.be.equal(0.01 * presaleRate * decimalFactor);      
    //  expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.01"));

    //  await expect((presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("0.011")}))).to.be.reverted;
    //  await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("0.01")});
    //  expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("0.01"));
    //  expect((await presale.participant(user3.address)).tokens).to.be.equal(0.01 * presaleRate * decimalFactor);      
    //  expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.02"));

    //  await expect((presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("0.011")}))).to.be.reverted;
    //  await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("0.01")});
    //  expect((await presale.participant(user4.address)).value).to.be.equal(ethers.utils.parseEther("0.01"));
    //  expect((await presale.participant(user4.address)).tokens).to.be.equal(0.01 * presaleRate * decimalFactor);      
    //  expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.03"));

    //  await expect((presale.connect(user5).contributeToSale({ value: ethers.utils.parseEther("0.011")}))).to.be.reverted;
    //  await presale.connect(user5).contributeToSale({ value: ethers.utils.parseEther("0.01")});
    //  expect((await presale.participant(user5.address)).value).to.be.equal(ethers.utils.parseEther("0.01"));
    //  expect((await presale.participant(user5.address)).tokens).to.be.equal(0.01 * presaleRate * decimalFactor);      
    //  expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.04"));

    //  await expect((presale.connect(user6).contributeToSale({ value: ethers.utils.parseEther("0.011")}))).to.be.reverted;
    //  await presale.connect(user6).contributeToSale({ value: ethers.utils.parseEther("0.01")});
    //  expect((await presale.participant(user6.address)).value).to.be.equal(ethers.utils.parseEther("0.01"));
    //  expect((await presale.participant(user6.address)).tokens).to.be.equal(0.01 * presaleRate * decimalFactor);      
    //  expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.05"));

    //  await expect((presale.connect(user7).contributeToSale({ value: ethers.utils.parseEther("0.011")}))).to.be.reverted;
    //  await presale.connect(user7).contributeToSale({ value: ethers.utils.parseEther("0.01")});
    //  expect((await presale.participant(user7.address)).value).to.be.equal(ethers.utils.parseEther("0.01"));
    //  expect((await presale.participant(user7.address)).tokens).to.be.equal(0.01 * presaleRate * decimalFactor);      
    //  expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.06"));

    //  await expect((presale.connect(user8).contributeToSale({ value: ethers.utils.parseEther("0.011")}))).to.be.reverted;
    //  await presale.connect(user8).contributeToSale({ value: ethers.utils.parseEther("0.01")});
    //  expect((await presale.participant(user8.address)).value).to.be.equal(ethers.utils.parseEther("0.01"));
    //  expect((await presale.participant(user8.address)).tokens).to.be.equal(0.01 * presaleRate * decimalFactor);      
    //  expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0.07"));

     
    //  await expect((presale.connect(user1).contributeToSale({ value: ethers.utils.parseEther("0.01")}))).to.be.reverted;
    
    // //  //
     
    
    // //   // Finalize the sale

    //   await presale.connect(user1).finalizePresale();

    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(2);
      


    //   // Contribitors are claiming their 
      
    //   const tokensPerHead = 0.01 * presaleRate * decimalFactor

    //   // First cycle

    //   let factor = 0;

    //   await presale.connect(user2).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user2.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      
    //   await presale.connect(user3).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user3.address))).to.be.equal((String(tokensPerHead*0.5 + tokensPerHead*0.5*factor)));
      
    //   await presale.connect(user4).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user4.address))).to.be.equal((String(tokensPerHead*0.5 + tokensPerHead*0.5*factor)));

    //   await presale.connect(user5).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user5.address))).to.be.equal((String(tokensPerHead*0.5 + tokensPerHead*0.5*factor)));

    //   await presale.connect(user6).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user6.address))).to.be.equal((String(tokensPerHead*0.5 + tokensPerHead*0.5*factor)));

    //   await presale.connect(user7).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user7.address))).to.be.equal((String(tokensPerHead*0.5 + tokensPerHead*0.5*factor)));

    //   await presale.connect(user8).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user8.address))).to.be.equal((String(tokensPerHead*0.5 + tokensPerHead*0.5*factor)));


    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine");
      

    //   // Second cycle
      
    //   factor = 0.2;
  
    //   await presale.connect(user1).unlockTokens();
    //   expect((await bep9.balanceOf(user1.address))).to.be.equal((String(100000*0.5 * decimalFactor + 100000*0.5*0 * decimalFactor)));

    //   await presale.connect(user2).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user2.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      
    //   await presale.connect(user3).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user3.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      
    //   await presale.connect(user4).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user4.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user5).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user5.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user6).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user6.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user7).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user7.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user8).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user8.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));



    //   // Third cycle 

    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   factor = 0.4;

    //   await presale.connect(user1).unlockTokens();
    //   expect((await bep9.balanceOf(user1.address))).to.be.equal((String(100000*0.5 * decimalFactor + 100000*0.5*0.2 * decimalFactor)));

    //   await presale.connect(user2).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user2.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      
    //   await presale.connect(user3).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user3.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      
    //   await presale.connect(user4).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user4.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user5).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user5.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user6).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user6.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user7).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user7.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user8).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user8.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));



    //   // Fourth cycle 

    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   factor = 0.6;

    //   await presale.connect(user1).unlockTokens();
    //   expect((await bep9.balanceOf(user1.address))).to.be.equal((String(100000*0.5 * decimalFactor + 100000*0.5*0.4 * decimalFactor)));

    //   await presale.connect(user2).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user2.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      
    //   await presale.connect(user3).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user3.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      
    //   await presale.connect(user4).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user4.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user5).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user5.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user6).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user6.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user7).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user7.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user8).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user8.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));



    //   // Fifth cycle 

    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   factor = 0.8;

    //   await presale.connect(user1).unlockTokens();
    //   expect((await bep9.balanceOf(user1.address))).to.be.equal((String(100000*0.5 * decimalFactor + 100000*0.5*0.6 * decimalFactor)));

    //   await presale.connect(user2).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user2.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      
    //   await presale.connect(user3).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user3.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      
    //   await presale.connect(user4).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user4.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user5).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user5.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user6).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user6.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user7).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user7.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user8).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user8.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

            

    //   // Sixth cycle 


    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   factor = 1;

    //   await presale.connect(user1).unlockTokens();
    //   expect((await bep9.balanceOf(user1.address))).to.be.equal((String(100000*0.5 * decimalFactor + 100000*0.5*0.8 * decimalFactor)));

    //   await presale.connect(user2).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user2.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      
    //   await presale.connect(user3).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user3.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));
      
    //   await presale.connect(user4).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user4.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user5).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user5.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user6).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user6.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user7).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user7.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));

    //   await presale.connect(user8).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user8.address))).to.be.equal((String(tokensPerHead*0.5  + tokensPerHead*0.5*factor)));


    //   // Seven cycle 

    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   await presale.connect(user1).unlockTokens();
    //   expect((await bep9.balanceOf(user1.address))).to.be.equal((String(100000*0.5 * decimalFactor + 100000*0.5 * decimalFactor)));

    //   await presale.connect(user1).unlockLPTokens();

    //   expect((await bep9.balanceOf(presale.address))).to.be.equal((String(0 * decimalFactor)));

    // })

    // it("Test with 18 decimal tooken ", async () => {
    //   let latestBlock = await ethers.provider.getBlock("latest");
    //   const OneMinute = Number(await time.duration.minutes(1));
    //   const OneDay = Number(await time.duration.days(1));
  
    //   const decimals = await presaleToken.decimals(); 
    //   // const decimals = await bep9.decimals(); 
    //   // console.log("decimals ", decimals);

    //   await presaleToken.mint(user1.address, ethers.utils.parseEther("8600000") );
    //   await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther("8600000") );

    //   // await bep9.mint(user1.address, String(8600000 * 10 ** decimals) );
    //   // await bep9.connect(user1).approve(launchpad.address, String(8600000 * 10 ** decimals) );
     
  
    //   await expect(launchpad.withdrawBNBs()).to.be.reverted;
  
    //   const tx = await launchpad.connect(user1).createPresale(
    //     {
    //       tokenAddress: presaleToken.address,
    //       decimals: 18
    //     },
    //     {
    //       presaleType: PresaleType.PUBLIC,
    //       criteriaToken: zeroAddress,
    //       minCriteriaTokens: ethers.utils.parseEther("0"),
    //       presaleRate: 10000,
    //       liquidity: 70,
    //       hardCap: ethers.utils.parseEther("500"),
    //       softCap: ethers.utils.parseEther("250"),
    //       minContribution: ethers.utils.parseEther("50"),
    //       maxContribution: ethers.utils.parseEther("200"),
    //       refundType: RefundType.BURN
    //     },
    //     {
    //       startedAt: latestBlock.timestamp + 15 * OneMinute,
    //       expiredAt: latestBlock.timestamp + 1 * OneDay,
    //       lpLockupDuration: 50 * OneMinute,
    //     },
    //     {
    //       isEnabled: true,
    //       firstReleasePC: 50,
    //       eachCycleDuration: 10,
    //       eachCyclePC: 20
    //     },
    //     {
    //       isEnabled: true,
    //       vestingTokens: 100000,
    //       firstReleaseDelay: 10,
    //       firstReleasePC: 50,
    //       eachCycleDuration: 10,
    //       eachCyclePC: 20
    //     },
    //     {
    //       logoURL: "",
    //       websiteURL: "",
    //       twitterURL: "",
    //       telegramURL: "",
    //       discordURL: "",
    //       description: ""
    //     },
    //     { value: ethers.utils.parseEther("0.20") }
  
    //   )
      
    //   let receipt: ContractReceipt = await tx.wait();
    //   const xxxx: any = receipt.events?.filter((x) => {return x.event == "PresaleCreated"})
      
    //   let presaleAddress =  xxxx[0].args.presaleAddress;
      
    //   // console.log("Tokens in presale contract ", (await presaleToken.balanceOf(presaleAddress)).toString() );
    //   expect((await presaleToken.balanceOf(presaleAddress)).toString()).to.be.equal(ethers.utils.parseEther("8600000"));
      
    //   const presale_factory = await ethers.getContractFactory("Presale");
    //   presale = await presale_factory.attach(presaleAddress);
      
    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);
    //   expect((await presaleToken.balanceOf(presale.address))).to.be.equal(ethers.utils.parseEther("8600000"));

    //   await network.provider.send("evm_increaseTime", [15 * OneMinute]);
    //   await network.provider.send("evm_mine");

    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

    //  //
    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("50")});
    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("50"));
    //   expect((await presale.participant(user2.address)).tokens).to.be.equal("500000");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("50"));

    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("75")});
    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("125"));
    //   expect((await presale.participant(user2.address)).tokens).to.be.equal("1250000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("125"));

    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("75")});
    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("200"));
    //   expect((await presale.participant(user2.address)).tokens).to.be.equal("2000000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("200"));     
    //   //
      
    //   //
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("50")});
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("50"));
    //   expect((await presale.participant(user3.address)).tokens).to.be.equal("500000");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("250"));
      
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("75")});
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("125"));
    //   expect((await presale.participant(user3.address)).tokens).to.be.equal("1250000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("325"));
      
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("75")});
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("200"));
    //   expect((await presale.participant(user3.address)).tokens).to.be.equal("2000000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("400"));
    //   //

    //   //
    //   await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("50")});
    //   expect((await presale.participant(user4.address)).value).to.be.equal(ethers.utils.parseEther("50"));
    //   expect((await presale.participant(user4.address)).tokens).to.be.equal("500000");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("450"));
      
    //   await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("50")});
    //   expect((await presale.participant(user4.address)).value).to.be.equal(ethers.utils.parseEther("100"));
    //   expect((await presale.participant(user4.address)).tokens).to.be.equal("1000000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("500"));
      
    //   // await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("1")});

    //   // Trying to emergency withdraw all the funds
    //   //
    //   await presale.connect(user2).emergencyWithdraw();

    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("0"));
    //   expect((await presale.participant(user2.address)).tokens).to.be.equal("0");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("300"));

    //   await presale.connect(user3).emergencyWithdraw();
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("0"));
    //   expect((await presale.participant(user3.address)).tokens).to.be.equal("0");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("100"));

    //   await presale.connect(user4).emergencyWithdraw();
    //   expect((await presale.participant(user4.address)).value).to.be.equal(ethers.utils.parseEther("0"));
    //   expect((await presale.participant(user4.address)).tokens).to.be.equal("0");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0"));     
    //   //


    //   // Again contributing
    //   //
    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("50")});
    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("50"));
    //   expect((await presale.participant(user2.address)).tokens).to.be.equal("500000");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("50"));

    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("75")});
    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("125"));
    //   expect((await presale.participant(user2.address)).tokens).to.be.equal("1250000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("125"));

    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("75")});
    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("200"));
    //   expect((await presale.participant(user2.address)).tokens).to.be.equal("2000000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("200"));     
    //   //
      
    //   //
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("50")});
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("50"));
    //   expect((await presale.participant(user3.address)).tokens).to.be.equal("500000");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("250"));
      
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("75")});
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("125"));
    //   expect((await presale.participant(user3.address)).tokens).to.be.equal("1250000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("325"));
      
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("75")});
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("200"));
    //   expect((await presale.participant(user3.address)).tokens).to.be.equal("2000000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("400"));
    //   //

    //   //
    //   await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("50")});
    //   expect((await presale.participant(user4.address)).value).to.be.equal(ethers.utils.parseEther("50"));
    //   expect((await presale.participant(user4.address)).tokens).to.be.equal("500000");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("450"));
      
    //   await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("50")});
    //   expect((await presale.participant(user4.address)).value).to.be.equal(ethers.utils.parseEther("100"));
    //   expect((await presale.participant(user4.address)).tokens).to.be.equal("1000000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("500"));
      
    //   // await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("1")});
     
    //   // Finalize the sale

    //   await presale.connect(user1).finalizePresale();
      


    //   // Contribitors are claiming their tokens

    //   // First cycle

    //   await presale.connect(user2).claimTokensOrARefund();
    //   expect((await presaleToken.balanceOf(user2.address))).to.be.equal(ethers.utils.parseEther(String(2000000*0.5 + 2000000*0.5*0)));
    //   // expect((await presale.participant(user2.address)).claimed).to.be.equal(ethers.utils.parseEther(String(2000000*0.5 + 2000000*0.5*0)));
      
    //   await presale.connect(user3).claimTokensOrARefund();
    //   expect((await presaleToken.balanceOf(user3.address))).to.be.equal(ethers.utils.parseEther(String(2000000*0.5 + 2000000*0.5*0)));
    //   // expect((await presale.participant(user3.address)).claimed).to.be.equal(ethers.utils.parseEther(String(2000000*0.5 + 2000000*0.5*0)));
      
    //   await presale.connect(user4).claimTokensOrARefund();
    //   expect((await presaleToken.balanceOf(user4.address))).to.be.equal(ethers.utils.parseEther(String(1000000*0.5 + 1000000*0.5*0)));
    //   // expect((await presale.participant(user4.address)).claimed).to.be.equal(ethers.utils.parseEther(String(1000000*0.5 + 1000000*0.5*0)));


    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   // Second cycle

    //   await presale.connect(user1).unlockTokens();
    //   expect((await presaleToken.balanceOf(user1.address))).to.be.equal(ethers.utils.parseEther(String(100000*0.5 + 100000*0.5*0)));

    //   await presale.connect(user2).claimTokensOrARefund();
    //   expect((await presaleToken.balanceOf(user2.address))).to.be.equal(ethers.utils.parseEther(String(2000000*0.5 + 2000000*0.5*0.2)));
      
    //   await presale.connect(user3).claimTokensOrARefund();
    //   expect((await presaleToken.balanceOf(user3.address))).to.be.equal(ethers.utils.parseEther(String(2000000*0.5 + 2000000*0.5*0.2)));
      
    //   await presale.connect(user4).claimTokensOrARefund();
    //   expect((await presaleToken.balanceOf(user4.address))).to.be.equal(ethers.utils.parseEther(String(1000000*0.5 + 1000000*0.5*0.2)));


    //   // Third cycle 

    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   await presale.connect(user1).unlockTokens();
    //   expect((await presaleToken.balanceOf(user1.address))).to.be.equal(ethers.utils.parseEther(String(100000*0.5 + 100000*0.5*0.2)));

    //   await presale.connect(user2).claimTokensOrARefund();
    //   expect((await presaleToken.balanceOf(user2.address))).to.be.equal(ethers.utils.parseEther(String(2000000*0.5 + 2000000*0.5*0.4)));
      
    //   await presale.connect(user3).claimTokensOrARefund();
    //   expect((await presaleToken.balanceOf(user3.address))).to.be.equal(ethers.utils.parseEther(String(2000000*0.5 + 2000000*0.5*0.4)));
      
    //   await presale.connect(user4).claimTokensOrARefund();
    //   expect((await presaleToken.balanceOf(user4.address))).to.be.equal(ethers.utils.parseEther(String(1000000*0.5 + 1000000*0.5*0.4)));



    //   // Fourth cycle 

    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   await presale.connect(user1).unlockTokens();
    //   expect((await presaleToken.balanceOf(user1.address))).to.be.equal(ethers.utils.parseEther(String(100000*0.5 + 100000*0.5*0.4)));

    //   await presale.connect(user2).claimTokensOrARefund();
    //   expect((await presaleToken.balanceOf(user2.address))).to.be.equal(ethers.utils.parseEther(String(2000000*0.5 + 2000000*0.5*0.6)));
      
    //   await presale.connect(user3).claimTokensOrARefund();
    //   expect((await presaleToken.balanceOf(user3.address))).to.be.equal(ethers.utils.parseEther(String(2000000*0.5 + 2000000*0.5*0.6)));
      
    //   await presale.connect(user4).claimTokensOrARefund();
    //   expect((await presaleToken.balanceOf(user4.address))).to.be.equal(ethers.utils.parseEther(String(1000000*0.5 + 1000000*0.5*0.6)));

            

    //   // Fifth cycle 

    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   await presale.connect(user1).unlockTokens();
    //   expect((await presaleToken.balanceOf(user1.address))).to.be.equal(ethers.utils.parseEther(String(100000*0.5 + 100000*0.5*0.6)));

    //   await presale.connect(user2).claimTokensOrARefund();
    //   expect((await presaleToken.balanceOf(user2.address))).to.be.equal(ethers.utils.parseEther(String(2000000*0.5 + 2000000*0.5*0.8)));
      
    //   await presale.connect(user3).claimTokensOrARefund();
    //   expect((await presaleToken.balanceOf(user3.address))).to.be.equal(ethers.utils.parseEther(String(2000000*0.5 + 2000000*0.5*0.8)));
      
    //   await presale.connect(user4).claimTokensOrARefund();
    //   expect((await presaleToken.balanceOf(user4.address))).to.be.equal(ethers.utils.parseEther(String(1000000*0.5 + 1000000*0.5*0.8)));

            
    //   // Fifth cycle 

    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   await presale.connect(user1).unlockTokens();
    //   expect((await presaleToken.balanceOf(user1.address))).to.be.equal(ethers.utils.parseEther(String(100000*0.5 + 100000*0.5*0.8)));

    //   await presale.connect(user2).claimTokensOrARefund();
    //   expect((await presaleToken.balanceOf(user2.address))).to.be.equal(ethers.utils.parseEther(String(2000000*0.5 + 2000000*0.5)));
    //   // expect((await presale.participant(user2.address)).claimed).to.be.equal(ethers.utils.parseEther(String(2000000*0.5 + 2000000*0.5)));
      
    //   await presale.connect(user3).claimTokensOrARefund();
    //   expect((await presaleToken.balanceOf(user3.address))).to.be.equal(ethers.utils.parseEther(String(2000000*0.5 + 2000000*0.5)));
    //   // expect((await presale.participant(user3.address)).claimed).to.be.equal(ethers.utils.parseEther(String(2000000*0.5 + 2000000*0.5)));
      
    //   await presale.connect(user4).claimTokensOrARefund();
    //   expect((await presaleToken.balanceOf(user4.address))).to.be.equal(ethers.utils.parseEther(String(1000000*0.5 + 1000000*0.5)));
    //   // expect((await presale.participant(user4.address)).claimed).to.be.equal(ethers.utils.parseEther(String(1000000*0.5 + 1000000*0.5)));



    //   // Sixth cycle 

    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   await presale.connect(user1).unlockTokens();
    //   expect((await presaleToken.balanceOf(user1.address))).to.be.equal(ethers.utils.parseEther(String(100000*0.5 + 100000*0.5)));

    //   await presale.connect(user1).unlockLPTokens();

    //   expect((await presaleToken.balanceOf(presale.address))).to.be.equal(ethers.utils.parseEther(String(0)));

    // })

    // it("Test with 9 decimal tooken ", async () => {

    //   let latestBlock = await ethers.provider.getBlock("latest");
    //   const OneMinute = Number(await time.duration.minutes(1));
    //   const OneDay = Number(await time.duration.days(1));
  
    //   const decimals = await bep9.decimals(); 
    //   const decimalFactor = 10 ** decimals;
    //   // console.log("decimals ", decimals);

    //   await bep9.mint(user1.address, String(8600000 * decimalFactor) );
    //   await bep9.connect(user1).approve(launchpad.address, String(8600000 * decimalFactor ));   
  
    //   await expect(launchpad.withdrawBNBs()).to.be.reverted;
  
    //   const tx = await launchpad.connect(user1).createPresale(
    //     {
    //       tokenAddress: bep9.address,
    //       decimals: 9
    //     },
    //     {
    //       presaleType: PresaleType.PUBLIC,
    //       criteriaToken: zeroAddress,
    //       minCriteriaTokens: ethers.utils.parseEther("0"),
    //       presaleRate: 10000,
    //       liquidity: 70,
    //       hardCap: ethers.utils.parseEther("500"),
    //       softCap: ethers.utils.parseEther("250"),
    //       minContribution: ethers.utils.parseEther("50"),
    //       maxContribution: ethers.utils.parseEther("200"),
    //       refundType: RefundType.BURN
    //     },
    //     {
    //       startedAt: latestBlock.timestamp + 15 * OneMinute,
    //       expiredAt: latestBlock.timestamp + 1 * OneDay,
    //       lpLockupDuration: 50 * OneMinute,
    //     },
    //     {
    //       isEnabled: true,
    //       firstReleasePC: 50,
    //       eachCycleDuration: 10,
    //       eachCyclePC: 20
    //     },
    //     {
    //       isEnabled: true,
    //       vestingTokens: 100000,
    //       firstReleaseDelay: 10,
    //       firstReleasePC: 50,
    //       eachCycleDuration: 10,
    //       eachCyclePC: 20
    //     },
    //     {
    //       logoURL: "",
    //       websiteURL: "",
    //       twitterURL: "",
    //       telegramURL: "",
    //       discordURL: "",
    //       description: ""
    //     },
    //     { value: ethers.utils.parseEther("0.20") }
  
    //   )
      
    //   let receipt: ContractReceipt = await tx.wait();
    //   const xxxx: any = receipt.events?.filter((x) => {return x.event == "PresaleCreated"})
      
    //   let presaleAddress =  xxxx[0].args.presaleAddress;
      
    //   // console.log("Tokens in presale contract ", (await presaleToken.balanceOf(presaleAddress)).toString() );
    //   expect((await bep9.balanceOf(presaleAddress)).toString()).to.be.equal(String(8600000 * decimalFactor));
      
    //   const presale_factory = await ethers.getContractFactory("Presale");
    //   presale = await presale_factory.attach(presaleAddress);
      
    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);
    //   expect((await bep9.balanceOf(presale.address))).to.be.equal(String(8600000 * decimalFactor));

    //   await network.provider.send("evm_increaseTime", [15 * OneMinute]);
    //   await network.provider.send("evm_mine");

    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

    //  //
    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("50")});
    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("50"));
    //   expect((await presale.participant(user2.address)).tokens).to.be.equal("500000");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("50"));

    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("75")});
    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("125"));
    //   expect((await presale.participant(user2.address)).tokens).to.be.equal("1250000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("125"));

    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("75")});
    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("200"));
    //   expect((await presale.participant(user2.address)).tokens).to.be.equal("2000000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("200"));     
    //   //
      
    //   //
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("50")});
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("50"));
    //   expect((await presale.participant(user3.address)).tokens).to.be.equal("500000");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("250"));
      
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("75")});
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("125"));
    //   expect((await presale.participant(user3.address)).tokens).to.be.equal("1250000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("325"));
      
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("75")});
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("200"));
    //   expect((await presale.participant(user3.address)).tokens).to.be.equal("2000000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("400"));
    //   //

    //   //
    //   await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("50")});
    //   expect((await presale.participant(user4.address)).value).to.be.equal(ethers.utils.parseEther("50"));
    //   expect((await presale.participant(user4.address)).tokens).to.be.equal("500000");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("450"));
      
    //   await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("50")});
    //   expect((await presale.participant(user4.address)).value).to.be.equal(ethers.utils.parseEther("100"));
    //   expect((await presale.participant(user4.address)).tokens).to.be.equal("1000000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("500"));
      
    //   // await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("1")});

    //   // Trying to emergency withdraw all the funds
    //   //
    //   await presale.connect(user2).emergencyWithdraw();

    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("0"));
    //   expect((await presale.participant(user2.address)).tokens).to.be.equal("0");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("300"));

    //   await presale.connect(user3).emergencyWithdraw();
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("0"));
    //   expect((await presale.participant(user3.address)).tokens).to.be.equal("0");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("100"));

    //   await presale.connect(user4).emergencyWithdraw();
    //   expect((await presale.participant(user4.address)).value).to.be.equal(ethers.utils.parseEther("0"));
    //   expect((await presale.participant(user4.address)).tokens).to.be.equal("0");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0"));     
    //   //


    //   // Again contributing
    //   //
    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("50")});
    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("50"));
    //   expect((await presale.participant(user2.address)).tokens).to.be.equal("500000");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("50"));

    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("75")});
    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("125"));
    //   expect((await presale.participant(user2.address)).tokens).to.be.equal("1250000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("125"));

    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("75")});
    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("200"));
    //   expect((await presale.participant(user2.address)).tokens).to.be.equal("2000000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("200"));     
    //   //
      
    //   //
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("50")});
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("50"));
    //   expect((await presale.participant(user3.address)).tokens).to.be.equal("500000");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("250"));
      
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("75")});
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("125"));
    //   expect((await presale.participant(user3.address)).tokens).to.be.equal("1250000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("325"));
      
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("75")});
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("200"));
    //   expect((await presale.participant(user3.address)).tokens).to.be.equal("2000000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("400"));
    //   //

    //   //
    //   await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("50")});
    //   expect((await presale.participant(user4.address)).value).to.be.equal(ethers.utils.parseEther("50"));
    //   expect((await presale.participant(user4.address)).tokens).to.be.equal("500000");      
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("450"));
      
    //   await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("50")});
    //   expect((await presale.participant(user4.address)).value).to.be.equal(ethers.utils.parseEther("100"));
    //   expect((await presale.participant(user4.address)).tokens).to.be.equal("1000000");
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("500"));
      
    //   // await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("1")});
     
    //   // Finalize the sale

    //   await presale.connect(user1).finalizePresale();
      


    // //   // Contribitors are claiming their tokens

    // //   // First cycle

    //   await presale.connect(user2).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user2.address))).to.be.equal((String(2000000*0.5 * decimalFactor + 2000000*0.5*0 * decimalFactor)));
      
    //   await presale.connect(user3).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user3.address))).to.be.equal((String(2000000*0.5 * decimalFactor + 2000000*0.5*0 * decimalFactor)));
      
    //   await presale.connect(user4).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user4.address))).to.be.equal((String(1000000*0.5 * decimalFactor + 1000000*0.5*0 * decimalFactor)));


    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   // Second cycle

    //   await presale.connect(user1).unlockTokens();
    //   expect((await bep9.balanceOf(user1.address))).to.be.equal((String(100000*0.5 * decimalFactor + 100000*0.5*0 * decimalFactor)));

    //   await presale.connect(user2).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user2.address))).to.be.equal((String(2000000*0.5 * decimalFactor + 2000000*0.5*0.2 * decimalFactor)));
      
    //   await presale.connect(user3).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user3.address))).to.be.equal((String(2000000*0.5 * decimalFactor + 2000000*0.5*0.2 * decimalFactor)));
      
    //   await presale.connect(user4).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user4.address))).to.be.equal((String(1000000*0.5 * decimalFactor + 1000000*0.5*0.2 * decimalFactor)));


    //   // Third cycle 

    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   await presale.connect(user1).unlockTokens();
    //   expect((await bep9.balanceOf(user1.address))).to.be.equal((String(100000*0.5 * decimalFactor + 100000*0.5*0.2 * decimalFactor)));

    //   await presale.connect(user2).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user2.address))).to.be.equal((String(2000000*0.5 * decimalFactor + 2000000*0.5*0.4 * decimalFactor)));
      
    //   await presale.connect(user3).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user3.address))).to.be.equal((String(2000000*0.5 * decimalFactor + 2000000*0.5*0.4 * decimalFactor)));
      
    //   await presale.connect(user4).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user4.address))).to.be.equal((String(1000000*0.5 * decimalFactor + 1000000*0.5*0.4 * decimalFactor)));



    //   // Fourth cycle 

    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   await presale.connect(user1).unlockTokens();
    //   expect((await bep9.balanceOf(user1.address))).to.be.equal((String(100000*0.5 * decimalFactor + 100000*0.5*0.4 * decimalFactor)));

    //   await presale.connect(user2).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user2.address))).to.be.equal((String(2000000*0.5 * decimalFactor + 2000000*0.5*0.6 * decimalFactor)));
      
    //   await presale.connect(user3).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user3.address))).to.be.equal((String(2000000*0.5 * decimalFactor + 2000000*0.5*0.6 * decimalFactor)));
      
    //   await presale.connect(user4).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user4.address))).to.be.equal((String(1000000*0.5 * decimalFactor + 1000000*0.5*0.6 * decimalFactor)));

            

    //   // Fifth cycle 

    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   await presale.connect(user1).unlockTokens();
    //   expect((await bep9.balanceOf(user1.address))).to.be.equal((String(100000*0.5 * decimalFactor + 100000*0.5*0.6 * decimalFactor)));

    //   await presale.connect(user2).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user2.address))).to.be.equal((String(2000000*0.5 * decimalFactor + 2000000*0.5*0.8 * decimalFactor)));
      
    //   await presale.connect(user3).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user3.address))).to.be.equal((String(2000000*0.5 * decimalFactor + 2000000*0.5*0.8 * decimalFactor)));
      
    //   await presale.connect(user4).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user4.address))).to.be.equal((String(1000000*0.5 * decimalFactor + 1000000*0.5*0.8 * decimalFactor)));

            
    //   // Fifth cycle 

    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   await presale.connect(user1).unlockTokens();
    //   expect((await bep9.balanceOf(user1.address))).to.be.equal((String(100000*0.5  * decimalFactor+ 100000*0.5*0.8 * decimalFactor)));

    //   await presale.connect(user2).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user2.address))).to.be.equal((String(2000000*0.5 * decimalFactor + 2000000*0.5 * decimalFactor)));
      
    //   await presale.connect(user3).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user3.address))).to.be.equal((String(2000000*0.5 * decimalFactor + 2000000*0.5 * decimalFactor)));
      
    //   await presale.connect(user4).claimTokensOrARefund();
    //   expect((await bep9.balanceOf(user4.address))).to.be.equal((String(1000000*0.5 * decimalFactor + 1000000*0.5 * decimalFactor)));


    //   // Sixth cycle 

    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   await presale.connect(user1).unlockTokens();
    //   expect((await bep9.balanceOf(user1.address))).to.be.equal((String(100000*0.5 * decimalFactor + 100000*0.5 * decimalFactor)));

    //   await presale.connect(user1).unlockLPTokens();

    //   expect((await bep9.balanceOf(presale.address))).to.be.equal((String(0 * decimalFactor)));

    // })
    
    // it("on seccessful presale, users can buy and claim their tokens according to contributors vesting period", async () => {


    //   let latestBlock = await ethers.provider.getBlock("latest");
    //   const OneMinute = Number(await time.duration.minutes(1));
    //   const OneDay = Number(await time.duration.days(1));

    //   await presaleToken.mint(user1.address, ethers.utils.parseEther(String(8584726 + 1000000 * 1.7)));
    //   await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther(String(8584726 + 1000000 * 1.7)));

    //   await expect(launchpad.withdrawBNBs()).to.be.reverted;

    //   const decimal = await bep9.decimals();
    //   const decimalFactor = 10**decimal;
    //   await bep9.mint(user1.address, String(8600000 * decimalFactor) );
    //   await bep9.connect(user1).approve(launchpad.address, String(8600000 * decimalFactor ));   
  
    //   await expect(launchpad.withdrawBNBs()).to.be.reverted;
  

    //   const presaleRate = 10000;

    //   const tx = await launchpad.connect(user1).createPresale(
    //     {
    //       tokenAddress: bep9.address,
    //       decimals: 9
    //     },
    //     {
    //       presaleType: PresaleType.PUBLIC,
    //       criteriaToken: zeroAddress,
    //       minCriteriaTokens: ethers.utils.parseEther("0"),
    //       presaleRate,
    //       liquidity: 70,
    //       hardCap: ethers.utils.parseEther("500"),
    //       softCap: ethers.utils.parseEther("250"),
    //       minContribution: ethers.utils.parseEther("50"),
    //       maxContribution: ethers.utils.parseEther("200"),
    //       refundType: RefundType.BURN
    //     },
    //     {
    //       startedAt: latestBlock.timestamp + 15 * OneMinute,
    //       expiredAt: latestBlock.timestamp + 1 * OneDay,
    //       lpLockupDuration: 50 * OneMinute,
    //     },
    //     {
    //       isEnabled: true,
    //       firstReleasePC: 50,
    //       eachCycleDuration: 10,
    //       eachCyclePC: 20
    //     },
    //     {
    //       isEnabled: true,
    //       vestingTokens: 100000,
    //       firstReleaseDelay: 10,
    //       firstReleasePC: 50,
    //       eachCycleDuration: 10,
    //       eachCyclePC: 20
    //     },
    //     {
    //       logoURL: "",
    //       websiteURL: "",
    //       twitterURL: "",
    //       telegramURL: "",
    //       discordURL: "",
    //       description: ""
    //     },
    //     { value: ethers.utils.parseEther("0.20") }
  
    //   )
      
    //   await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)
 
    //   let receipt: ContractReceipt = await tx.wait();
    //   const xxxx: any = receipt.events?.filter((x) => {return x.event == "PresaleCreated"})
      
    //   let presaleAddress =  xxxx[0].args.presaleAddress;
    //   const presale_factory = await ethers.getContractFactory("Presale");
    //   presale = await presale_factory.attach(presaleAddress);

    //   // expect(await presale.owner()).to.be.equal(user1.address);
    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

    //   await network.provider.send("evm_increaseTime", [15 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

    //   await presale.connect(user2).contributeToSale({value: ethers.utils.parseEther("200") });
    //   await presale.connect(user3).contributeToSale({value: ethers.utils.parseEther("200") });
    //   await presale.connect(user4).contributeToSale({value: ethers.utils.parseEther("100") });
      
    //   expect((await presale.participant(user2.address)).tokens).to.be.equal(String(presaleRate * 200 ))
    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("200"))

    //   expect((await presale.participant(user3.address)).tokens).to.be.equal(String(presaleRate * 200 ));
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("200"));

    //   // const p4 = await presale.participant(user4.address);
    //   expect((await presale.participant(user4.address)).tokens).to.be.equal(String(presaleRate * 100 ))
    //   expect((await presale.participant(user4.address)).value).to.be.equal(ethers.utils.parseEther("100"))


    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(1);
    //   await expect(presale.connect(user4).contributeToSale({value: ethers.utils.parseEther("100") })).to.be.reverted;
    //   await presale.connect(user1).finalizePresale();
    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(2);

    //   await network.provider.send("evm_increaseTime", [1 * OneDay])


    //   {
    //     expect(await bep9.balanceOf(user2.address)).to.be.equal(ethers.utils.parseEther("0"));
    //     await presale.connect(user2).claimTokensOrARefund();
    //     await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
    //     expect(await bep9.balanceOf(user2.address)).to.be.equal((String(presaleRate * 200 * decimalFactor)));

    //     expect(await bep9.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther("0"));
    //     await presale.connect(user3).claimTokensOrARefund();
    //     await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
    //     expect(await bep9.balanceOf(user3.address)).to.be.equal((String(presaleRate * 200 * decimalFactor)));

    //     expect(await bep9.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther("0"));
    //     await presale.connect(user4).claimTokensOrARefund();
    //     await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
    //     expect(await bep9.balanceOf(user4.address)).to.be.equal((String(presaleRate * 100 * decimalFactor)));

    //     await presale.connect(user1).unlockTokens()
    //     expect(await bep9.balanceOf(user1.address)).to.be.equal((String(100000 * decimalFactor)));

    //     await presale.connect(user1).unlockLPTokens()
    //   }

    //   {

    //     await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
    //     await expect(presale.connect(user1).unlockLPTokens()).to.be.reverted;
    //     await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
    //     await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
    //     await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;

    //   }


    //   // const pairaddress = await factory.getPair(presaleToken.address, WBNBAddr.address);
    //   // const UniswapV2Pair: UniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
    //   // uniswapV2Pair = UniswapV2Pair.attach(pairaddress);
    //   // console.log("uniswapV2Pair ", Number( await uniswapV2Pair.balanceOf(user1.address)))


    // });

    // it("on seccessful presale, users can buy and claim their tokens directily there is no contributors vesting", async () => {


    //   let latestBlock = await ethers.provider.getBlock("latest");
    //   const OneMinute = Number(await time.duration.minutes(1));
    //   const OneDay = Number(await time.duration.days(1));

    //   await expect(launchpad.withdrawBNBs()).to.be.reverted;

    //   const decimal = await bep9.decimals();
    //   const decimalFactor = 10**decimal;
    //   await bep9.mint(user1.address, String(8600000 * decimalFactor) );
    //   await bep9.connect(user1).approve(launchpad.address, String(8600000 * decimalFactor ));   
  
    //   await expect(launchpad.withdrawBNBs()).to.be.reverted;
  

    //   const presaleRate = 10000;

    //   const tx = await launchpad.connect(user1).createPresale(
    //     {
    //       tokenAddress: bep9.address,
    //       decimals: 9
    //     },
    //     {
    //       presaleType: PresaleType.PUBLIC,
    //       criteriaToken: zeroAddress,
    //       minCriteriaTokens: ethers.utils.parseEther("0"),
    //       presaleRate,
    //       liquidity: 70,
    //       hardCap: ethers.utils.parseEther("500"),
    //       softCap: ethers.utils.parseEther("250"),
    //       minContribution: ethers.utils.parseEther("50"),
    //       maxContribution: ethers.utils.parseEther("200"),
    //       refundType: RefundType.BURN
    //     },
    //     {
    //       startedAt: latestBlock.timestamp + 15 * OneMinute,
    //       expiredAt: latestBlock.timestamp + 1 * OneDay,
    //       lpLockupDuration: 0,
    //     },
    //     {
    //       isEnabled: false,
    //       firstReleasePC: 0,
    //       eachCycleDuration: 0,
    //       eachCyclePC: 0
    //     },
    //     {
    //       isEnabled: false,
    //       vestingTokens: 0,
    //       firstReleaseDelay: 0,
    //       firstReleasePC: 0,
    //       eachCycleDuration: 0,
    //       eachCyclePC: 0
    //     },
    //     {
    //       logoURL: "",
    //       websiteURL: "",
    //       twitterURL: "",
    //       telegramURL: "",
    //       discordURL: "",
    //       description: ""
    //     },
    //     { value: ethers.utils.parseEther("0.20") }
  
    //   )
      
    //   await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)
 
    //   let receipt: ContractReceipt = await tx.wait();
    //   const xxxx: any = receipt.events?.filter((x) => {return x.event == "PresaleCreated"})
      
    //   let presaleAddress =  xxxx[0].args.presaleAddress;
    //   const presale_factory = await ethers.getContractFactory("Presale");
    //   presale = await presale_factory.attach(presaleAddress);


    //   // expect(await presale.owner()).to.be.equal(user1.address);
    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

    //   await network.provider.send("evm_increaseTime", [15 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

    //   await presale.connect(user2).contributeToSale({value: ethers.utils.parseEther("200") });
    //   await presale.connect(user3).contributeToSale({value: ethers.utils.parseEther("200") });
    //   await presale.connect(user4).contributeToSale({value: ethers.utils.parseEther("100") });

    //   await presale.connect(user1).finalizePresale();

    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(2);


    //   expect(await bep9.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther(String(0)));
    //   await presale.connect(user2).claimTokensOrARefund();
    //   await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
    //   expect(await bep9.balanceOf(user2.address)).to.be.equal((String(presaleRate * 200 * decimalFactor)));

    //   expect(await bep9.balanceOf(user3.address)).to.be.equal(ethers.utils.parseEther(String(0)));
    //   await presale.connect(user3).claimTokensOrARefund();
    //   await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
    //   expect(await bep9.balanceOf(user3.address)).to.be.equal((String(presaleRate * 200 * decimalFactor)));

    //   expect(await bep9.balanceOf(user4.address)).to.be.equal(ethers.utils.parseEther(String(0)));
    //   await presale.connect(user4).claimTokensOrARefund();
    //   await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
    //   expect(await bep9.balanceOf(user4.address)).to.be.equal((String(presaleRate * 100 * decimalFactor)));
      
    //   await presale.connect(user1).unlockLPTokens();
    //   await expect(presale.connect(user1).unlockLPTokens()).to.be.reverted;
    //   await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
      


    // });

    // it("on unseccessful presale, users can buy and claim a refund ", async () => {


    //   let latestBlock = await ethers.provider.getBlock("latest");
    //   const OneMinute = Number(await time.duration.minutes(1));
    //   const OneDay = Number(await time.duration.days(1));

    //   const decimal = await bep9.decimals();
    //   const decimalFactor = 10**decimal;
    //   await bep9.mint(user1.address, String(8600000 * decimalFactor) );
    //   await bep9.connect(user1).approve(launchpad.address, String(8600000 * decimalFactor ));   
  
    //   await expect(launchpad.withdrawBNBs()).to.be.reverted;
  

    //   const presaleRate = 10000;

    //   const tx = await launchpad.connect(user1).createPresale(
    //     {
    //       tokenAddress: bep9.address,
    //       decimals: 9
    //     },
    //     {
    //       presaleType: PresaleType.PUBLIC,
    //       criteriaToken: zeroAddress,
    //       minCriteriaTokens: ethers.utils.parseEther("0"),
    //       presaleRate,
    //       liquidity: 70,
    //       hardCap: ethers.utils.parseEther("500"),
    //       softCap: ethers.utils.parseEther("250"),
    //       minContribution: ethers.utils.parseEther("50"),
    //       maxContribution: ethers.utils.parseEther("200"),
    //       refundType: RefundType.BURN
    //     },
    //     {
    //       startedAt: latestBlock.timestamp + 15 * OneMinute,
    //       expiredAt: latestBlock.timestamp + 1 * OneDay,
    //       lpLockupDuration: 0,
    //     },
    //     {
    //       isEnabled: false,
    //       firstReleasePC: 0,
    //       eachCycleDuration: 0,
    //       eachCyclePC: 0
    //     },
    //     {
    //       isEnabled: false,
    //       vestingTokens: 0,
    //       firstReleaseDelay: 0,
    //       firstReleasePC: 0,
    //       eachCycleDuration: 0,
    //       eachCyclePC: 0
    //     },
    //     {
    //       logoURL: "",
    //       websiteURL: "",
    //       twitterURL: "",
    //       telegramURL: "",
    //       discordURL: "",
    //       description: ""
    //     },
    //     { value: ethers.utils.parseEther("0.20") }
  
    //   )
      
    //   await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)
 
    //   let receipt: ContractReceipt = await tx.wait();
    //   const xxxx: any = receipt.events?.filter((x) => {return x.event == "PresaleCreated"})
      
    //   let presaleAddress =  xxxx[0].args.presaleAddress;
    //   const presale_factory = await ethers.getContractFactory("Presale");
    //   presale = await presale_factory.attach(presaleAddress);

    //   await network.provider.send("evm_increaseTime", [15 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("100") });
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("100") });
    //   // await presale.connect(user4).buyTokensOnPresale(10, { value: ethers.utils.parseEther(String(0.001 * 10)) });


    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(1);

    //   await network.provider.send("evm_increaseTime", [OneDay])
    //   await network.provider.send("evm_mine")

    //   await expect(presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("100") })).to.be.reverted;

    //   // console.log("Eth balance of presale", ethers.utils.formatEther(String(await provider.getBalance(presale.address))))


    //   await presale.connect(user1).finalizePresale();
    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(3);
    //   expect(await bep9.balanceOf(user1.address)).to.be.equal(String(8600000 * decimalFactor ));


    //   {
    //     expect(await bep9.balanceOf(user2.address)).to.be.equal(("0"));
    //     await expect(() => presale.connect(user2).claimTokensOrARefund())
    //       .to.changeEtherBalances(
    //         [user2, presale], 
    //         [ethers.utils.parseEther("100"), ethers.utils.parseEther("-100")]
    //       )  
    //     await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
    //     expect(await bep9.balanceOf(user2.address)).to.be.equal(("0"));


    //     expect(await bep9.balanceOf(user3.address)).to.be.equal(("0"));
    //     await expect(() => presale.connect(user3).claimTokensOrARefund())
    //       .to.changeEtherBalances(
    //         [user3, presale], 
    //         [ethers.utils.parseEther("100"), ethers.utils.parseEther("-100")]
    //       )
    //     await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
    //     expect(await bep9.balanceOf(user3.address)).to.be.equal(("0"));

    //     expect(await bep9.balanceOf(user4.address)).to.be.equal(("0"));
    //     await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
    //     expect(await bep9.balanceOf(user3.address)).to.be.equal(("0"));
    //   }

    //   expect(await provider.getBalance(presale.address)).to.be.equal("0");

    //   {
    //     await network.provider.send("evm_increaseTime", [100 * OneMinute])
    //     await network.provider.send("evm_mine")
        
    //     await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
    //     await expect(presale.connect(user2).emergencyWithdraw()).to.be.reverted;
    //     await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
    //     await expect(presale.connect(user3).emergencyWithdraw()).to.be.reverted;
    //     await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
    //     await expect(presale.connect(user4).emergencyWithdraw()).to.be.reverted;

    //     await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
    //     await expect(presale.connect(user1).unlockLPTokens()).to.be.reverted;
    //     await expect(presale.connect(user4).finalizePresale()).to.be.reverted;
    //     await expect(presale.connect(user4).cancelSale()).to.be.reverted;
    //   }


    // });

    // it("on seccessful presale, with team vesting at 100% initial release works as expected, ", async () => {


    //   let latestBlock = await ethers.provider.getBlock("latest");
    //   const OneMinute = Number(await time.duration.minutes(1));
    //   const OneDay = Number(await time.duration.days(1));


    //   const decimal = await bep9.decimals();
    //   const decimalFactor = 10**decimal;
    //   await bep9.mint(user1.address, String(8600000 * decimalFactor) );
    //   await bep9.connect(user1).approve(launchpad.address, String(8600000 * decimalFactor ));   
  
    //   await expect(launchpad.withdrawBNBs()).to.be.reverted;
  

    //   const presaleRate = 10000;

    //   const tx = await launchpad.connect(user1).createPresale(
    //     {
    //       tokenAddress: bep9.address,
    //       decimals: 9
    //     },
    //     {
    //       presaleType: PresaleType.PUBLIC,
    //       criteriaToken: zeroAddress,
    //       minCriteriaTokens: ethers.utils.parseEther("0"),
    //       presaleRate,
    //       liquidity: 70,
    //       hardCap: ethers.utils.parseEther("500"),
    //       softCap: ethers.utils.parseEther("250"),
    //       minContribution: ethers.utils.parseEther("50"),
    //       maxContribution: ethers.utils.parseEther("200"),
    //       refundType: RefundType.BURN
    //     },
    //     {
    //       startedAt: latestBlock.timestamp + 15 * OneMinute,
    //       expiredAt: latestBlock.timestamp + 1 * OneDay,
    //       lpLockupDuration: 10,
    //     },
    //     {
    //       isEnabled: false,
    //       firstReleasePC: 0,
    //       eachCycleDuration: 0,
    //       eachCyclePC: 0
    //     },
    //     {
    //       isEnabled: true,
    //       vestingTokens: 100000,
    //       firstReleaseDelay: 10,
    //       firstReleasePC: 100,
    //       eachCycleDuration: 0,
    //       eachCyclePC: 0
    //     },
    //     {
    //       logoURL: "",
    //       websiteURL: "",
    //       twitterURL: "",
    //       telegramURL: "",
    //       discordURL: "",
    //       description: ""
    //     },
    //     { value: ethers.utils.parseEther("0.20") }
  
    //   )
      
    //   await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)
 
    //   let receipt: ContractReceipt = await tx.wait();
    //   const xxxx: any = receipt.events?.filter((x) => {return x.event == "PresaleCreated"})
      
    //   let presaleAddress =  xxxx[0].args.presaleAddress;
    //   const presale_factory = await ethers.getContractFactory("Presale");
    //   presale = await presale_factory.attach(presaleAddress);

    //   // expect(await presale.owner()).to.be.equal(user1.address);
    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

    //   await network.provider.send("evm_increaseTime", [15 * OneMinute])
    //   await network.provider.send("evm_mine");

    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("200") });
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("200") });
    //   await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("100") });

    //   // console.log("Token balance of contract", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));
    //   // console.log("Token balance of user1", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));

    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(1);
    //   await presale.connect(user1).finalizePresale();
    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(2);


    //   await expect(presale.connect(user1).unlockTokens()).to.be.reverted;

    //   await network.provider.send("evm_increaseTime", [10 * OneMinute])
    //   await network.provider.send("evm_mine")

    //   await presale.connect(user1).unlockTokens();
    //   expect(await bep9.balanceOf(user1.address)).to.be.equal(String(100000 * decimalFactor));


    //   // console.log("Token balance of contract", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));
    //   // console.log("Token balance of user1", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));

    //   // const pairaddress = await factory.getPair(presaleToken.address, WBNBAddr.address);
    //   // const UniswapV2Pair: UniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
    //   // uniswapV2Pair = await UniswapV2Pair.attach(pairaddress);

    //   // console.log("cycle initially", (await presale.teamVestingRecord(0)).cycle)
    //   // console.log("tokens initially", (await presale.teamVestingRecord(0)).tokens)
    //   // console.log("releaseTime initially", (await presale.teamVestingRecord(0)).releaseTime)
    //   // console.log("percentageToRelease initially", (await presale.teamVestingRecord(0)).percentageToRelease)
    //   // console.log("releaseStatus initially", (await presale.teamVestingRecord(0)).releaseStatus)
    //   // console.log("Block timestamp ", (await ethers.provider.getBlock("latest")).timestamp)

    //   // latestBlock = await ethers.provider.getBlock("latest");
    //   // console.log("releaseTime initially", (await presale.teamVestingRecord(0)).releaseTime)

    //   // console.log("Token balance of contract", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));

    //   // await presale.connect(user1).unlockTokens()

    //   // console.log("releaseTime 1", (await presale.teamVestingRecord(1)).releaseTime)
    //   // await presale.connect(user1).unlockTokens()
    //   // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;


    //   // await network.provider.send("evm_increaseTime", [100*OneMinute])
    //   // await network.provider.send("evm_mine")
    //   // console.log("releaseTime 2", (await presale.teamVestingRecord(2)).releaseTime)
    //   // await presale.connect(user1).unlockTokens()
    //   // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;

    //   // await network.provider.send("evm_increaseTime", [10*OneMinute])
    //   // await network.provider.send("evm_mine")
    //   // console.log("releaseTime 2", (await presale.teamVestingRecord(2)).releaseTime)
    //   // await presale.connect(user1).unlockTokens()
    //   // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;

    //   // await network.provider.send("evm_increaseTime", [10*OneMinute])
    //   // await network.provider.send("evm_mine")
    //   // console.log("releaseTime 2", (await presale.teamVestingRecord(2)).releaseTime)
    //   // await presale.connect(user1).unlockTokens()
    //   // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;


    //   // await network.provider.send("evm_increaseTime", [2000*OneMinute])
    //   // await network.provider.send("evm_mine")
    //   // console.log("releaseTime 2", (await presale.teamVestingRecord(2)).releaseTime)
    //   // await presale.connect(user1).unlockTokens()
    //   // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;

    //   // await network.provider.send("evm_increaseTime", [110*OneMinute])
    //   // await network.provider.send("evm_mine")
    //   // console.log("Token balance of contract", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));
    //   // console.log("releaseTime 2", (await presale.teamVestingRecord(2)).releaseTime)
    //   // await presale.connect(user1).unlockTokens()
    //   // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;



    //   // console.log("releaseTime initially", (await presale.teamVestingRecord(0)).releaseTime)
    //   // console.log("releaseStatus initially", (await presale.teamVestingRecord(0)).releaseStatus)
    //   // console.log("Block timestamp ", (await ethers.provider.getBlock("latest")).timestamp)
    //   // await presale.connect(user1).unlockLPTokens()
    //   // console.log("releaseTime initially", (await presale.teamVestingRecord(0)).releaseTime)
    //   // console.log("releaseStatus initially", (await presale.teamVestingRecord(0)).releaseStatus)
    //   // console.log("Block timestamp ", (await ethers.provider.getBlock("latest")).timestamp)

    //   // const tokenomics = await presale.tokenomics();

    //   // console.log("Extra tokens ", ethers.utils.formatEther(String(internalData.extraTokens)));
    //   // console.log("tokenForLocker ", ethers.utils.formatEther(String(tokenomics.tokensForLocker)));

    //   // console.log("Token balance of owner", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));
    //   // console.log("Token balance of launchpad", ethers.utils.formatEther(String(await presaleToken.balanceOf(launchpad.address))));
    //   // console.log("Token balance of presale contract", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));

    //   // console.log("LP balance of owner", ethers.utils.formatEther(String(await uniswapV2Pair.balanceOf(user1.address))));
    //   // console.log("LP balance of presale contract", ethers.utils.formatEther(String(await uniswapV2Pair.balanceOf(presale.address))));


    //   // await presale.connect(user1).withdrawExtraTokens();

    //   // console.log("Token balance of owner after extra token withdraw", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));
    //   // console.log("Token balance of presale contract after extra token withdraw", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));


    //   // await network.provider.send("evm_increaseTime", [6 * OneDay])
    //   // await network.provider.send("evm_mine")
    //   // await presale.connect(user1).unlockLPTokens();
    //   // await expect(presale.connect(user1).unlockLPTokens()).to.be.reverted;

    //   // console.log("LP balance of owner after unlockLPTokens", ethers.utils.formatEther(String(await uniswapV2Pair.balanceOf(user1.address))));
    //   // console.log("LP balance of presale contract after unlockLPTokens", ethers.utils.formatEther(String(await uniswapV2Pair.balanceOf(presale.address))));


    //   // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
    //   // await network.provider.send("evm_increaseTime", [3 * OneDay])
    //   // await network.provider.send("evm_mine")
    //   // await presale.connect(user1).unlockTokens();
    //   // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;

    //   // console.log("Token balance of owner after unlockTokens", ethers.utils.formatEther(String(await presaleToken.balanceOf(user1.address))));
    //   // console.log("Token balance of presale contract after unlockTokens", ethers.utils.formatEther(String(await presaleToken.balanceOf(presale.address))));


    // });

    // it("Owner can change the sale type at any moment of the sale", async () => {

    //   let latestBlock = await ethers.provider.getBlock("latest");
    //   const OneMinute = Number(await time.duration.minutes(1));
    //   const OneDay = Number(await time.duration.days(1));

    //   const decimal = await bep9.decimals();
    //   const decimalFactor = 10**decimal;
    //   await bep9.mint(user1.address, String(8600000 * decimalFactor) );
    //   await bep9.connect(user1).approve(launchpad.address, String(8600000 * decimalFactor ));   
  
    //   await expect(launchpad.withdrawBNBs()).to.be.reverted;
  

    //   const presaleRate = 10000;

    //   const tx = await launchpad.connect(user1).createPresale(
    //     {
    //       tokenAddress: bep9.address,
    //       decimals: 9
    //     },
    //     {
    //       presaleType: PresaleType.PUBLIC,
    //       criteriaToken: zeroAddress,
    //       minCriteriaTokens: ethers.utils.parseEther("0"),
    //       presaleRate,
    //       liquidity: 70,
    //       hardCap: ethers.utils.parseEther("500"),
    //       softCap: ethers.utils.parseEther("250"),
    //       minContribution: ethers.utils.parseEther("50"),
    //       maxContribution: ethers.utils.parseEther("200"),
    //       refundType: RefundType.BURN
    //     },
    //     {
    //       startedAt: latestBlock.timestamp + 15 * OneMinute,
    //       expiredAt: latestBlock.timestamp + 1 * OneDay,
    //       lpLockupDuration: 0,
    //     },
    //     {
    //       isEnabled: false,
    //       firstReleasePC: 0,
    //       eachCycleDuration: 0,
    //       eachCyclePC: 0
    //     },
    //     {
    //       isEnabled: false,
    //       vestingTokens: 0,
    //       firstReleaseDelay: 0,
    //       firstReleasePC: 0,
    //       eachCycleDuration: 0,
    //       eachCyclePC: 0
    //     },
    //     {
    //       logoURL: "",
    //       websiteURL: "",
    //       twitterURL: "",
    //       telegramURL: "",
    //       discordURL: "",
    //       description: ""
    //     },
    //     { value: ethers.utils.parseEther("0.20") }
  
    //   )
      
    //   await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)
 
    //   let receipt: ContractReceipt = await tx.wait();
    //   const xxxx: any = receipt.events?.filter((x) => {return x.event == "PresaleCreated"})
      
    //   let presaleAddress =  xxxx[0].args.presaleAddress;
    //   const presale_factory = await ethers.getContractFactory("Presale");
    //   presale = await presale_factory.attach(presaleAddress);

    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

    //   await network.provider.send("evm_increaseTime", [15 * OneMinute])
    //   await network.provider.send("evm_mine")

    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("50") });

    //   await presale.connect(user1).chageSaleType(PresaleType.WHITELISTED, zeroAddress, 0);

    //   await expect(presale.connect(user2).contributeToSale( { value: ethers.utils.parseEther("50") })).to.be.reverted;
    //   await presale.connect(user1).whiteListUsers([user2.address]);
    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("50") });

    //   await presale.connect(user1).chageSaleType(PresaleType.TOKENHOLDERS, criteriaToken.address, ethers.utils.parseEther("200"));

    //   await expect(presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("50") })).to.be.reverted;
    //   await criteriaToken.mint(user3.address, ethers.utils.parseEther("100"))
    //   await expect(presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("50") })).to.be.reverted;
    //   await criteriaToken.mint(user3.address, ethers.utils.parseEther("100"))
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("50") });


    //   await presale.connect(user1).chageSaleType(PresaleType.PUBLIC, zeroAddress, 0);
    //   await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("50") });
    //   await presale.connect(user5).contributeToSale({ value: ethers.utils.parseEther("50") });


    //   await presale.connect(user1).chageSaleType(PresaleType.WHITELISTED, zeroAddress, 0);

    //   await expect(presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("50") })).to.be.reverted;
    //   await expect(presale.connect(user5).contributeToSale({ value: ethers.utils.parseEther("50") })).to.be.reverted;

    // });


    // it("Whitelisting works properly ", async () => {

    //   let latestBlock = await ethers.provider.getBlock("latest");
    //   const OneMinute = Number(await time.duration.minutes(1));
    //   const OneDay = Number(await time.duration.days(1));

    //   const decimal = await bep9.decimals();
    //   const decimalFactor = 10**decimal;
    //   await bep9.mint(user1.address, String(8600000 * decimalFactor) );
    //   await bep9.connect(user1).approve(launchpad.address, String(8600000 * decimalFactor ));   
  
    //   await expect(launchpad.withdrawBNBs()).to.be.reverted;
  

    //   const presaleRate = 10000;

    //   const tx = await launchpad.connect(user1).createPresale(
    //     {
    //       tokenAddress: bep9.address,
    //       decimals: 9
    //     },
    //     {
    //       presaleType: PresaleType.WHITELISTED,
    //       criteriaToken: zeroAddress,
    //       minCriteriaTokens: ethers.utils.parseEther("0"),
    //       presaleRate,
    //       liquidity: 70,
    //       hardCap: ethers.utils.parseEther("500"),
    //       softCap: ethers.utils.parseEther("250"),
    //       minContribution: ethers.utils.parseEther("50"),
    //       maxContribution: ethers.utils.parseEther("200"),
    //       refundType: RefundType.BURN
    //     },
    //     {
    //       startedAt: latestBlock.timestamp + 15 * OneMinute,
    //       expiredAt: latestBlock.timestamp + 1 * OneDay,
    //       lpLockupDuration: 0,
    //     },
    //     {
    //       isEnabled: false,
    //       firstReleasePC: 0,
    //       eachCycleDuration: 0,
    //       eachCyclePC: 0
    //     },
    //     {
    //       isEnabled: false,
    //       vestingTokens: 0,
    //       firstReleaseDelay: 0,
    //       firstReleasePC: 0,
    //       eachCycleDuration: 0,
    //       eachCyclePC: 0
    //     },
    //     {
    //       logoURL: "",
    //       websiteURL: "",
    //       twitterURL: "",
    //       telegramURL: "",
    //       discordURL: "",
    //       description: ""
    //     },
    //     { value: ethers.utils.parseEther("0.20") }
  
    //   )

    //   await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)
 
    //   let receipt: ContractReceipt = await tx.wait();
    //   const xxxx: any = receipt.events?.filter((x) => {return x.event == "PresaleCreated"})
      
    //   let presaleAddress =  xxxx[0].args.presaleAddress;
    //   const presale_factory = await ethers.getContractFactory("Presale");
    //   presale = presale_factory.attach(presaleAddress);

    //   await network.provider.send("evm_increaseTime", [15 * OneMinute + OneMinute]);
    //   await network.provider.send("evm_mine");

    //   // await presale.connect(user1).chageSaleType(PresaleType.WHITELISTED, zeroAddress, 0);
    //   await presale.connect(user1).whiteListUsers([user2.address, user3.address, user4.address, user5.address, user6.address]);
    //   expect((await presale.getWhiteListUsers())[0] ).to.be.equal(user2.address);
    //   expect((await presale.getWhiteListUsers())[1] ).to.be.equal(user3.address);
    //   expect((await presale.getWhiteListUsers())[2] ).to.be.equal(user4.address);
    //   expect((await presale.getWhiteListUsers())[3] ).to.be.equal(user5.address);
    //   expect((await presale.getWhiteListUsers())[4] ).to.be.equal(user6.address);
    //   // await expect((await presale.getWhiteListUsers())[5] ).to.be.reverted;

    //   await presale.connect(user1).removeWhiteListUsers([user5.address, user6.address]);

    //   await presale.connect(user1).whiteListUsers([user2.address, user3.address, user4.address]);
    //   expect((await presale.getWhiteListUsers())[0] ).to.be.equal(user2.address);
    //   expect((await presale.getWhiteListUsers())[1] ).to.be.equal(user3.address);
    //   expect((await presale.getWhiteListUsers())[2] ).to.be.equal(user4.address);
    //   // await expect((await presale.getWhiteListUsers())[3] ).to.be.reverted;

    
    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("50") });
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("50") });
    //   await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("50") });

    //   await expect(presale.connect(user5).contributeToSale({ value: ethers.utils.parseEther("50") })).to.be.reverted;
    //   await expect(presale.connect(user6).contributeToSale({ value: ethers.utils.parseEther("50") })).to.be.reverted;

    //   await presale.connect(user1).whiteListUsers([user5.address, user6.address, user4.address]);

    //   await presale.connect(user5).contributeToSale({ value: ethers.utils.parseEther("50") });
    //   await presale.connect(user6).contributeToSale({ value: ethers.utils.parseEther("50") });


    // });

    // it("emergencyWithdraw works properly ", async () => {

    //   let latestBlock = await ethers.provider.getBlock("latest");
    //   const OneMinute = Number(await time.duration.minutes(1));
    //   const OneDay = Number(await time.duration.days(1));

    //   const decimal = await bep9.decimals();
    //   const decimalFactor = 10**decimal;
    //   await bep9.mint(user1.address, String(8600000 * decimalFactor) );
    //   await bep9.connect(user1).approve(launchpad.address, String(8600000 * decimalFactor ));   
  
    //   await expect(launchpad.withdrawBNBs()).to.be.reverted;
  

    //   const presaleRate = 10000;

    //   const tx = await launchpad.connect(user1).createPresale(
    //     {
    //       tokenAddress: bep9.address,
    //       decimals: 9
    //     },
    //     {
    //       presaleType: PresaleType.PUBLIC,
    //       criteriaToken: zeroAddress,
    //       minCriteriaTokens: ethers.utils.parseEther("0"),
    //       presaleRate,
    //       liquidity: 70,
    //       hardCap: ethers.utils.parseEther("500"),
    //       softCap: ethers.utils.parseEther("250"),
    //       minContribution: ethers.utils.parseEther("50"),
    //       maxContribution: ethers.utils.parseEther("200"),
    //       refundType: RefundType.BURN
    //     },
    //     {
    //       startedAt: latestBlock.timestamp + 15 * OneMinute,
    //       expiredAt: latestBlock.timestamp + 1 * OneDay,
    //       lpLockupDuration: 0,
    //     },
    //     {
    //       isEnabled: false,
    //       firstReleasePC: 0,
    //       eachCycleDuration: 0,
    //       eachCyclePC: 0
    //     },
    //     {
    //       isEnabled: false,
    //       vestingTokens: 0,
    //       firstReleaseDelay: 0,
    //       firstReleasePC: 0,
    //       eachCycleDuration: 0,
    //       eachCyclePC: 0
    //     },
    //     {
    //       logoURL: "",
    //       websiteURL: "",
    //       twitterURL: "",
    //       telegramURL: "",
    //       discordURL: "",
    //       description: ""
    //     },
    //     { value: ethers.utils.parseEther("0.20") }
  
    //   )

    //   await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)
 
    //   let receipt: ContractReceipt = await tx.wait();
    //   const xxxx: any = receipt.events?.filter((x) => {return x.event == "PresaleCreated"})
      
    //   let presaleAddress =  xxxx[0].args.presaleAddress;
    //   const presale_factory = await ethers.getContractFactory("Presale");
    //   presale = presale_factory.attach(presaleAddress);

    //   await network.provider.send("evm_increaseTime", [15 * OneMinute + OneMinute]);
    //   await network.provider.send("evm_mine");

    //   // expect(await presale.owner()).to.be.equal(user1.address);
    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(0);

    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("200") });
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("200") });
    //   await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("100") });

    //   expect((await presale.presaleCounts()).contributors).to.be.equal(3);
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("500"));

    //   expect((await presale.participant(user2.address)).tokens).to.be.equal(String(200*presaleRate))
    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("200"))

    //   expect((await presale.participant(user3.address)).tokens).to.be.equal(String(200*presaleRate))
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("200"))

    //   expect((await presale.participant(user4.address)).tokens).to.be.equal(String(100*presaleRate))
    //   expect((await presale.participant(user4.address)).value).to.be.equal(ethers.utils.parseEther("100"))


    //   await expect(() => presale.connect(user2).emergencyWithdraw()).to.changeEtherBalances(
    //     [user2, launchpad], 
    //     [ethers.utils.parseEther(String(200*0.95)), ethers.utils.parseEther(String(200*0.05))]
    //   )
    //   await expect(() => presale.connect(user3).emergencyWithdraw()).to.changeEtherBalances(
    //     [user3, launchpad], 
    //     [ethers.utils.parseEther(String(200*0.95)), ethers.utils.parseEther(String(200*0.05))]
    //   )
    //   await expect(() => presale.connect(user4).emergencyWithdraw()).to.changeEtherBalances(
    //     [user4, launchpad], 
    //     [ethers.utils.parseEther(String(100*0.95)), ethers.utils.parseEther(String(100*0.05))]
    //   )

    //   expect((await presale.presaleCounts()).contributors).to.be.equal(0);
    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("0"));

    //   expect((await presale.participant(user2.address)).tokens).to.be.equal(String(0*presaleRate))
    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("0"))

    //   expect((await presale.participant(user3.address)).tokens).to.be.equal(String(0*presaleRate))
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("0"))

    //   expect((await presale.participant(user4.address)).tokens).to.be.equal(String(0*presaleRate))
    //   expect((await presale.participant(user4.address)).value).to.be.equal(ethers.utils.parseEther("0"))

    // });


    // it("Unsuccessful presale", async () => {

    //   let latestBlock = await ethers.provider.getBlock("latest");
    //   const OneMinute = Number(await time.duration.minutes(1));
    //   const OneDay = Number(await time.duration.days(1));

    //   const decimal = await bep9.decimals();
    //   const decimalFactor = 10**decimal;
    //   await bep9.mint(user1.address, String(8600000 * decimalFactor) );
    //   await bep9.connect(user1).approve(launchpad.address, String(8600000 * decimalFactor ));   
  
    //   await expect(launchpad.withdrawBNBs()).to.be.reverted;
  

    //   const presaleRate = 10000;

    //   const tx = await launchpad.connect(user1).createPresale(
    //     {
    //       tokenAddress: bep9.address,
    //       decimals: 9
    //     },
    //     {
    //       presaleType: PresaleType.PUBLIC,
    //       criteriaToken: zeroAddress,
    //       minCriteriaTokens: ethers.utils.parseEther("0"),
    //       presaleRate,
    //       liquidity: 70,
    //       hardCap: ethers.utils.parseEther("500"),
    //       softCap: ethers.utils.parseEther("400"),
    //       minContribution: ethers.utils.parseEther("25"),
    //       maxContribution: ethers.utils.parseEther("50"),
    //       refundType: RefundType.BURN
    //     },
    //     {
    //       startedAt: latestBlock.timestamp + 15 * OneMinute,
    //       expiredAt: latestBlock.timestamp + 1 * OneDay,
    //       lpLockupDuration: 0,
    //     },
    //     {
    //       isEnabled: false,
    //       firstReleasePC: 0,
    //       eachCycleDuration: 0,
    //       eachCyclePC: 0
    //     },
    //     {
    //       isEnabled: false,
    //       vestingTokens: 0,
    //       firstReleaseDelay: 0,
    //       firstReleasePC: 0,
    //       eachCycleDuration: 0,
    //       eachCyclePC: 0
    //     },
    //     {
    //       logoURL: "",
    //       websiteURL: "",
    //       twitterURL: "",
    //       telegramURL: "",
    //       discordURL: "",
    //       description: ""
    //     },
    //     { value: ethers.utils.parseEther("0.20") }
  
    //   )

    //   await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)
 
    //   let receipt: ContractReceipt = await tx.wait();
    //   const xxxx: any = receipt.events?.filter((x) => {return x.event == "PresaleCreated"})
      
    //   let presaleAddress =  xxxx[0].args.presaleAddress;
    //   const presale_factory = await ethers.getContractFactory("Presale");
    //   presale = presale_factory.attach(presaleAddress);

    //   await network.provider.send("evm_increaseTime", [15*OneMinute]);
    //   await network.provider.send("evm_mine")

    //   // user2, user3, user4 are buying 200_000 tokens each
    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("50") });
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("50") });
    //   await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("50") });
    //   await presale.connect(user5).contributeToSale({ value: ethers.utils.parseEther("50") });
    //   await presale.connect(user6).contributeToSale({ value: ethers.utils.parseEther("50") });

    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("250"))
    //   expect((await presale.presaleCounts()).contributors).to.be.equal(5)


    //   await expect(presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("50") })).to.be.reverted;
    //   await expect(presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("50") })).to.be.reverted;
    //   await expect(presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("50") })).to.be.reverted;
    //   await expect(presale.connect(user5).contributeToSale({ value: ethers.utils.parseEther("50") })).to.be.reverted;
    //   await expect(presale.connect(user6).contributeToSale({ value: ethers.utils.parseEther("50") })).to.be.reverted;

    //   expect((await presale.participant(user2.address)).tokens).to.be.equal(String(presaleRate * 50))
    //   expect((await presale.participant(user2.address)).value).to.be.equal(ethers.utils.parseEther("50"))

    //   expect((await presale.participant(user3.address)).tokens).to.be.equal(String(presaleRate * 50))
    //   expect((await presale.participant(user3.address)).value).to.be.equal(ethers.utils.parseEther("50"))

    //   expect((await presale.participant(user4.address)).tokens).to.be.equal(String(presaleRate * 50))
    //   expect((await presale.participant(user4.address)).value).to.be.equal(ethers.utils.parseEther("50"))

    //   expect((await presale.participant(user5.address)).tokens).to.be.equal(String(presaleRate * 50))
    //   expect((await presale.participant(user5.address)).value).to.be.equal(ethers.utils.parseEther("50"))

    //   expect((await presale.participant(user6.address)).tokens).to.be.equal(String(presaleRate * 50))
    //   expect((await presale.participant(user6.address)).value).to.be.equal(ethers.utils.parseEther("50"))


    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(1);

    //   await network.provider.send("evm_increaseTime", [OneDay])
    //   await network.provider.send("evm_mine")

    //   await expect(() => presale.connect(user1).finalizePresale()).to.changeEtherBalances(
    //     [presale, user1, launchpad],
    //     [
    //       ethers.utils.parseEther("0"),
    //       ethers.utils.parseEther("0"),
    //       ethers.utils.parseEther("0")
    //     ]
    //   )
    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(3);
    //   expect(await provider.getBalance(presale.address)).to.be.equal(ethers.utils.parseEther("250"));
    //   expect(await bep9.balanceOf(presale.address)).to.be.equal(0);
    //   expect(await bep9.balanceOf(user1.address)).to.be.equal(String(8600000 * decimalFactor ));


    //   await expect(() => presale.connect(user2).claimTokensOrARefund()).to.changeEtherBalances(
    //     [user2, presale],
    //     [
    //       ethers.utils.parseEther("50"),
    //       ethers.utils.parseEther("-50"),
    //     ]
    //   )
    //   await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
    //   expect((await presale.presaleCounts()).claimsCount).to.be.equal(1);


    //   await expect(() => presale.connect(user3).claimTokensOrARefund()).to.changeEtherBalances(
    //     [user3, presale],
    //     [
    //       ethers.utils.parseEther("50"),
    //       ethers.utils.parseEther("-50"),
    //     ]
    //   )
    //   await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
    //   expect((await presale.presaleCounts()).claimsCount).to.be.equal(2);


    //   await expect(() => presale.connect(user4).claimTokensOrARefund()).to.changeEtherBalances(
    //     [user4, presale],
    //     [
    //       ethers.utils.parseEther("50"),
    //       ethers.utils.parseEther("-50"),
    //     ]
    //   )
    //   await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
    //   expect((await presale.presaleCounts()).claimsCount).to.be.equal(3);


    //   await expect(() => presale.connect(user5).claimTokensOrARefund()).to.changeEtherBalances(
    //     [user5, presale],
    //     [
    //       ethers.utils.parseEther("50"),
    //       ethers.utils.parseEther("-50"),
    //     ]
    //   )
    //   await expect(presale.connect(user5).claimTokensOrARefund()).to.be.reverted;
    //   expect((await presale.presaleCounts()).claimsCount).to.be.equal(4);


    //   await expect(() => presale.connect(user6).claimTokensOrARefund()).to.changeEtherBalances(
    //     [user6, presale],
    //     [
    //       ethers.utils.parseEther("50"),
    //       ethers.utils.parseEther("-50"),
    //     ]
    //   )
    //   await expect(presale.connect(user6).claimTokensOrARefund()).to.be.reverted;
    //   expect((await presale.presaleCounts()).claimsCount).to.be.equal(5);
      
    //   await expect(presale.connect(user1).unlockLPTokens()).to.be.reverted;
    //   await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
      
      
    //   // Project completed

    // });


    // it("Canceled presale", async () => {

    //   let latestBlock = await ethers.provider.getBlock("latest");
    //   const OneMinute = Number(await time.duration.minutes(1));
    //   const OneDay = Number(await time.duration.days(1));

    //   const decimal = await bep9.decimals();
    //   const decimalFactor = 10**decimal;
    //   await bep9.mint(user1.address, String(8600000 * decimalFactor) );
    //   await bep9.connect(user1).approve(launchpad.address, String(8600000 * decimalFactor ));   
  
    //   await expect(launchpad.withdrawBNBs()).to.be.reverted;
  

    //   const presaleRate = 10000;

    //   const tx = await launchpad.connect(user1).createPresale(
    //     {
    //       tokenAddress: bep9.address,
    //       decimals: 9
    //     },
    //     {
    //       presaleType: PresaleType.PUBLIC,
    //       criteriaToken: zeroAddress,
    //       minCriteriaTokens: ethers.utils.parseEther("0"),
    //       presaleRate,
    //       liquidity: 70,
    //       hardCap: ethers.utils.parseEther("500"),
    //       softCap: ethers.utils.parseEther("400"),
    //       minContribution: ethers.utils.parseEther("25"),
    //       maxContribution: ethers.utils.parseEther("50"),
    //       refundType: RefundType.BURN
    //     },
    //     {
    //       startedAt: latestBlock.timestamp + 15 * OneMinute,
    //       expiredAt: latestBlock.timestamp + 1 * OneDay,
    //       lpLockupDuration: 0,
    //     },
    //     {
    //       isEnabled: false,
    //       firstReleasePC: 0,
    //       eachCycleDuration: 0,
    //       eachCyclePC: 0
    //     },
    //     {
    //       isEnabled: false,
    //       vestingTokens: 0,
    //       firstReleaseDelay: 0,
    //       firstReleasePC: 0,
    //       eachCycleDuration: 0,
    //       eachCyclePC: 0
    //     },
    //     {
    //       logoURL: "",
    //       websiteURL: "",
    //       twitterURL: "",
    //       telegramURL: "",
    //       discordURL: "",
    //       description: ""
    //     },
    //     { value: ethers.utils.parseEther("0.20") }
  
    //   )

    //   await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)
 
    //   let receipt: ContractReceipt = await tx.wait();
    //   const xxxx: any = receipt.events?.filter((x) => {return x.event == "PresaleCreated"})
      
    //   let presaleAddress =  xxxx[0].args.presaleAddress;
    //   const presale_factory = await ethers.getContractFactory("Presale");
    //   presale = presale_factory.attach(presaleAddress);

    //   await network.provider.send("evm_increaseTime", [15*OneMinute]);
    //   await network.provider.send("evm_mine")

    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("50") });
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("50") });
    //   await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("50") });
    //   await presale.connect(user5).contributeToSale({ value: ethers.utils.parseEther("50") });
    //   await presale.connect(user6).contributeToSale({ value: ethers.utils.parseEther("50") });

    //   expect((await presale.presaleCounts()).accumulatedBalance).to.be.equal(ethers.utils.parseEther("250"))
    //   expect((await presale.presaleCounts()).contributors).to.be.equal(5)


    //   await expect(presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("50") })).to.be.reverted;
    //   await expect(presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("50") })).to.be.reverted;
    //   await expect(presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("50") })).to.be.reverted;
    //   await expect(presale.connect(user5).contributeToSale({ value: ethers.utils.parseEther("50") })).to.be.reverted;
    //   await expect(presale.connect(user6).contributeToSale({ value: ethers.utils.parseEther("50") })).to.be.reverted;


    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(1);

    //   await expect(() => presale.connect(user1).cancelSale()).to.changeEtherBalances(
    //     [presale, user1, launchpad],
    //     [
    //       ethers.utils.parseEther("0"),
    //       ethers.utils.parseEther("0"),
    //       ethers.utils.parseEther("0")
    //     ]
    //   )
    //   expect((await presale.presaleInfo()).preSaleStatus).to.be.equal(4);
    //   expect(await provider.getBalance(presale.address)).to.be.equal(ethers.utils.parseEther("250"));
    //   expect(await bep9.balanceOf(presale.address)).to.be.equal(0);
    //   expect(await bep9.balanceOf(user1.address)).to.be.equal(String(8600000 * decimalFactor ));


    //   await expect(() => presale.connect(user2).claimTokensOrARefund()).to.changeEtherBalances(
    //     [user2, presale],
    //     [
    //       ethers.utils.parseEther("50"),
    //       ethers.utils.parseEther("-50"),
    //     ]
    //   )
    //   await expect(presale.connect(user2).claimTokensOrARefund()).to.be.reverted;
    //   expect((await presale.presaleCounts()).claimsCount).to.be.equal(1);


    //   await expect(() => presale.connect(user3).claimTokensOrARefund()).to.changeEtherBalances(
    //     [user3, presale],
    //     [
    //       ethers.utils.parseEther("50"),
    //       ethers.utils.parseEther("-50"),
    //     ]
    //   )
    //   await expect(presale.connect(user3).claimTokensOrARefund()).to.be.reverted;
    //   expect((await presale.presaleCounts()).claimsCount).to.be.equal(2);


    //   await expect(() => presale.connect(user4).claimTokensOrARefund()).to.changeEtherBalances(
    //     [user4, presale],
    //     [
    //       ethers.utils.parseEther("50"),
    //       ethers.utils.parseEther("-50"),
    //     ]
    //   )
    //   await expect(presale.connect(user4).claimTokensOrARefund()).to.be.reverted;
    //   expect((await presale.presaleCounts()).claimsCount).to.be.equal(3);


    //   await expect(() => presale.connect(user5).claimTokensOrARefund()).to.changeEtherBalances(
    //     [user5, presale],
    //     [
    //       ethers.utils.parseEther("50"),
    //       ethers.utils.parseEther("-50"),
    //     ]
    //   )
    //   await expect(presale.connect(user5).claimTokensOrARefund()).to.be.reverted;
    //   expect((await presale.presaleCounts()).claimsCount).to.be.equal(4);


    //   await expect(() => presale.connect(user6).claimTokensOrARefund()).to.changeEtherBalances(
    //     [user6, presale],
    //     [
    //       ethers.utils.parseEther("50"),
    //       ethers.utils.parseEther("-50"),
    //     ]
    //   )
    //   await expect(presale.connect(user6).claimTokensOrARefund()).to.be.reverted;
    //   expect((await presale.presaleCounts()).claimsCount).to.be.equal(5);
      
    //   await expect(presale.connect(user1).unlockLPTokens()).to.be.reverted;
    //   await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
      
      
    //   // Project completed

    // });


    // it("Events ", async () => {

    //   let latestBlock = await ethers.provider.getBlock("latest");
    //   const OneMinute = Number(await time.duration.minutes(1));
    //   const OneDay = Number(await time.duration.days(1));

    //   const decimal = await bep9.decimals();
    //   const decimalFactor = 10**decimal;
    //   await bep9.mint(user1.address, String(8600000 * decimalFactor) );
    //   await bep9.connect(user1).approve(launchpad.address, String(8600000 * decimalFactor ));   
  
    //   await expect(launchpad.withdrawBNBs()).to.be.reverted;
  

    //   const presaleRate = 10000;

    //   let tx = await launchpad.connect(user1).createPresale(
    //     {
    //       tokenAddress: bep9.address,
    //       decimals: 9
    //     },
    //     {
    //       presaleType: PresaleType.PUBLIC,
    //       criteriaToken: zeroAddress,
    //       minCriteriaTokens: ethers.utils.parseEther("0"),
    //       presaleRate,
    //       liquidity: 70,
    //       hardCap: ethers.utils.parseEther("500"),
    //       softCap: ethers.utils.parseEther("250"),
    //       minContribution: ethers.utils.parseEther("25"),
    //       maxContribution: ethers.utils.parseEther("100"),
    //       refundType: RefundType.BURN
    //     },
    //     {
    //       startedAt: latestBlock.timestamp + 15 * OneMinute,
    //       expiredAt: latestBlock.timestamp + 1 * OneDay,
    //       lpLockupDuration: 0,
    //     },
    //     {
    //       isEnabled: false,
    //       firstReleasePC: 0,
    //       eachCycleDuration: 0,
    //       eachCyclePC: 0
    //     },
    //     {
    //       isEnabled: false,
    //       vestingTokens: 0,
    //       firstReleaseDelay: 0,
    //       firstReleasePC: 0,
    //       eachCycleDuration: 0,
    //       eachCyclePC: 0
    //     },
    //     {
    //       logoURL: "",
    //       websiteURL: "",
    //       twitterURL: "",
    //       telegramURL: "",
    //       discordURL: "",
    //       description: ""
    //     },
    //     { value: ethers.utils.parseEther("0.20") }
  
    //   )


    //   // event Claimed(address contributor, uint value, uint tokens);
    //   // event SaleTypeChanged(LaunchPadLib.PresaleType);
  


    //   await expect(() => launchpad.withdrawBNBs()).to.changeEtherBalance(launchpad, `-${ethers.utils.parseEther("0.20")}`)
 
    //   let receipt: ContractReceipt = await tx.wait();
    //   let xxxx: any = receipt.events?.filter((x) => {return x.event == "PresaleCreated"})
      
    //   let presaleAddress =  xxxx[0].args.presaleAddress;
    //   const presale_factory = await ethers.getContractFactory("Presale");
    //   presale = presale_factory.attach(presaleAddress);

    //   await network.provider.send("evm_increaseTime", [15*OneMinute]);
    //   await network.provider.send("evm_mine")

      
    //   // event ContributionsAdded(address contributor, uint amount, uint requestedTokens);

    //   await expect(presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("50") }))
    //   .to.emit(presale, "ContributionsAdded").withArgs(user2.address, ethers.utils.parseEther("50"), String(presaleRate * 50));

    //   await expect(presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("50") }))
    //   .to.emit(presale, "ContributionsAdded").withArgs(user3.address, ethers.utils.parseEther("50"), String(presaleRate * 50));

    //   await expect(presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("50") }))
    //   .to.emit(presale, "ContributionsAdded").withArgs(user4.address, ethers.utils.parseEther("50"), String(presaleRate * 50));

    //   await expect(presale.connect(user5).contributeToSale({ value: ethers.utils.parseEther("50") }))
    //   .to.emit(presale, "ContributionsAdded").withArgs(user5.address, ethers.utils.parseEther("50"), String(presaleRate * 50));

    //   await expect(presale.connect(user6).contributeToSale({ value: ethers.utils.parseEther("50") }))
    //   .to.emit(presale, "ContributionsAdded").withArgs(user6.address, ethers.utils.parseEther("50"), String(presaleRate * 50));


    //   // event ContributionsRemoved(address contributor, uint amount);

    //   await expect(presale.connect(user2).emergencyWithdraw())
    //   .to.emit(presale, "ContributionsRemoved").withArgs(user2.address, ethers.utils.parseEther("50"));

    //   await expect(presale.connect(user3).emergencyWithdraw())
    //   .to.emit(presale, "ContributionsRemoved").withArgs(user3.address, ethers.utils.parseEther("50"));

    //   await expect(presale.connect(user4).emergencyWithdraw())
    //   .to.emit(presale, "ContributionsRemoved").withArgs(user4.address, ethers.utils.parseEther("50"));

    //   await expect(presale.connect(user5).emergencyWithdraw())
    //   .to.emit(presale, "ContributionsRemoved").withArgs(user5.address, ethers.utils.parseEther("50"));

    //   await expect(presale.connect(user6).emergencyWithdraw())
    //   .to.emit(presale, "ContributionsRemoved").withArgs(user6.address, ethers.utils.parseEther("50"));


    //   await presale.connect(user2).contributeToSale({ value: ethers.utils.parseEther("100") });
    //   await presale.connect(user3).contributeToSale({ value: ethers.utils.parseEther("100") });
    //   await presale.connect(user4).contributeToSale({ value: ethers.utils.parseEther("100") });
    //   await presale.connect(user5).contributeToSale({ value: ethers.utils.parseEther("100") });
    //   await presale.connect(user6).contributeToSale({ value: ethers.utils.parseEther("100") });


    //   // event SaleTypeChanged(LaunchPadLib.PresaleType _type, address _address, uint minimumTokens);

    //   await expect(presale.connect(user1).chageSaleType(PresaleType.WHITELISTED, criteriaToken.address, 1000))
    //   .to.emit(presale, "SaleTypeChanged").withArgs(PresaleType.WHITELISTED, criteriaToken.address, 1000);


    //   // event Finalized(LaunchPadLib.PreSaleStatus status, uint finalizedTime);

    //   latestBlock = await ethers.provider.getBlock("latest");
    //   await expect(presale.connect(user1).finalizePresale())
    //   .to.emit(presale, "Finalized").withArgs(2, latestBlock.timestamp+1);



    //   // event Claimed(address contributor, uint value, uint tokens);

    //   await expect(presale.connect(user2).claimTokensOrARefund())
    //   .to.emit(presale, "Claimed").withArgs(user2.address, 0, presaleRate*100);

    //   await expect(presale.connect(user3).claimTokensOrARefund())
    //   .to.emit(presale, "Claimed").withArgs(user3.address, 0, presaleRate*100);
      
    //   await expect(presale.connect(user4).claimTokensOrARefund())
    //   .to.emit(presale, "Claimed").withArgs(user4.address, 0, presaleRate*100);
      
    //   await expect(presale.connect(user5).claimTokensOrARefund())
    //   .to.emit(presale, "Claimed").withArgs(user5.address, 0, presaleRate*100);

    //   await expect(presale.connect(user6).claimTokensOrARefund())
    //   .to.emit(presale, "Claimed").withArgs(user6.address, 0, presaleRate*100);


      
    //   // await expect(presale.connect(user1).unlockLPTokens()).to.be.reverted;
    //   // await expect(presale.connect(user1).unlockTokens()).to.be.reverted;
      
      
    //   // Project completed

    // });



    // it("Can't start a sale with wrong data provided", async () => {

    //   let latestBlock = await ethers.provider.getBlock("latest")
    //   const OneDay = Number(await time.duration.days(1));
    //   const OneMinute = Number(await time.duration.minutes(1));     

    //   //Presale project address can't be null
    //   await expect(
    //     launchpad.connect(user1).createPresale(
    //       {
    //         id: 0,
    //         presaleOwner: user1.address,
    //         preSaleStatus: 0,
    //         preSaleToken: zeroAddress,
    //         decimals: 18
    //       },
    //       {
    //         tokensForSale: 100,                                          // 1000
    //         tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
    //         typeOfPresale: PresaleType.PUBLIC,
    //         priceOfEachToken: ethers.utils.parseEther("0.001"),
    //         criteriaToken: zeroAddress,
    //         minTokensForParticipation: ethers.utils.parseEther("0"),
    //         refundType: RefundType.BURN
    //       },
    //       {
    //         startedAt: latestBlock.timestamp + 15 * OneMinute,
    //         expiredAt: latestBlock.timestamp + 1 * OneDay,
    //         lpLockupDuration: 10 * OneMinute,
    //       },
    //       {
    //         minTokensReq: 10,
    //         maxTokensReq: 20,
    //         softCap: 50
    //       },
    //       {
    //         isEnabled: true,
    //         firstReleasePC: 20,
    //         vestingPeriodOfEachCycle: 10,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         isEnabled: false,
    //         vestingTokens: 100,
    //         firstReleaseTime: 100,
    //         firstReleasePC: 50,
    //         vestingPeriodOfEachCycle: 100,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         logoURL: "",
    //         websiteURL: "",
    //         twitterURL: "",
    //         telegramURL: "",
    //         discordURL: "",
    //         description: ""
    //       },    
    //       { value: ethers.utils.parseEther("0.20") }
    
    //     )
    //   ).to.be.reverted;

    //   //criteria token project address can't be null
    //   await expect(
    //     launchpad.connect(user1).createPresale(
    //       {
    //         id: 0,
    //         presaleOwner: user1.address,
    //         preSaleStatus: 0,
    //         preSaleToken: zeroAddress,
    //         decimals: 18
    //       },
    //       {
    //         tokensForSale: 100,                                          // 1000
    //         tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
    //         typeOfPresale: PresaleType.TOKENHOLDERS,
    //         priceOfEachToken: ethers.utils.parseEther("0.001"),
    //         criteriaToken: zeroAddress,
    //         minTokensForParticipation: ethers.utils.parseEther("0"),
    //         refundType: RefundType.BURN
    //       },
    //       {
    //         startedAt: latestBlock.timestamp + 15 * OneMinute,
    //         expiredAt: latestBlock.timestamp + 1 * OneDay,
    //         lpLockupDuration: 10 * OneMinute,
    //       },
    //       {
    //         minTokensReq: 10,
    //         maxTokensReq: 20,
    //         softCap: 50
    //       },
    //       {
    //         isEnabled: true,
    //         firstReleasePC: 20,
    //         vestingPeriodOfEachCycle: 10,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         isEnabled: false,
    //         vestingTokens: 100,
    //         firstReleaseTime: 100,
    //         firstReleasePC: 50,
    //         vestingPeriodOfEachCycle: 100,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         logoURL: "",
    //         websiteURL: "",
    //         twitterURL: "",
    //         telegramURL: "",
    //         discordURL: "",
    //         description: ""
    //       },  
    //       { value: ethers.utils.parseEther("0.20") }
    
    //     )
    //   ).to.be.reverted;

    //   // liquidity should be at least 20% or more
    //   await expect(
    //     launchpad.connect(user1).createPresale(
    //       {
    //         id: 0,
    //         presaleOwner: user1.address,
    //         preSaleStatus: 0,
    //         preSaleToken: zeroAddress,
    //         decimals: 18
    //       },
    //       {
    //         tokensForSale: 100,                                          // 1000
    //         tokensPCForLP: 19,                                           // 70% = 0.7   =>   1700/1.7 = 700
    //         typeOfPresale: PresaleType.PUBLIC,
    //         priceOfEachToken: ethers.utils.parseEther("0.001"),
    //         criteriaToken: zeroAddress,
    //         minTokensForParticipation: ethers.utils.parseEther("0"),
    //         refundType: RefundType.BURN
    //       },
    //       {
    //         startedAt: latestBlock.timestamp + 15 * OneMinute,
    //         expiredAt: latestBlock.timestamp + 1 * OneDay,
    //         lpLockupDuration: 10 * OneMinute,
    //       },
    //       {
    //         minTokensReq: 10,
    //         maxTokensReq: 20,
    //         softCap: 50
    //       },
    //       {
    //         isEnabled: true,
    //         firstReleasePC: 20,
    //         vestingPeriodOfEachCycle: 10,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         isEnabled: false,
    //         vestingTokens: 100,
    //         firstReleaseTime: 100,
    //         firstReleasePC: 50,
    //         vestingPeriodOfEachCycle: 100,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         logoURL: "",
    //         websiteURL: "",
    //         twitterURL: "",
    //         telegramURL: "",
    //         discordURL: "",
    //         description: ""
    //       },  
    //       { value: ethers.utils.parseEther("0.20") }
    
    //     )
    //   ).to.be.reverted;

    //   // liquidity should be at least 50% or more
    //   await expect(
    //     launchpad.connect(user1).createPresale(
    //       {
    //         id: 0,
    //         presaleOwner: user1.address,
    //         preSaleStatus: 0,
    //         preSaleToken: zeroAddress,
    //         decimals: 18
    //       },
    //       {
    //         tokensForSale: 100,                                          // 1000
    //         tokensPCForLP: 100,                                           // 70% = 0.7   =>   1700/1.7 = 700
    //         typeOfPresale: PresaleType.PUBLIC,
    //         priceOfEachToken: ethers.utils.parseEther("0.001"),
    //         criteriaToken: zeroAddress,
    //         minTokensForParticipation: ethers.utils.parseEther("0"),
    //         refundType: RefundType.BURN
    //       },
    //       {
    //         startedAt: latestBlock.timestamp + 15 * OneMinute,
    //         expiredAt: latestBlock.timestamp + 1 * OneDay,
    //         lpLockupDuration: 10 * OneMinute,
    //       },
    //       {
    //         minTokensReq: 10,
    //         maxTokensReq: 20,
    //         softCap: 50
    //       },
    //       {
    //         isEnabled: true,
    //         firstReleasePC: 20,
    //         vestingPeriodOfEachCycle: 10,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         isEnabled: false,
    //         vestingTokens: 100,
    //         firstReleaseTime: 100,
    //         firstReleasePC: 50,
    //         vestingPeriodOfEachCycle: 100,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         logoURL: "",
    //         websiteURL: "",
    //         twitterURL: "",
    //         telegramURL: "",
    //         discordURL: "",
    //         description: ""
    //       },  
    //       { value: ethers.utils.parseEther("0.20") }
    
    //     )
    //   ).to.be.reverted;

    //   // softcap should be at least 50% or more
    //   await expect(
    //     launchpad.connect(user1).createPresale(
    //       {
    //         id: 0,
    //         presaleOwner: user1.address,
    //         preSaleStatus: 0,
    //         preSaleToken: zeroAddress,
    //         decimals: 18
    //       },
    //       {
    //         tokensForSale: 100,                                          // 1000
    //         tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
    //         typeOfPresale: PresaleType.PUBLIC,
    //         priceOfEachToken: ethers.utils.parseEther("0.001"),
    //         criteriaToken: zeroAddress,
    //         minTokensForParticipation: ethers.utils.parseEther("0"),
    //         refundType: RefundType.BURN
    //       },
    //       {
    //         startedAt: latestBlock.timestamp + 15 * OneMinute,
    //         expiredAt: latestBlock.timestamp + 1 * OneDay,
    //         lpLockupDuration: 10 * OneMinute,
    //       },
    //       {
    //         minTokensReq: 10,
    //         maxTokensReq: 20,
    //         softCap: 49
    //       },
    //       {
    //         isEnabled: true,
    //         firstReleasePC: 20,
    //         vestingPeriodOfEachCycle: 10,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         isEnabled: false,
    //         vestingTokens: 100,
    //         firstReleaseTime: 100,
    //         firstReleasePC: 50,
    //         vestingPeriodOfEachCycle: 100,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         logoURL: "",
    //         websiteURL: "",
    //         twitterURL: "",
    //         telegramURL: "",
    //         discordURL: "",
    //         description: ""
    //       },  
    //       { value: ethers.utils.parseEther("0.20") }
    
    //     )
    //   ).to.be.reverted;

    //   //tokens for sale must be more than 0
    //   await expect(
    //     launchpad.connect(user1).createPresale(
    //       {
    //         id: 0,
    //         presaleOwner: user1.address,
    //         preSaleStatus: 0,
    //         preSaleToken: zeroAddress,
    //         decimals: 18
    //       },
    //       {
    //         tokensForSale: 0,                                          // 1000
    //         tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
    //         typeOfPresale: PresaleType.PUBLIC,
    //         priceOfEachToken: ethers.utils.parseEther("0.001"),
    //         criteriaToken: zeroAddress,
    //         minTokensForParticipation: ethers.utils.parseEther("0"),
    //         refundType: RefundType.BURN
    //       },
    //       {
    //         startedAt: latestBlock.timestamp + 15 * OneMinute,
    //         expiredAt: latestBlock.timestamp + 1 * OneDay,
    //         lpLockupDuration: 10 * OneMinute,
    //       },
    //       {
    //         minTokensReq: 10,
    //         maxTokensReq: 20,
    //         softCap: 50
    //       },
    //       {
    //         isEnabled: true,
    //         firstReleasePC: 20,
    //         vestingPeriodOfEachCycle: 10,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         isEnabled: false,
    //         vestingTokens: 100,
    //         firstReleaseTime: 100,
    //         firstReleasePC: 50,
    //         vestingPeriodOfEachCycle: 100,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         logoURL: "",
    //         websiteURL: "",
    //         twitterURL: "",
    //         telegramURL: "",
    //         discordURL: "",
    //         description: ""
    //       },  
    //       { value: ethers.utils.parseEther("0.20") }
    
    //     )
    //   ).to.be.reverted;

    //   //_minTokensReq should be more than zero
    //   await expect(
    //     launchpad.connect(user1).createPresale(
    //       {
    //         id: 0,
    //         presaleOwner: user1.address,
    //         preSaleStatus: 0,
    //         preSaleToken: zeroAddress,
    //         decimals: 18
    //       },
    //       {
    //         tokensForSale: 100,                                          // 1000
    //         tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
    //         typeOfPresale: PresaleType.PUBLIC,
    //         priceOfEachToken: ethers.utils.parseEther("0.001"),
    //         criteriaToken: zeroAddress,
    //         minTokensForParticipation: ethers.utils.parseEther("0"),
    //         refundType: RefundType.BURN
    //       },
    //       {
    //         startedAt: latestBlock.timestamp + 15 * OneMinute,
    //         expiredAt: latestBlock.timestamp + 1 * OneDay,
    //         lpLockupDuration: 10 * OneMinute,
    //       },
    //       {
    //         minTokensReq: 0,
    //         maxTokensReq: 20,
    //         softCap: 50
    //       },
    //       {
    //         isEnabled: true,
    //         firstReleasePC: 20,
    //         vestingPeriodOfEachCycle: 10,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         isEnabled: false,
    //         vestingTokens: 100,
    //         firstReleaseTime: 100,
    //         firstReleasePC: 50,
    //         vestingPeriodOfEachCycle: 100,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         logoURL: "",
    //         websiteURL: "",
    //         twitterURL: "",
    //         telegramURL: "",
    //         discordURL: "",
    //         description: ""
    //       },  
    //       { value: ethers.utils.parseEther("0.20") }
    
    //     )
    //   ).to.be.reverted;


    //   //_maxTokensReq > _minTokensReq
    //   await expect(
    //     launchpad.connect(user1).createPresale(
    //       {
    //         id: 0,
    //         presaleOwner: user1.address,
    //         preSaleStatus: 0,
    //         preSaleToken: zeroAddress,
    //         decimals: 18
    //       },
    //       {
    //         tokensForSale: 100,                                          // 1000
    //         tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
    //         typeOfPresale: PresaleType.PUBLIC,
    //         priceOfEachToken: ethers.utils.parseEther("0.001"),
    //         criteriaToken: zeroAddress,
    //         minTokensForParticipation: ethers.utils.parseEther("0"),
    //         refundType: RefundType.BURN
    //       },
    //       {
    //         startedAt: latestBlock.timestamp + 15 * OneMinute,
    //         expiredAt: latestBlock.timestamp + 1 * OneDay,
    //         lpLockupDuration: 10 * OneMinute,
    //       },
    //       {
    //         minTokensReq: 30,
    //         maxTokensReq: 20,
    //         softCap: 50
    //       },
    //       {
    //         isEnabled: true,
    //         firstReleasePC: 20,
    //         vestingPeriodOfEachCycle: 10,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         isEnabled: false,
    //         vestingTokens: 100,
    //         firstReleaseTime: 100,
    //         firstReleasePC: 50,
    //         vestingPeriodOfEachCycle: 100,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         logoURL: "",
    //         websiteURL: "",
    //         twitterURL: "",
    //         telegramURL: "",
    //         discordURL: "",
    //         description: ""
    //       },  
    //       { value: ethers.utils.parseEther("0.20") }
    
    //     )
    //   ).to.be.reverted;

    //   //_priceOfEachToken should be more than zero
    //   await expect(
    //     launchpad.connect(user1).createPresale(
    //       {
    //         id: 0,
    //         presaleOwner: user1.address,
    //         preSaleStatus: 0,
    //         preSaleToken: zeroAddress,
    //         decimals: 18
    //       },
    //       {
    //         tokensForSale: 100,                                          // 1000
    //         tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
    //         typeOfPresale: PresaleType.PUBLIC,
    //         priceOfEachToken: ethers.utils.parseEther("0.0"),
    //         criteriaToken: zeroAddress,
    //         minTokensForParticipation: ethers.utils.parseEther("0"),
    //         refundType: RefundType.BURN
    //       },
    //       {
    //         startedAt: latestBlock.timestamp + 15 * OneMinute,
    //         expiredAt: latestBlock.timestamp + 1 * OneDay,
    //         lpLockupDuration: 10 * OneMinute,
    //       },
    //       {
    //         minTokensReq: 10,
    //         maxTokensReq: 20,
    //         softCap: 50
    //       },
    //       {
    //         isEnabled: true,
    //         firstReleasePC: 20,
    //         vestingPeriodOfEachCycle: 10,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         isEnabled: false,
    //         vestingTokens: 100,
    //         firstReleaseTime: 100,
    //         firstReleasePC: 50,
    //         vestingPeriodOfEachCycle: 100,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         logoURL: "",
    //         websiteURL: "",
    //         twitterURL: "",
    //         telegramURL: "",
    //         discordURL: "",
    //         description: ""
    //       },  
    //       { value: ethers.utils.parseEther("0.20") }
    
    //     )
    //   ).to.be.reverted;

    //   // Unable to transfer presale tokens to the contract
    //   await expect(
    //     launchpad.connect(user1).createPresale(
    //       {
    //         id: 0,
    //         presaleOwner: user1.address,
    //         preSaleStatus: 0,
    //         preSaleToken: zeroAddress,
    //         decimals: 18
    //       },
    //       {
    //         tokensForSale: 100,                                          // 1000
    //         tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
    //         typeOfPresale: PresaleType.PUBLIC,
    //         priceOfEachToken: ethers.utils.parseEther("0.001"),
    //         criteriaToken: zeroAddress,
    //         minTokensForParticipation: ethers.utils.parseEther("0"),
    //         refundType: RefundType.BURN
    //       },
    //       {
    //         startedAt: latestBlock.timestamp + 15 * OneMinute,
    //         expiredAt: latestBlock.timestamp + 1 * OneDay,
    //         lpLockupDuration: 10 * OneMinute,
    //       },
    //       {
    //         minTokensReq: 10,
    //         maxTokensReq: 20,
    //         softCap: 50
    //       },
    //       {
    //         isEnabled: true,
    //         firstReleasePC: 20,
    //         vestingPeriodOfEachCycle: 10,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         isEnabled: false,
    //         vestingTokens: 100,
    //         firstReleaseTime: 100,
    //         firstReleasePC: 50,
    //         vestingPeriodOfEachCycle: 100,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         logoURL: "",
    //         websiteURL: "",
    //         twitterURL: "",
    //         telegramURL: "",
    //         discordURL: "",
    //         description: ""
    //       },  
    //       { value: ethers.utils.parseEther("0.20") }
    
    //     )
    //   ).to.be.reverted;

    //   // Insufficient funds to start
    //   await expect(
    //     launchpad.connect(user1).createPresale(
    //       {
    //         id: 0,
    //         presaleOwner: user1.address,
    //         preSaleStatus: 0,
    //         preSaleToken: zeroAddress,
    //         decimals: 18
    //       },
    //       {
    //         tokensForSale: 100,                                          // 1000
    //         tokensPCForLP: 70,                                           // 70% = 0.7   =>   1700/1.7 = 700
    //         typeOfPresale: PresaleType.PUBLIC,
    //         priceOfEachToken: ethers.utils.parseEther("0.001"),
    //         criteriaToken: zeroAddress,
    //         minTokensForParticipation: ethers.utils.parseEther("0"),
    //         refundType: RefundType.BURN
    //       },
    //       {
    //         startedAt: latestBlock.timestamp + 15 * OneMinute,
    //         expiredAt: latestBlock.timestamp + 1 * OneDay,
    //         lpLockupDuration: 10 * OneMinute,
    //       },
    //       {
    //         minTokensReq: 10,
    //         maxTokensReq: 20,
    //         softCap: 50
    //       },
    //       {
    //         isEnabled: true,
    //         firstReleasePC: 20,
    //         vestingPeriodOfEachCycle: 10,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         isEnabled: false,
    //         vestingTokens: 100,
    //         firstReleaseTime: 100,
    //         firstReleasePC: 50,
    //         vestingPeriodOfEachCycle: 100,
    //         tokensReleaseEachCyclePC: 10
    //       },
    //       {
    //         logoURL: "",
    //         websiteURL: "",
    //         twitterURL: "",
    //         telegramURL: "",
    //         discordURL: "",
    //         description: ""
    //       },  
    //       { value: ethers.utils.parseEther("0.19") }
    
    //     )
    //   ).to.be.reverted;


    // })

  
  });

})


