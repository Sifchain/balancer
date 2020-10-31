const BPool = artifacts.require("BPool");
const MockRowanToken = artifacts.require("MockRowanToken");
const OwnableWhitelist = artifacts.require("OwnableWhitelist");

const truffleAssert = require("truffle-assertions");
const { toWei, fromWei } = web3.utils;
const MAX = web3.utils.toTwosComplement(-1);
const {
  calcOutGivenIn,
  calcInGivenOut,
  calcRelativeDiff,
  logState,
} = require("./../utils.ts");
const errorDelta = 10 ** -8;
const weightUsdt = 1;
const weightRowan = 10;
const swap_fee = 0.0;
const verbose = true;

const helpers = require("../helpers/whitelistHelper");
const unhashedKey = `TooFast-Secure-Key--Random34&*(#*$&R#*O(I($`
const hashedKey = helpers.hash(unhashedKey)

contract("Our use case", (accounts) => {
  const controller = process.env.CONTROLLER;
  const white_list_manager = process.env.WHITE_LIST_MANAGER;
  const minter = accounts[0];

  const user = accounts[1];
  const user2 = accounts[2];

  let pool;
  let POOL;
  let ROWAN;
  let USDT;
  let rowan;
  let usdt;
  let whitelist;

  before(async () => {
    rowan = await MockRowanToken.new("eRowan", "RWN", 18);
    usdt = await MockRowanToken.new("USDT Stablecoin", "USDT", 6);
    pool = await BPool.deployed();
    whitelist = await OwnableWhitelist.deployed(); // grab the existing whitelist

    ROWAN = rowan.address;
    USDT = usdt.address;
    POOL = pool.address;

    // admin balances
    await rowan.mint(controller, toWei("120000000"));
    await usdt.mint(controller, toWei("45000", "mwei"));

    // user balances
    await usdt.mint(user, toWei("500", "mwei"));

    await rowan.approve(POOL, MAX, { from: user });
    await usdt.approve(POOL, MAX, { from: user });

    await rowan.approve(POOL, MAX, { from: controller });
    await usdt.approve(POOL, MAX, { from: controller });

    await pool.bind(ROWAN, toWei("15000000"), toWei(weightRowan.toString()), {
      from: controller,
    });
    await pool.bind(
      USDT,
      toWei("45000", "mwei"),
      toWei(weightUsdt.toString()),
      { from: controller }
    );

    await pool.finalize({ from: controller });
  });

  describe("Minting Tokens", () => {
    it("Should not be able to mint if the minter does not have the Minter role", async () => {
      assert.equal(toWei("500", "mwei"), await usdt.balanceOf(user));
      await truffleAssert.reverts(
        usdt.mint(user, toWei("1500", "mwei"), { from: user }),
        "MinterRole: caller does not have the Minter role"
      );
      assert.equal(toWei("500", "mwei"), await usdt.balanceOf(user));
    });

    it("Should be able to mint if the minter has the Minter role", async () => {
      assert.equal(toWei("500", "mwei"), await usdt.balanceOf(user));
      await usdt.mint(user, toWei("500", "mwei"), { from: minter });
      assert.equal(toWei("1000", "mwei"), await usdt.balanceOf(user));
    });
  });

  describe("Burning Tokens", () => {
    it("Should not be able to burn if account balance is insufficient", async () => {
      assert.equal(toWei("1000", "mwei"), await usdt.balanceOf(user));
      await truffleAssert.reverts(
        usdt.burn(toWei("1001", "mwei"), { from: user }),
        "SafeMath: subtraction overflow"
      );
      assert.equal(toWei("1000", "mwei"), await usdt.balanceOf(user));
    });

    it("Should be able to burn own tokens", async () => {
      assert.equal(toWei("1000", "mwei"), await usdt.balanceOf(user));
      await usdt.burn(toWei("500", "mwei"), { from: user });
      assert.equal(toWei("500", "mwei"), await usdt.balanceOf(user));
    });
  });

  describe("Whitelisting", () => {
    it("Should not be possible to whitelist a user if not admin", async () => {
      assert.equal(await whitelist.isWhitelisted(user, { from: white_list_manager }), false);
      await truffleAssert.reverts(
        whitelist.whitelistUser(user, hashedKey, { from: user2 }),
        "Ownable: caller is not the owner"
      );
      assert.equal(await whitelist.isWhitelisted(user, { from: white_list_manager }), false);
    });

    it("Admin should be able to whitelist a user", async () => {
      assert.equal(await whitelist.isWhitelisted(user, { from: white_list_manager }), false);
      await whitelist.whitelistUser(user, hashedKey, { from: white_list_manager });
      assert.equal(await whitelist.isWhitelisted(user, { from: white_list_manager }), true);
    });

    it("Admin should be able to check if any user is in whitelist", async () => {
      assert.equal(await whitelist.isWhitelisted(user, { from: white_list_manager }), true);
      assert.equal(await whitelist.validateWhitelistedUserAndKey(user, unhashedKey), true)

      assert.equal(
        await whitelist.isWhitelisted(user2, { from: white_list_manager }),
        false
      );
      assert.equal(await whitelist.validateWhitelistedUserAndKey(user2, unhashedKey), false)
    });

    it("Whitelisted user should be able to check if s/he is in the whitelist", async () => {
      assert.equal(await whitelist.isWhitelisted(user, { from: user }), true);
    });

    it("Should not be possible to remove whitelisted user if not admin", async () => {
      assert.equal(await whitelist.isWhitelisted(user, { from: white_list_manager }), true);
      await truffleAssert.reverts(
        whitelist.whitelistUser(user, hashedKey, { from: user2 }),
        "Ownable: caller is not the owner"
      );
      assert.equal(await whitelist.isWhitelisted(user, { from: white_list_manager }), true);
    });

    it("Admin should be able to remove whitelisted user", async () => {
      assert.equal(await whitelist.isWhitelisted(user, { from: white_list_manager }), true);
      await whitelist.removeWhitelistedUser(user, hashedKey, { from: white_list_manager });
      assert.equal(await whitelist.isWhitelisted(user, { from: white_list_manager }), false);
    });
  });

  describe("Pool Operations", () => {
    it("Fails to swap if user is not in the whitelist", async () => {
      await truffleAssert.reverts(
        pool.swapExactAmountIn(toWei("500", "mwei"), 0, MAX, unhashedKey, { from: user }),
        "ERR_NOT_WHITELISTED"
      );
    });

    it("Fails to swap when in/out tokens have not set", async () => {
      await whitelist.whitelistUser(user, hashedKey, { from: white_list_manager });

      await truffleAssert.reverts(
        pool.swapExactAmountIn(toWei("500", "mwei"), 0, MAX, unhashedKey, { from: user }),
        "ERR_NOT_BOUND"
      );
    });

    it("Fails to provide liquidity when in/out tokens have not set", async () => {
      await truffleAssert.reverts(
        pool.joinswapExternAmountIn(toWei("625000"), { from: controller }),
        "ERR_NOT_BOUND"
      );
    });

    it('Fails to swapExactAmountIn with less than min swap amount', async () => {
      await pool.setTokenIntOut(USDT, ROWAN, {from: controller});
      // Attempt to spend 0 USDT should fail, because user has to invest at least 1 USDT.
      await truffleAssert.reverts(
        pool.swapExactAmountIn(toWei('0', 'mwei'), 0, MAX, unhashedKey, { from: user }),
        'ERR_MIN_SWAP_AMOUNT',
      );
    });

    it('Fails to swapExactAmountOut with less than min swap amount', async () => {
      await pool.setTokenIntOut(USDT, ROWAN, {from: controller});
      // Attempt to buy 30 RWN priced $0.03 should fail, because user has to invest at least 1 USDT.
      // (e.g. $1 / $0.03 per RWN = 33.33333333 RWN)
      await truffleAssert.reverts(
        pool.swapExactAmountOut(MAX, toWei('30'), MAX, unhashedKey, { from: user }),
        'ERR_MIN_SWAP_AMOUNT',
      );
    });

    it('Fails to swapExactAmountOut with incorrect unhashed key', async () => {
      await pool.setTokenIntOut(USDT, ROWAN, {from: controller});
      // Attempt to buy 30 RWN priced $0.03 should fail, because user has to invest at least 1 USDT.
      // (e.g. $1 / $0.03 per RWN = 33.33333333 RWN)
      await truffleAssert.reverts(
        pool.swapExactAmountOut(MAX, toWei('30'), MAX, "incorrect_key", { from: user }),
        'ERR_NOT_WHITELISTED/INVALID_KEY',
      );
    });

    it('Fails to swapExactAmountOut with address that is not whitelisted', async () => {
      await pool.setTokenIntOut(USDT, ROWAN, {from: controller});
      // Attempt to buy 30 RWN priced $0.03 should fail, because user has to invest at least 1 USDT.
      // (e.g. $1 / $0.03 per RWN = 33.33333333 RWN)
      assert.equal(await whitelist.isWhitelisted(user2), false)
      await truffleAssert.reverts(
        pool.swapExactAmountOut(MAX, toWei('30'), MAX, unhashedKey, { from: user2 }),
        'ERR_NOT_WHITELISTED/INVALID_KEY',
      );
    });

    it("Swap iteration using swapExactAmountIn", async () => {
      // Attempt to spend 500 USDT should succeed.
      const usdtPoolBalance = await pool.getBalance(USDT);
      const rowanPoolBalance = await pool.getBalance(ROWAN);
      const expected = calcOutGivenIn(
        fromWei(usdtPoolBalance, "mwei"),
        weightUsdt,
        fromWei(rowanPoolBalance),
        weightRowan,
        500,
        swap_fee
      );

      if(verbose) {
        console.log('Before swap:');
        await logState(pool, rowan, usdt, ROWAN, USDT, user, controller);
      }

      assert.equal(await whitelist.isWhitelisted(user, { from: white_list_manager }), true);

      const txr = await pool.swapExactAmountIn(toWei("500", "mwei"), 0, MAX, unhashedKey, {
        from: user,
      });

      if(verbose) {
        console.log('After swap:');
        await logState(pool, rowan, usdt, ROWAN, USDT, user, controller);
      }

      const log = txr.logs[0];
      assert.equal(log.event, "LOG_SWAP");

      const actual = fromWei(log.args.tokenAmountOut);
      const relDif = calcRelativeDiff(expected, actual);

      const userRowanBalance = await rowan.balanceOf(user);
      assert.equal(
        Number(fromWei(userRowanBalance)),
        Number(fromWei(log.args.tokenAmountOut))
      );

      assert.isAtMost(relDif.toNumber(), errorDelta);
    });

    it("Swap iteration using swapExactAmountOut", async () => {
      // Attempt to buy 20,000 RWN priced $0.03 should succeed (e.g. 20,000 RWN * $0.03 per RWN = $600)
      await usdt.mint(user, toWei("1000", "mwei"));
      const userRowanBalanceInitial = await rowan.balanceOf(user);
      const usdtPoolBalance = await pool.getBalance(USDT);
      const rowanPoolBalance = await pool.getBalance(ROWAN);
      const expected = calcInGivenOut(
        fromWei(usdtPoolBalance, "mwei"),
        weightUsdt,
        fromWei(rowanPoolBalance),
        weightRowan,
        20000,
        swap_fee
      );

      if(verbose) {
        console.log('Before swap:');
        await logState(pool, rowan, usdt, ROWAN, USDT, user, controller);
      }

      assert.equal(await whitelist.isWhitelisted(user, { from: white_list_manager }), true);
      const txr = await pool.swapExactAmountOut(MAX, toWei("20000"), MAX, unhashedKey, {
        from: user,
      });

      if(verbose) {
        console.log('After swap:');
        await logState(pool, rowan, usdt, ROWAN, USDT, user, controller);
      }

      const log = txr.logs[0];
      assert.equal(log.event, "LOG_SWAP");

      const actual = fromWei(log.args.tokenAmountIn, "mwei");
      const relDif = calcRelativeDiff(expected, actual);

      const userRowanBalance = await rowan.balanceOf(user);
      assert.equal(
        Number(fromWei(userRowanBalance)),
        Number(fromWei(log.args.tokenAmountOut)) +
          Number(fromWei(userRowanBalanceInitial))
      );

      assert.isAtMost(relDif.toNumber(), errorDelta);
    });

    it("Fails to provide liquidity if it is not controller", async () => {
      await truffleAssert.reverts(
        pool.joinswapExternAmountIn(toWei("625000"), { from: user }),
        "ERR_NOT_CONTROLLER"
      );
    });

    it("Liquidity iteration", async () => {
      await pool.joinswapExternAmountIn(toWei("625000"), { from: controller });
      if (verbose) {
        console.log("After adding liquidity:");
        await logState(pool, rowan, usdt, ROWAN, USDT, user, controller);
      }
    });

    it("Exit pool", async () => {
      await pool.exitPool([0, 0], { from: controller });
      if (verbose) {
        console.log("After exiting pool:");
        await logState(pool, rowan, usdt, ROWAN, USDT, user, controller);
      }
    });
  });
});
