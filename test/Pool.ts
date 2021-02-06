const truffleAssert = require("truffle-assertions");
const {
  calcOutGivenIn,
  calcRelativeDiff,
} = require("./../utils.ts");
const BPool = artifacts.require("BPool");
const MockRowanToken = artifacts.require("MockRowanToken");
const OwnableWhitelist = artifacts.require("OwnableWhitelist");

const verbose = process.env.VERBOSE;

const { toWei, fromWei } = web3.utils;
const errorDelta = 10 ** -8;
const MAX = web3.utils.toTwosComplement(-1);

const helpers = require("../helpers/whitelistHelper");
const unhashedKey = "CnatGeusHtis";
const hashedKey = helpers.hash(unhashedKey);

contract("Full pool test", (accounts) => {
  const admin = process.env.WHITE_LIST_MANAGER;
  const controller = process.env.CONTROLLER;
  const user1 = accounts[1];
  const user2 = accounts[2];
  let WETH;
  let MKR;
  let DAI;
  let XXX; // addresses
  let weth;
  let mkr;
  let dai;
  let xxx; // TTokens
  let pool; // first pool w/ defaults
  let POOL; //   pool address
  let whitelist;

  before(async () => {
    pool = await BPool.deployed();
    whitelist = await OwnableWhitelist.deployed(); // grab the existing whitelist

    const minter = accounts[0];
    POOL = pool.address;

    weth = await MockRowanToken.new("Wrapped Ether", "WETH", 18);
    mkr = await MockRowanToken.new("Maker", "MKR", 18);
    dai = await MockRowanToken.new("Dai Stablecoin", "DAI", 18);
    xxx = await MockRowanToken.new("XXX", "XXX", 18);

    WETH = weth.address;
    MKR = mkr.address;
    DAI = dai.address;
    XXX = xxx.address;

    /*
        Tests assume token prices
        WETH - $200
        MKR  - $500
        DAI  - $1
        XXX  - $0
    */

    // Admin balances
    await weth.mint(controller, toWei("50"), { from: minter });
    await mkr.mint(controller, toWei("20"), { from: minter });
    await dai.mint(controller, toWei("10000"), { from: minter });
    await xxx.mint(controller, toWei("10"), { from: minter });

    // User1 balances
    await weth.mint(user1, toWei("25"), { from: minter });
    await mkr.mint(user1, toWei("4"), { from: minter });
    await dai.mint(user1, toWei("40000"), { from: minter });
    await xxx.mint(user1, toWei("10"), { from: minter });

    // User2 balances
    await weth.mint(user2, toWei("12.2222"), { from: minter });
    await mkr.mint(user2, toWei("1.015333"), { from: minter });
    await dai.mint(user2, toWei("10"), { from: minter });
    await xxx.mint(user2, toWei("51"), { from: minter });
  });

  describe("Binding Tokens", () => {
    it("Pool starts with no bound tokens", async () => {
      const numTokens = await pool.getNumTokens();
      assert.equal(0, numTokens);
      const isBound = await pool.isBound.call(WETH);
      assert(!isBound);
    });

    it("Fails binding tokens that are not approved", async () => {
      await truffleAssert.reverts(
        pool.bind(MKR, toWei("1"), { from: controller }),
        "SafeERC20: low-level call failed"
      );
    });

    it("Admin approves tokens", async () => {
      await weth.approve(POOL, MAX, { from: controller });
      await mkr.approve(POOL, MAX, { from: controller });
      await dai.approve(POOL, MAX, { from: controller });
      await xxx.approve(POOL, MAX, { from: controller });
    });

    it("Fails binding balances outside MIX MAX", async () => {
      await truffleAssert.reverts(
        pool.bind(WETH, toWei("51"), { from: controller }),
        "SafeERC20: low-level call failed"
      );
      await truffleAssert.reverts(
        pool.bind(MKR, toWei("0.0000000000001"), { from: controller }),
        "ERR_MIN_BALANCE"
      );
    });

    it("Fails finalizing pool without 2 tokens", async () => {
      await truffleAssert.reverts(pool.finalize({ from: controller }), "ERR_MIN_TOKENS");
    });

    it('Fails gulp if not controller', async () => {
      await truffleAssert.reverts(pool.gulp(WETH), 'ERR_NOT_CONTROLLER.');
    });

    it('Fails gulp on unbound token', async () => {
      await truffleAssert.reverts(pool.gulp(WETH, { from: controller }), 'ERR_NOT_BOUND');
    });

    it("Admin binds tokens", async () => {
      // Equal weights WETH, MKR, DAI
      await pool.bind(WETH, toWei("50"), { from: controller });
      await pool.bind(MKR, toWei("20"), { from: controller });
      await pool.bind(DAI, toWei("10000"), { from: controller });
      const numTokens = await pool.getNumTokens();
      assert.equal(3, numTokens);
      const mkrBalance = await pool.getBalance(MKR);
      assert.equal(20, fromWei(mkrBalance));
    });

    it('Pool can gulp tokens', async () => {
      await pool.gulp(WETH, { from: controller });
      const balance = await pool.getBalance(WETH);
      assert.equal(fromWei(balance), 50);
    });

    it("Fails rebinding token or unbinding random token", async () => {
      await truffleAssert.reverts(
        pool.bind(WETH, toWei("0"), { from: controller }),
        "ERR_IS_BOUND"
      );
      await truffleAssert.reverts(
        pool.rebind(XXX, toWei("0"), { from: controller }),
        "ERR_NOT_BOUND"
      );
    });

    it("Get current tokens", async () => {
      const currentTokens = await pool.getCurrentTokens();
      assert.sameMembers(currentTokens, [WETH, MKR, DAI]);
    });

    it("Fails getting final tokens before finalized", async () => {
      await truffleAssert.reverts(pool.getFinalTokens(), "ERR_NOT_FINALIZED");
    });
  });

  describe("Finalizing pool", () => {
    it("Fails when other users interact before finalizing", async () => {
      await truffleAssert.reverts(
        pool.bind(WETH, toWei("5"), { from: user1 }),
        "ERR_NOT_CONTROLLER"
      );
      await truffleAssert.reverts(
        pool.rebind(WETH, toWei("5"), { from: user1 }),
        "ERR_NOT_CONTROLLER"
      );
      const oldController = await pool.getController();
      await pool.setController(user1, { from: oldController });
      await truffleAssert.reverts(
        pool.exitPool([toWei("0"), toWei("0")], { from: user1 }),
        "ERR_NOT_FINALIZED"
      );
      await pool.setController(oldController, { from: user1 });
    });

    it("Fails calling any swap before finalizing", async () => {
      await whitelist.whitelistUser(user2, hashedKey, { from: admin });
      const controller = await pool.getController();
      await pool.setTokenInOut(WETH, DAI, { from: controller });
      await truffleAssert.reverts(
        pool.swapExactAmountIn(toWei("2.5"), toWei("475"), toWei("200"), unhashedKey, {from: user2}),
        "ERR_NOT_FINALIZED"
      );
      await pool.setTokenInOut(DAI, WETH, { from: controller });
      await truffleAssert.reverts(
        pool.swapExactAmountIn(toWei("2.5"), toWei("475"), toWei("200"), unhashedKey, {from: user2}),
        "ERR_NOT_FINALIZED"
      );
    });

    it("Fails calling any join exit swap before finalizing", async () => {
      await truffleAssert.reverts(
        pool.joinswapExternAmountIn(toWei("2.5"), { from: controller }),
        "ERR_NOT_FINALIZED"
      );
    });

    it("Fails nonadmin sets controller", async () => {
      await truffleAssert.reverts(
        pool.setController(user1, { from: user1 }),
        "ERR_NOT_CONTROLLER"
      );
    });

    it("Fails nonadmin finalizes pool", async () => {
      await truffleAssert.reverts(
        pool.finalize({ from: user1 }),
        "ERR_NOT_CONTROLLER"
      );
    });

    it("Admin finalizes pool", async () => {
      await pool.finalize({ from: controller });
      const finalized = pool.isFinalized();
      assert(finalized);
    });

    it("Fails finalizing pool after finalized", async () => {
      await truffleAssert.reverts(pool.finalize({ from: controller }), "ERR_IS_FINALIZED");
    });

    it("Fails binding new token after finalized", async () => {
      await truffleAssert.reverts(
        pool.bind(XXX, toWei("10"), { from: controller }),
        "ERR_IS_FINALIZED"
      );
      await truffleAssert.reverts(
        pool.rebind(DAI, toWei("10"), { from: controller }),
        "ERR_IS_FINALIZED"
      );
    });

    it("Get final tokens", async () => {
      const finalTokens = await pool.getFinalTokens();
      assert.sameMembers(finalTokens, [WETH, MKR, DAI]);
    });
  });

  describe("Cold Storage", () => {
    it("Cold storage should be the correct address", async () => {
      assert.equal(process.env.COLD_STORAGE_ADDRESS, await pool.coldStorage());
    });
  });

  describe("User interactions", () => {
    it("Other users approve tokens", async () => {
      await weth.approve(POOL, MAX, { from: user1 });
      await mkr.approve(POOL, MAX, { from: user1 });
      await dai.approve(POOL, MAX, { from: user1 });
      await xxx.approve(POOL, MAX, { from: user1 });

      await weth.approve(POOL, MAX, { from: user2 });
      await mkr.approve(POOL, MAX, { from: user2 });
      await dai.approve(POOL, MAX, { from: user2 });
      await xxx.approve(POOL, MAX, { from: user2 });
    });
    it("User1 joins pool", async () => {
      const controller = await pool.getController();
      await pool.setController(user1, { from: controller });
      await pool.setTokenInOut(XXX, WETH, { from: user1 });
      await pool.joinswapExternAmountIn(toWei("2.5"), { from: user1 });
      await pool.setTokenInOut(XXX, MKR, { from: user1 });
      await pool.joinswapExternAmountIn(toWei("1"), { from: user1 });
      await pool.setTokenInOut(XXX, DAI, { from: user1 });
      await pool.joinswapExternAmountIn(toWei("500"), { from: user1 });
      const daiBalance = await pool.getBalance(DAI);
      assert.equal(10500, fromWei(daiBalance));
      const userWethBalance = await weth.balanceOf(user1);
      assert.equal(22.5, fromWei(userWethBalance));
      await pool.setController(controller, { from: user1 });
    });
    /*
      Current pool balances
      WETH - 52.5
      MKR - 21
      DAI - 10,500
      XXX - 0
    */

    it("getSpotPrice check", async () => {
      const wethPrice = await pool.getSpotPrice(DAI, WETH);
      const wethPriceCheck = 2625000 / 52.5;
      assert.equal(fromWei(wethPrice), wethPriceCheck);
    });

    it("Fail swapExactAmountIn unbound or over min max ratios", async () => {
      const controller = await pool.getController();
      await pool.setTokenInOut(WETH, XXX, { from: controller });
      await truffleAssert.reverts(
        pool.swapExactAmountIn(toWei("2.5"), toWei("100"), toWei("200"), unhashedKey, {
          from: user2,
        }),
        "ERR_NOT_BOUND"
      );
      await pool.setTokenInOut(WETH, DAI, { from: controller });

      await truffleAssert.reverts(
        pool.swapExactAmountIn(toWei("5.3", "mwei"), toWei("100"), toWei("2000"), unhashedKey, {
          from: user2,
        }),
        "ERR_LIMIT_OUT"
      );
    });

    /*
      Current DAI in pool is 10,500, hence the max swap amount should be 210 DAI (2%).
      Attempt to swap 6 WETH for DAI priced at $200 should fail.
    */
    it("Fail swapExactAmountIn over max swap ratio", async () => {
      assert.equal(await pool.getBalance(WETH), toWei("52.5"));
      assert.equal(await pool.getBalance(DAI), toWei("10500"));
      await truffleAssert.reverts(
        pool.swapExactAmountIn(toWei("60000", "mwei"), 0, toWei("253"), unhashedKey, {
          from: user2,
        }),
        "ERR_MAX_OUT_RATIO"
      );
      assert.equal(await pool.getBalance(WETH), toWei("52.5"));
      assert.equal(await pool.getBalance(DAI), toWei("10500"));
    });

    it('swapExactAmountIn', async () => {
      // 12000 * 10e-12 WETH -> DAI
      const initialUserDaiBalance = await dai.balanceOf(user2);
      const expected = calcOutGivenIn(2625000, 10500, 12000);
      const txr = await pool.swapExactAmountIn(
        toWei("12000", "mwei"),
        0,
        MAX,
        unhashedKey,
        { from: user2 }
      );
      const log = txr.logs[0];
      assert.equal(log.event, "LOG_SWAP");

      const actual = fromWei(log.args[4]);
      const relDif = calcRelativeDiff(expected, actual);
      if (verbose) {
        console.log("swapExactAmountIn");
        console.log(`expected: ${expected})`);
        console.log(`actual  : ${actual})`);
        console.log(`relDif  : ${relDif})`);
      }

      assert.isAtMost(relDif.toNumber(), errorDelta);

      assert.equal(
        fromWei(await dai.balanceOf(user2)),
        Number(fromWei(log.args[4])) + Number(fromWei(initialUserDaiBalance))
      );

      const wethPrice = await pool.getSpotPrice(DAI, WETH);
      const wethPriceCheck = 2625000 / 52.500000012;

      assert.approximately(
        Number(fromWei(wethPrice)),
        Number(wethPriceCheck),
        errorDelta
      );
    });

    it("Fails exit pool with limits", async () => {
      await truffleAssert.reverts(
        pool.exitPool([toWei("30"), toWei("30"), toWei("30")], { from: controller }),
        "ERR_LIMIT_OUT"
      );
    });

    it("Fails calling any swap on unbound token", async () => {
      const controller = await pool.getController();
      await pool.setTokenInOut(XXX, DAI, { from: controller });
      await truffleAssert.reverts(
        pool.swapExactAmountIn(toWei("2.5"), toWei("475"), toWei("200"), unhashedKey, { from: user2 }),
        "ERR_NOT_BOUND"
      );
      await pool.setTokenInOut(DAI, XXX, { from: controller });
      await truffleAssert.reverts(
        pool.swapExactAmountIn(toWei("2.5"), toWei("475"), toWei("200"), unhashedKey, { from: user2 }),
        "ERR_NOT_BOUND"
      );
      await truffleAssert.reverts(
        pool.joinswapExternAmountIn(toWei("2.5"), { from: controller }),
        "ERR_NOT_BOUND"
      );
    });

    it("Fails calling balances, spot prices on unbound token", async () => {
      await truffleAssert.reverts(pool.getBalance(XXX), "ERR_NOT_BOUND");
      await truffleAssert.reverts(pool.getSpotPrice(DAI, XXX), "ERR_NOT_BOUND");
      await truffleAssert.reverts(pool.getSpotPrice(XXX, DAI), "ERR_NOT_BOUND");
      await truffleAssert.reverts(
        pool.getSpotPrice(DAI, XXX),
        "ERR_NOT_BOUND"
      );
      await truffleAssert.reverts(
        pool.getSpotPrice(XXX, DAI),
        "ERR_NOT_BOUND"
      );
    });
  });
});
