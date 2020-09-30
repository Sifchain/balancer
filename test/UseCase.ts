const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const truffleAssert = require('truffle-assertions');
const { toWei, fromWei } = web3.utils;
const MAX = web3.utils.toTwosComplement(-1);
const { calcOutGivenIn, calcInGivenOut, calcRelativeDiff } = require('./../calc_comparisons.ts');


contract('Our use case', (accounts) => {
    const admin = accounts[0];
    const user = accounts[1];

    let factory;
    let pool;
    let POOL;
    let ROWAN;
    let USDT;
    let rowan;
    let usdt;

    it('pool init', async () => {
        factory = await BFactory.deployed();
        rowan = await TToken.new('Rowan.eth', 'ROWAN', 18);
        usdt = await TToken.new('USDT Stablecoin', 'USDT', 18);

        ROWAN = rowan.address;
        USDT = usdt.address;

        // admin balances
        await rowan.mint(admin, toWei('120000000'));
        await usdt.mint(admin, toWei('45000'));

        // user balances
        await usdt.mint(user, toWei('100'), { from: admin });

        POOL = await factory.newBPool.call(); // this works fine in clean room
        await factory.newBPool();
        pool = await BPool.at(POOL);

        await rowan.approve(POOL, MAX);
        await usdt.approve(POOL, MAX);

        await rowan.approve(POOL, MAX, { from: user });
        await usdt.approve(POOL, MAX, { from: user });

        await pool.bind(ROWAN, toWei('15000000'), toWei('1'));
        await pool.bind(USDT, toWei('45000'), toWei('1'));

        await pool.finalize();
    });

    it('Exchainge', async () => {
        const expected = calcOutGivenIn(45000, 10, 15000000, 1, 1.0, 0.0);
        let RowanPrice = await pool.getSpotPrice(USDT, ROWAN);
        console.log(`Rowan price before transaction : ${fromWei(RowanPrice)}`);
        let userUsdtBalance = await usdt.balanceOf(user);
        console.log(`USDT User Balance before transaction : ${fromWei(userUsdtBalance)}`);

        const txr = await pool.swapExactAmountIn(
            USDT,
            toWei('1'),
            ROWAN,
            toWei('100'),
            toWei('1000'),
            { from: user },
        );

        userUsdtBalance = await usdt.balanceOf(user);
        console.log(`USDT User Balance after transaction : ${fromWei(userUsdtBalance)}`);

        const userRowanBalance = await rowan.balanceOf(user);
        console.log(`Rowan User Balance after transaction : ${fromWei(userRowanBalance)}`);

        RowanPrice = await pool.getSpotPrice(USDT, ROWAN);
        console.log(`Rowan price before transaction : ${fromWei(RowanPrice)}`);

        const usdtNormWeight = await pool.getNormalizedWeight(USDT);
        assert.equal(0.5, fromWei(usdtNormWeight));

        /*
        const log = txr.logs[0];
        assert.equal(log.event, 'LOG_SWAP');

        const actual = fromWei(log.args[4]);
        const relDif = calcRelativeDiff(expected, actual);

        console.log(`expected: ${expected})`);
        console.log(`actual : ${actual})`);
        console.log(`relDif : ${relDif})`);
        assert.equal(fromWei(userUsdtBalance), Number(fromWei(log.args[4])));
        */
    });

    it('Liquidity iteration', async () => {
        await pool.joinPool(toWei('10'), [MAX, MAX], { from: admin });
    });
});