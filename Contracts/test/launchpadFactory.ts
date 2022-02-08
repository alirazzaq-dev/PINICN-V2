const { time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
// const { ethers, waffle } = require("hardhat");
import { ethers, waffle } from "hardhat";
const provider = waffle.provider;
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { network } from "hardhat";
import { Launchpadv2, Launchpadv2__factory, LokcerFactory, LokcerFactory__factory, Presale, PresaleToken, PresaleToken__factory, Presale__factory, UniswapV2Factory, UniswapV2Factory__factory, UniswapV2Pair, UniswapV2Pair__factory, UniswapV2Router02, UniswapV2Router02__factory, WETH9, WETH9__factory } from "../typechain";
import { Launchpad__factory } from "../typechain/factories/Launchpad__factory";
import { Launchpad } from "../typechain/Launchpad";

let deployer: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress, user3: SignerWithAddress, user4: SignerWithAddress, teamAddr: SignerWithAddress, devAddr: SignerWithAddress
let launchpad: Launchpadv2, presale: Presale, presaleToken: PresaleToken, WBNBAddr: WETH9

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
    const Launchpad: Launchpadv2__factory = await ethers.getContractFactory("Launchpadv2");


    // router = await UniswapV2Router02.attach(router.address);
    presaleToken = await PresaleToken.deploy();
    factory = await UniswapV2Factory.deploy(deployer.address);
    WBNBAddr = await WBNB.deploy();
    router = await UniswapV2Router02.deploy(factory.address, WBNBAddr.address, overrides);

    const LokcerFactory: LokcerFactory__factory = await ethers.getContractFactory("LokcerFactory");
    lockerFactory = await LokcerFactory.deploy();

    launchpad = await Launchpad.deploy(factory.address, router.address, WBNBAddr.address, teamAddr.address, devAddr.address);

    // await lockerFactory.setLaunchPadAddress(launchpad.address);

    // const uniswapV2PairAddress = await factory.getPair(myWETH.address, onPlanet.address);
    // uniswapV2Pair = await UniswapV2Pair.attach(uniswapV2PairAddress);

    // uniswapV2Pair = await presale_factory.attach(uniswapV2PairAddress);

    
  });

  it("Deployement", async () => {
    expect(launchpad.address).to.be.properAddress;
    // console.log(launchpad.address);
  })

  // describe("As master ", async () => {

  //   it("should be able to update the overall fees", async () => {

  //     const Upfrontfee = await launchpad.upfrontfee(); // 100;
  //     const fee = await launchpad.salesFeeInPercent(); // = 2;

  //     expect(Upfrontfee).to.be.equal(ethers.utils.parseEther("0.2"));
  //     expect(fee).to.be.equal(2);

  //     await launchpad.updateFees(ethers.utils.parseEther("0.3"), 3)

  //     const UpfrontfeeAfter = await launchpad.upfrontfee(); // 200;
  //     const feeAfter = await launchpad.salesFeeInPercent(); // = 3;

  //     expect(UpfrontfeeAfter).to.be.equal(ethers.utils.parseEther("0.3"));
  //     expect(feeAfter).to.be.equal(3);



  //   });

  //   it("should be able to whitelist users to start a free presale", async () => {

  //     let latestBlock = await ethers.provider.getBlock("latest")
  //     const OneMinute = Number(await time.duration.minutes(1));
  //     const OneDay = Number(await time.duration.days(1));

  //     await launchpad.whiteListUsersToStartProject(user1.address)
  //     const isWhiteListed = await launchpad.isUserWhitelistedToStartProject(user1.address);
  //     expect(isWhiteListed).to.be.equal(true);

  //     await presaleToken.mint(user1.address, ethers.utils.parseEther("17"));
  //     await presaleToken.connect(user1).approve(launchpad.address, ethers.utils.parseEther("17"));

  //     await launchpad.connect(user1).createPresale(
  //       0,
  //       presaleToken.address,
  //       zeroAddress,
  //       70,
  //       ethers.utils.parseEther("10"),
  //       ethers.utils.parseEther("0.02"),
  //       0,
  //       {
  //         startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
  //         expiredAt: latestBlock.timestamp + OneDay + OneMinute,
  //         lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
  //       },
  //       {
  //         minTokensReq: ethers.utils.parseEther("0.01"),
  //         maxTokensReq: ethers.utils.parseEther("0.05"),
  //         softCap: ethers.utils.parseEther("5")
  //       },
  //     )

  //     const count = await launchpad.count();
  //     expect(count).to.be.equal(1);

  //   });

  //   it("himself can start a free presale", async () => {

  //     let latestBlock = await ethers.provider.getBlock("latest")
  //     const OneMinute = Number(await time.duration.minutes(1));
  //     const OneDay = Number(await time.duration.days(1));

  //     // await launchpad.whiteListUsersToStartProject(user1.address);
  //     // const isWhiteListed = await launchpad.isUserWhitelistedToStartProject(user1.address);
  //     // expect(isWhiteListed).to.be.equal(true);

  //     await presaleToken.mint(deployer.address, ethers.utils.parseEther("17"));
  //     await presaleToken.approve(launchpad.address, ethers.utils.parseEther("17"));

  //     await launchpad.createPresale(
  //       0,
  //       presaleToken.address,
  //       zeroAddress,
  //       70,
  //       ethers.utils.parseEther("10"),
  //       ethers.utils.parseEther("0.02"),
  //       0,
  //       {
  //         startedAt: latestBlock.timestamp + 15 * OneMinute + OneMinute,
  //         expiredAt: latestBlock.timestamp + OneDay + OneMinute,
  //         lpLockupTime: latestBlock.timestamp + 7 * OneDay + OneMinute,
  //       },
  //       {
  //         minTokensReq: ethers.utils.parseEther("0.01"),
  //         maxTokensReq: ethers.utils.parseEther("0.05"),
  //         softCap: ethers.utils.parseEther("5")
  //       },
  //       // { value: ethers.utils.parseEther("0.2") }
  //     )

  //     const count = await launchpad.count();
  //     expect(count).to.be.equal(1);


  //   });

  // });

  describe("As a user ", async () => {

    it("can start a presale by paying fee", async () => {

      let latestBlock = await ethers.provider.getBlock("latest")
      const OneMinute = Number(await time.duration.minutes(1));
      const OneDay = Number(await time.duration.days(1));


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

      const pressaleAddress = await launchpad.presaleRecord(count);
      
      const presale_factory = await ethers.getContractFactory("Presale");
      presale = await presale_factory.attach(pressaleAddress);

      const presaleInfo =await presale.presaleInfo();
      expect(await presale.owner()).to.be.equal(user1.address);
      expect(presaleInfo.preSaleStatus).to.be.equal(0);



    });


  });

})


