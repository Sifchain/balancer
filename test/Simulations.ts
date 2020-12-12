const BPool = artifacts.require('BPool');
const MockRowanToken = artifacts.require('MockRowanToken');
const OwnableWhitelist = artifacts.require('OwnableWhitelist');
const fs = require('fs');

const { toWei, fromWei } = web3.utils;
const MAX = web3.utils.toTwosComplement(-1);
const { calcOutGivenIn, calcRelativeDiff } = require('./../utils.ts');
const errorDelta = 10 ** -8;
const weightUsdt = 1;
const weightRowan = 10;
const hours_in_week = 7 * 24;
// parameters
const first_hour_buyers_number = 100;
const first_trade_amount = 1000;
const subsequent_hour_buyers_number = 0;
const subsequent_trade_amount = 10000;
const fileName = `first.${first_hour_buyers_number}.${first_trade_amount}.subseq.${subsequent_hour_buyers_number}.${subsequent_trade_amount}:`

const helpers = require("../helpers/whitelistHelper");
const unhashedKey = `TooFast-Secure-Key--Random34&*(#*$&R#*O(I($`;
const hashedKey = helpers.hash(unhashedKey);

async function swapIteration(pool, ROWAN, USDT, user, amount, unhashedkey) {
  const usdtPoolBalance = await pool.getBalance(USDT);
  const rowanPoolBalance = await pool.getBalance(ROWAN);
  const expected = calcOutGivenIn(
    fromWei(usdtPoolBalance, 'mwei'),
    weightUsdt,
    fromWei(rowanPoolBalance),
    weightRowan,
    amount,
    0.0
  );

  const txr = await pool.swapExactAmountIn(
    toWei(amount.toString(), 'mwei'),
    0,
    MAX,
    unhashedkey,
    { from: user },
  );

  const log = txr.logs[0];
  assert.equal(log.event, 'LOG_SWAP');

  const actual = fromWei(log.args.tokenAmountOut);
  const relDif = calcRelativeDiff(expected, actual);

  assert.isAtMost(relDif.toNumber(), errorDelta);
}

contract('Our use case', (accounts) => {
  const controller = process.env.CONTROLLER;
  const white_list_manager = process.env.WHITE_LIST_MANAGER;
  const user = accounts[1];

  let pool;
  let POOL;
  let ROWAN;
  let USDT;
  let rowan;
  let usdt;
  let whitelist;

  before(async () => {
    rowan = await MockRowanToken.new('erowan', 'erowan', 18);
    usdt = await MockRowanToken.new('USDT Stablecoin', 'USDT', 6);
    pool = await BPool.deployed();
    whitelist = await OwnableWhitelist.deployed();

    ROWAN = rowan.address;
    USDT = usdt.address;
    POOL = pool.address;

    // admin balances
    await rowan.mint(controller, toWei('70000000'));
    await usdt.mint(controller, toWei('26250', 'mwei'));

    // user balances
    await usdt.mint(user, toWei('100000000', 'mwei'));

    await rowan.approve(POOL, MAX, { from: user });
    await usdt.approve(POOL, MAX, { from: user });

    await rowan.approve(POOL, MAX, { from: controller });
    await usdt.approve(POOL, MAX, { from: controller });

    await pool.bind(ROWAN, toWei('8750000'), toWei(weightRowan.toString()), { from: controller });
    await pool.bind(USDT, toWei('26250', 'mwei'), toWei(weightUsdt.toString()), { from: controller });

    await pool.finalize({ from: controller });

    await whitelist.whitelistUser(user, hashedKey, { from: white_list_manager });
    await pool.setTokenInOut(USDT, ROWAN, {from: controller});

  });

  describe('Pool Operations', () => {
    it('Iterations cycle', async () => {
      assert.equal(
        await whitelist.isWhitelisted(user, { from: white_list_manager }),
        true
      );

      fs.writeFileSync(fileName, "");

      for (let i = 0; i < first_hour_buyers_number; i++) {
        await swapIteration(pool, ROWAN, USDT, user, first_trade_amount, unhashedKey);
        const rowanPrice = await pool.getSpotPrice(USDT, ROWAN);
        console.log(`First hour swap Interation ${i + 1}: Rowan price: ${fromWei(rowanPrice, 'mwei')}`);
        fs.writeFileSync(fileName, `${fromWei(rowanPrice, 'mwei')}\n`, {flag:'a'});
      }

      for (let i = 0; i < hours_in_week; i++) {
        await pool.joinswapExternAmountIn(toWei('364583333333', 'micro'), { from: controller });
        const rowanPrice = await pool.getSpotPrice(USDT, ROWAN);
        console.log(`Liquidity iteration ${i + 1}: Rowan price: ${fromWei(rowanPrice, 'mwei')}`);
        fs.writeFileSync(fileName, `${fromWei(rowanPrice, 'mwei')}\n`, {flag:'a'});
        for (let j = 0; j < subsequent_hour_buyers_number; j++) {
          console.log(`Hour: ${i + 2}`);
          await swapIteration(pool, ROWAN, USDT, user, subsequent_trade_amount, unhashedKey);
          const rowanPrice = await pool.getSpotPrice(USDT, ROWAN);
          console.log(`Swap Interation ${i *subsequent_hour_buyers_number + j + first_hour_buyers_number + 1}: Rowan price: ${fromWei(rowanPrice, 'mwei')}`);
          fs.writeFileSync(fileName, `${fromWei(rowanPrice, 'mwei')}\n`, {flag:'a'});
        }
      }
    });
  });
});
