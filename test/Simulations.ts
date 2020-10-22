const BPool = artifacts.require('BPool');
const MockRowanToken = artifacts.require('MockRowanToken');
const OwnableWhitelist = artifacts.require('OwnableWhitelist');

const truffleAssert = require('truffle-assertions');
const { toWei, fromWei } = web3.utils;
const MAX = web3.utils.toTwosComplement(-1);
const { calcOutGivenIn, calcInGivenOut, calcRelativeDiff, logState } = require('./../utils.ts');
const errorDelta = 10 ** -8;
const weightUsdt = 1;
const weightRowan = 10;
const swap_fee = 0.0;
const buyers_number = 10;

async function swapIteration(pool, rowan, usdt, ROWAN, USDT, user, controller) {
  const usdtPoolBalance = await pool.getBalance(USDT);
  const rowanPoolBalance = await pool.getBalance(ROWAN);
  const expected = calcOutGivenIn(
    fromWei(usdtPoolBalance, 'mwei'),
    weightUsdt,
    fromWei(rowanPoolBalance),
    weightRowan,
    1000,
    swap_fee
  );

  const txr = await pool.swapExactAmountIn(
    toWei('1000', 'mwei'),
    0,
    MAX,
    { from: user },
  );

  await logState(pool, rowan, usdt, ROWAN, USDT, user, controller);

  const log = txr.logs[0];
  assert.equal(log.event, 'LOG_SWAP');

  const actual = fromWei(log.args.tokenAmountOut);
  const relDif = calcRelativeDiff(expected, actual);

  assert.isAtMost(relDif.toNumber(), errorDelta);
}

contract('Our use case', (accounts) => {
  const controller = process.env.CONTROLLER;
  const admin = accounts[0];
  const user = accounts[1];

  let pool;
  let POOL;
  let ROWAN;
  let USDT;
  let rowan;
  let usdt;
  let whitelist;

  before(async () => {
    rowan = await MockRowanToken.new('eRowan', 'RWN', 18);
    usdt = await MockRowanToken.new('USDT Stablecoin', 'USDT', 6);
    pool = await BPool.deployed();
    whitelist = await OwnableWhitelist.deployed();

    ROWAN = rowan.address;
    USDT = usdt.address;
    POOL = pool.address;

    // admin balances
    await rowan.mint(controller, toWei('120000000'));
    await usdt.mint(controller, toWei('45000', 'mwei'));

    // user balances
    await usdt.mint(user, toWei('100000', 'mwei'));

    await rowan.approve(POOL, MAX, { from: user });
    await usdt.approve(POOL, MAX, { from: user });

    await rowan.approve(POOL, MAX, { from: controller });
    await usdt.approve(POOL, MAX, { from: controller });

    await pool.bind(ROWAN, toWei('15000000'), toWei(weightRowan.toString()), { from: controller });
    await pool.bind(USDT, toWei('45000', 'mwei'), toWei(weightUsdt.toString()), { from: controller });

    await pool.finalize({ from: controller });

    await whitelist.whitelistUser(user, { from: admin });
    await pool.setTokenIntOut(USDT, ROWAN, {from: controller});

  });

  describe('Pool Operations', () => {
    it('Iterations cycle', async () => {
      assert.equal(
        await whitelist.isWhitelisted(user, { from: admin }),
        true
      );

      for (let i = 0; i < buyers_number; i++) {
        console.log(`Swap Interation ${i + 1}:`);
        await swapIteration(pool, rowan, usdt, ROWAN, USDT, user, controller);
      }
    });

    it('Liquidity iteration', async () => {
        await pool.joinswapExternAmountIn(toWei('625000'), { from: controller });
        console.log('After adding liquidity:');
        await logState(pool, rowan, usdt, ROWAN, USDT, user, controller);
    });
  });
});
