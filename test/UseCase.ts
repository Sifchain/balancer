const BPool = artifacts.require('BPool');
const MockRowanToken = artifacts.require('MockRowanToken');
const OwnableWhitelist = artifacts.require('OwnableWhitelist');

const truffleAssert = require('truffle-assertions');
const { toWei, fromWei } = web3.utils;
const MAX = web3.utils.toTwosComplement(-1);
const { calcOutGivenIn, calcRelativeDiff, calcInGivenOut } = require('./../calc_comparisons.ts');
const errorDelta = 10 ** -8;
const weightUsdt = 1;
const weightRowan = 10;
const swap_fee = 0.0;
const verbose = true;

contract('Our use case', (accounts) => {
  const controller = process.env.CONTROLLER;
  const admin = accounts[0];
  const user = accounts[1];
  const user2 = accounts[2];

  let pool;
  let POOL;
  let ROWAN;
  let USDT;
  let rowan;
  let usdt;
  let whitelist;

  async function logState(){
    const rowanBalance = await pool.getBalance(ROWAN);
    console.log(`Rowan amount in pool : ${fromWei(rowanBalance)}`);

    if(parseInt(fromWei(rowanBalance))) {
      const rowanPrice = await pool.getSpotPrice(USDT, ROWAN);
      console.log(`Rowan price: ${fromWei(rowanPrice)}`);
    }

    const userRowanBalance = await rowan.balanceOf(user);
    console.log(`Rowan User Balance: ${fromWei(userRowanBalance)}`);
    const adminRowanBalance = await rowan.balanceOf(admin);
    console.log(`Rowan Admin Balance: ${fromWei(adminRowanBalance)}`);
    const userUsdtBalance = await usdt.balanceOf(user);
    console.log(`USDT User Balance: ${fromWei(userUsdtBalance, 'mwei')}`);
    const adminUsdtBalance = await usdt.balanceOf(admin);
    console.log(`USDT Admin Balance: ${fromWei(adminUsdtBalance, 'mwei')}`);
    const usdtBalance = await pool.getBalance(USDT);
    console.log(`USDT amount in pool : ${fromWei(usdtBalance, 'mwei')}`);
    console.log('');
  }

  before(async () => {
    rowan = await MockRowanToken.new('Rowan.eth', 'ROWAN', 18);
    usdt = await MockRowanToken.new('USDT Stablecoin', 'USDT', 18);
    pool = await BPool.deployed();
    whitelist = await OwnableWhitelist.deployed(); // grab the existing whitelist

    ROWAN = rowan.address;
    USDT = usdt.address;
    POOL = pool.address;

    // admin balances
    await rowan.mint(controller, toWei('120000000'));
    await usdt.mint(controller, toWei('45000', 'mwei'));

    // user balances
    await usdt.mint(user, toWei('500', 'mwei'));

    await rowan.approve(POOL, MAX, { from: user });
    await usdt.approve(POOL, MAX, { from: user });

    await rowan.approve(POOL, MAX, { from: controller });
    await usdt.approve(POOL, MAX, { from: controller });

    await pool.bind(ROWAN, toWei('15000000'), toWei(weightRowan.toString()), { from: controller });
    await pool.bind(USDT, toWei('45000', 'mwei'), toWei(weightUsdt.toString()), { from: controller });

    await pool.setSwapFee(swap_fee, { from: controller });
    await pool.finalize({ from: controller });
  });

  describe('Minting Tokens', () => {
    it('Should not be able to mint if the minter is not admin', async () => {
      assert.equal(toWei('500', 'mwei'), (await usdt.balanceOf(user)));
      await truffleAssert.reverts(
        usdt.mint(user, toWei('1500', 'mwei'), { from: user }),
        'Ownable: caller is not the owner'
      );
      assert.equal(toWei('500', 'mwei'), (await usdt.balanceOf(user)));
    });

    it('Should not be able to mint if mint amount is 0', async () => {
      assert.equal(toWei('500', 'mwei'), (await usdt.balanceOf(user)));
      await truffleAssert.reverts(
        usdt.mint(user, toWei('0', 'mwei'), { from: admin }),
        'ERR_LOW_MINT_AMOUNT'
      );
      assert.equal(toWei('500', 'mwei'), (await usdt.balanceOf(user)));
    });

    it('Should be able to mint if the minter is the admin', async () => {
      assert.equal(toWei('500', 'mwei'), (await usdt.balanceOf(user)));
      usdt.mint(user, toWei('500', 'mwei'), { from: admin });
      assert.equal(toWei('1000', 'mwei'), (await usdt.balanceOf(user)));
    });
  });

  describe('Burning Tokens', () => {
    it('Should not be able to burn if the burner is not admin', async () => {
      assert.equal(toWei('1000', 'mwei'), (await usdt.balanceOf(user)));
      await truffleAssert.reverts(
        usdt.burn(user, toWei('100', 'mwei'), { from: user }),
        'Ownable: caller is not the owner'
      );
      assert.equal(toWei('1000', 'mwei'), (await usdt.balanceOf(user)));
    });

    it('Should not be able to burn if burn amount is 0', async () => {
      assert.equal(toWei('1000', 'mwei'), (await usdt.balanceOf(user)));
      await truffleAssert.reverts(
        usdt.burn(user, toWei('0', 'mwei'), { from: admin }),
        'ERR_LOW_BURN_AMOUNT'
      );
      assert.equal(toWei('1000', 'mwei'), (await usdt.balanceOf(user)));
    });

    it('Should not be able to burn if account balance is insufficient', async () => {
      assert.equal(toWei('1000', 'mwei'), (await usdt.balanceOf(user)));
      await truffleAssert.reverts(
        usdt.burn(user, toWei('1001', 'mwei'), { from: admin }),
        'ERR_INSUFFICIENT_BAL'
      );
      assert.equal(toWei('1000', 'mwei'), (await usdt.balanceOf(user)));
    });

    it('Should be able to burn if the burner is the admin', async () => {
      assert.equal(toWei('1000', 'mwei'), (await usdt.balanceOf(user)));
      usdt.burn(user, toWei('500', 'mwei'), { from: admin });
      assert.equal(toWei('500', 'mwei'), (await usdt.balanceOf(user)));
    });
  });

  describe('Whitelisting', () => {
    it('Should not be possible to whitelist a user if not admin', async () => {
      assert.equal(
        await whitelist.isWhitelisted(user, { from: admin }),
        false
      );
      await truffleAssert.reverts(
        whitelist.whitelistUser(user, { from: user2 }),
        'Ownable: caller is not the owner',
      );
      assert.equal(
        await whitelist.isWhitelisted(user, { from: admin }),
        false
      );
    });

    it('Admin should be able to whitelist a user', async () => {
      assert.equal(
        await whitelist.isWhitelisted(user, { from: admin }),
        false
      );
      await whitelist.whitelistUser(user, { from: admin });
      assert.equal(
        await whitelist.isWhitelisted(user, { from: admin }),
        true
      );
    });

    it('Admin should be able to check if any user is in whitelist', async () => {
      assert.equal(
        await whitelist.isWhitelisted(user, { from: admin }),
        true
      );
      assert.equal(
        await whitelist.isWhitelisted(user2, { from: admin }),
        false
      );
    });

    it('Whitelisted user should be able to check if s/he is in the whitelist', async () => {
      assert.equal(
        await whitelist.isWhitelisted(user, { from: user }),
        true
      );
    });

    it('Should not be possible to remove whitelisted user if not admin', async () => {
      assert.equal(
        await whitelist.isWhitelisted(user, { from: admin }),
        true
      );
      await truffleAssert.reverts(
        whitelist.whitelistUser(user, { from: user2 }),
        'Ownable: caller is not the owner',
      );
      assert.equal(
        await whitelist.isWhitelisted(user, { from: admin }),
        true
      );
    });

    it('Admin should be able to remove whitelisted user', async () => {
      assert.equal(
        await whitelist.isWhitelisted(user, { from: admin }),
        true
      );
      await whitelist.removeWhitelistedUser(user, { from: admin });
      assert.equal(
        await whitelist.isWhitelisted(user, { from: admin }),
        false
      );
    });
  });

  describe('Pool Operations', () => {
    it('Fails to swap if user is not in the whitelist', async () => {
      await truffleAssert.reverts(
        pool.swapExactAmountIn(toWei('500', 'mwei'), 0, MAX, { from: user }),
        'ERR_NOT_WHITELISTED',
      );
    });

    it('Fails to swap when in/out tokens have not set', async () => {
      await whitelist.whitelistUser(user, { from: admin });

      await truffleAssert.reverts(
        pool.swapExactAmountIn(toWei('500', 'mwei'), 0, MAX, { from: user }),
        'ERR_NOT_BOUND',
      );
    });

    it('Fails to provide liquidity when in/out tokens have not set', async () => {
      await truffleAssert.reverts(
        pool.joinswapExternAmountIn(toWei('625000'), { from: controller }),
        'ERR_NOT_BOUND',
      );
    });

    it('Fails to swap less than min swap amount', async () => {
      await pool.setTokenIntOut(USDT, ROWAN, {from: controller});

      await truffleAssert.reverts(
        pool.swapExactAmountIn(toWei('100', 'mwei'), 0, MAX, { from: user }),
        'ERR_MIN_SWAP_AMOUNT',
      );
    });

    it('Swap iteration giving in', async () => {
      const usdtPoolBalance = await pool.getBalance(USDT);
      const rowanPoolBalance = await pool.getBalance(ROWAN);
      const expected = calcOutGivenIn(
        fromWei(usdtPoolBalance, 'mwei'),
        weightUsdt,
        fromWei(rowanPoolBalance),
        weightRowan,
        500,
        swap_fee
      );

      if(verbose) {
        console.log('Before swap:');
        await logState();
      }

      assert.equal(
        await whitelist.isWhitelisted(user, { from: admin }),
        true
      );

      const txr = await pool.swapExactAmountIn(
        toWei('500', 'mwei'),
        0,
        MAX,
        { from: user },
      );

      if(verbose) {
        console.log('After swap:');
        await logState();
      }

      const log = txr.logs[0];
      assert.equal(log.event, 'LOG_SWAP');

      const actual = fromWei(log.args.tokenAmountOut);
      const relDif = calcRelativeDiff(expected, actual);

      const userRowanBalance = await rowan.balanceOf(user);
      assert.equal(fromWei(userRowanBalance), Number(fromWei(log.args.tokenAmountOut)));

      assert.isAtMost(relDif.toNumber(), errorDelta);
    });
    it('Swap iteration giving out', async () => {
      await usdt.mint(user, toWei('500', 'mwei'));
      const usdtPoolBalance = await pool.getBalance(USDT);
      const rowanPoolBalance = await pool.getBalance(ROWAN);

      const expected = calcInGivenOut(
        fromWei(usdtPoolBalance, 'mwei'),
        weightUsdt,
        fromWei(rowanPoolBalance),
        weightRowan,
        16000,
        swap_fee
      );

      if(verbose) {
        console.log('Before swap:');
        await logState();
      }

      assert.equal(
        await whitelist.isWhitelisted(user, { from: admin }),
        true
      );

      const txr = await pool.swapExactAmountOut(
        MAX,
        toWei('16000'),
        MAX,
        { from: user },
      );

      if(verbose) {
        console.log('After swap:');
        await logState();
      }

      const log = txr.logs[0];
      assert.equal(log.event, 'LOG_SWAP');

      const actual = fromWei(log.args.tokenAmountIn, 'mwei');
      const relDif = calcRelativeDiff(expected, actual);

      assert.isAtMost(relDif.toNumber(), errorDelta);
    });

    it('Fails to provide liquidity if it is not controller', async () => {
      await truffleAssert.reverts(
        pool.joinswapExternAmountIn(toWei('625000'), { from: user }),
        'ERR_NOT_CONTROLLER',
      );
    });

    it('Liquidity iteration', async () => {
        await pool.joinswapExternAmountIn(toWei('625000'), { from: controller });
        if(verbose) {
            console.log('After adding liquidity:');
            await logState();
        }
    });

    it('Exit pool', async () => {
        await pool.exitPool([0, 0], { from: controller });
        if(verbose) {
            console.log('After exiting pool:');
            await logState();
        }
    });
  });
});
