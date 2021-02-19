const BPool = artifacts.require("BPool");
const MockRowanToken = artifacts.require("MockRowanToken");
const OwnableWhitelist = artifacts.require("OwnableWhitelist");
const {
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const truffleAssert = require("truffle-assertions");
const { toWei, fromWei } = web3.utils;
const MAX = web3.utils.toTwosComplement(-1);
const {
  calcOutGivenIn,
  calcRelativeDiff,
  logState,
} = require("./../utils.ts");
const errorDelta = 10 ** -8;
const weightUsdt = 1;
const weightRowan = 10;
const verbose = true;

const helpers = require("../helpers/whitelistHelper");
const unhashedKey = `TooFast-Secure-Key--Random34&*(#*$&R#*O(I($`;
const hashedKey = helpers.hash(unhashedKey);

contract("Our use case", (accounts) => {
  const controller = process.env.CONTROLLER;
  const white_list_manager = process.env.WHITE_LIST_MANAGER;
  const cold_storage_address = process.env.COLD_STORAGE_ADDRESS;
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
    rowan = await MockRowanToken.new("erowan", "erowan", 18);
    usdt = await MockRowanToken.new("USDT Stablecoin", "USDT", 6);
    pool = await BPool.deployed();
    whitelist = await OwnableWhitelist.deployed(); // grab the existing whitelist

    ROWAN = rowan.address;
    USDT = usdt.address;
    POOL = pool.address;

    // admin balances
    await rowan.mint(controller, toWei("70000000"));
    await usdt.mint(controller, toWei("26250", "mwei"));

    // user balances
    await usdt.mint(user, toWei("500", "mwei"));
    await usdt.mint(user2, toWei("1000000", "mwei"));

    await rowan.approve(POOL, MAX, { from: controller });
    await usdt.approve(POOL, MAX, { from: controller });

    await rowan.approve(POOL, MAX, { from: user });
    await usdt.approve(POOL, MAX, { from: user });

    await rowan.approve(POOL, MAX, { from: user2 });
    await usdt.approve(POOL, MAX, { from: user2 });

    await pool.bind(ROWAN, toWei("8750000"), {
      from: controller,
    });
    await pool.bind(
      USDT,
      toWei("26250", "mwei"),
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
      await truffleAssert.reverts(
        whitelist.bulkWhitelistUsers([user], [hashedKey], { from: user2 }),
        "Ownable: caller is not the owner"
      );
    });

    it("Admin should be able to whitelist a user", async () => {
      assert.equal(await whitelist.validateWhitelistedUserAndKey(user, unhashedKey, { from: white_list_manager }), false);
      await whitelist.bulkWhitelistUsers([user], [hashedKey], { from: white_list_manager });
      assert.equal(await whitelist.validateWhitelistedUserAndKey(user, unhashedKey, { from: white_list_manager }), true);
    });

    it("Admin should be able to check if any user is in whitelist", async () => {
      assert.equal(await whitelist.validateWhitelistedUserAndKey(user, unhashedKey), true);

      assert.equal(
        await whitelist.validateWhitelistedUserAndKey(user2, unhashedKey, { from: white_list_manager }),
        false
      );
      assert.equal(await whitelist.validateWhitelistedUserAndKey(user2, unhashedKey), false)
    });

    it("Whitelisted user should be able to check if s/he is in the whitelist", async () => {
      assert.equal(await whitelist.validateWhitelistedUserAndKey(user, unhashedKey, { from: user }), true);
    });

    it("Should not be possible to remove whitelisted user if not admin", async () => {
      assert.equal(await whitelist.validateWhitelistedUserAndKey(user, unhashedKey, { from: white_list_manager }), true);
      await truffleAssert.reverts(
        whitelist.removeWhitelistedUser(user, { from: user2 }),
        "Ownable: caller is not the owner"
      );
      assert.equal(await whitelist.validateWhitelistedUserAndKey(user, unhashedKey, { from: white_list_manager }), true);
    });

    it("Admin should be able to remove whitelisted user", async () => {
      assert.equal(await whitelist.validateWhitelistedUserAndKey(user, unhashedKey, { from: white_list_manager }), true);
      await whitelist.removeWhitelistedUser(user, { from: white_list_manager });
      assert.equal(await whitelist.validateWhitelistedUserAndKey(user, unhashedKey, { from: white_list_manager }), false);
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
      await whitelist.bulkWhitelistUsers([user], [hashedKey], { from: white_list_manager });

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
      await pool.setTokenInOut(USDT, ROWAN, {from: controller});
      // Attempt to spend 0 USDT should fail, because user has to invest at least 1 USDT.
      await truffleAssert.reverts(
        pool.swapExactAmountIn(toWei('0', 'mwei'), 0, MAX, unhashedKey, { from: user }),
        'ERR_MIN_SWAP_AMOUNT',
      );
    });

    it("Fails withdraw liquidity if the user is not the controller", async () => {
      await expectRevert(
        pool.withdrawAllLiquidity(USDT, { from: user }),
        "ERR_NOT_CONTROLLER"
      );
    });

    it("Should be able to withdraw liquidity if the user is the controller", async () => {
      const startingPoolBalance = await usdt.balanceOf(pool.address);
      await pool.withdrawAllLiquidity(USDT, { from: controller });
      const endingBalance = await usdt.balanceOf(cold_storage_address);

      assert.equal(
        Number(fromWei(startingPoolBalance)),
        Number(fromWei(endingBalance)),
      );
    });

    it("Fail swapExactAmountIn over max swap ratio", async () => {
      await whitelist.bulkWhitelistUsers([user2], [hashedKey], { from: white_list_manager });
      const rowanPoolBalance = await pool.getBalance(ROWAN);
      assert.equal(rowanPoolBalance, toWei("8750000"));
      const maxSwapAmount = fromWei(rowanPoolBalance) * 0.02;
      const expectedSwapAmount = calcOutGivenIn(
        "2625000",
        fromWei(rowanPoolBalance),
        "53600"
      );
      assert.equal(maxSwapAmount, 175000);
      assert.equal(expectedSwapAmount.toString(), "175091.46569103262903");
      assert.equal(expectedSwapAmount.greaterThan(maxSwapAmount), true);
      await truffleAssert.reverts(
        pool.swapExactAmountIn(toWei("53600", "mwei"), 0, MAX, unhashedKey, {
          from: user2,
        }),
        "ERR_MAX_OUT_RATIO"
      );
      assert.equal(await pool.getBalance(ROWAN), toWei("8750000"));
    });

    it('Fails to swap if gas price exceeds the limit', async () => {
      let gasPriceLimit = await pool.gasPriceLimit();
      assert.equal(gasPriceLimit.toString(), "400000000000"); // initial gas price limit is 400 gwei
      await pool.setGasPriceLimit("1000000000", { from: controller }); // set gas price limit to 1 gwei
      gasPriceLimit = await pool.gasPriceLimit();
      assert.equal(gasPriceLimit.toString(), "1000000000"); // current gas price limit is 1 gwei

      await truffleAssert.reverts(
        pool.swapExactAmountIn(toWei("500", "mwei"), 0, MAX, unhashedKey, {
          from: user,
          gas: "1000000",
          gasPrice: "2000000000" // gas price of 2 gwei is above the limit, should fail
        }),
        "ERR_GAS_PRICE_LIMIT_EXCEEDED"
      );
    });

    it("Swap iteration using swapExactAmountIn", async () => {
      // Attempt to spend 500 USDT should succeed.
      const rowanPoolBalance = await pool.getBalance(ROWAN);
      const expected = calcOutGivenIn(
        2625000,
        fromWei(rowanPoolBalance),
        500
      );

      if(verbose) {
        console.log('Before swap:');
        await logState(pool, rowan, usdt, ROWAN, USDT, user, controller);
      }

      assert.equal(await whitelist.validateWhitelistedUserAndKey(user, unhashedKey, { from: white_list_manager }), true);

      const tx = await pool.swapExactAmountIn(toWei("500", "mwei"), 0, MAX, unhashedKey, {
        from: user,
        gas: "1000000",
        gasPrice: "1000000000" // gas price is 1 gwei, should work
      });

      if(verbose) {
        console.log('After swap:');
        await logState(pool, rowan, usdt, ROWAN, USDT, user, controller);
      }

      const log = tx.logs[0];
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

    it("Fails to provide liquidity if it is not controller", async () => {
      await truffleAssert.reverts(
        pool.joinswapExternAmountIn(toWei("364000"), { from: user }),
        "ERR_NOT_CONTROLLER"
      );
    });

    it("Liquidity iteration", async () => {
      await pool.joinswapExternAmountIn(toWei("364000"), { from: controller });
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
