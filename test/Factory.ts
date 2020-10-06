const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const RowanToken = artifacts.require('RowanToken');
const truffleAssert = require('truffle-assertions');
const { toWei, fromWei } = web3.utils;

const MAX = web3.utils.toTwosComplement(-1);

contract('Factory test', (accounts) => {
    const admin = accounts[0];
    const nonAdmin = accounts[1];
    const user2 = accounts[2];
    let factory;
    let pool;
    let POOL;
    let WETH;
    let DAI;
    it('pool init', async () => {
        factory = await BFactory.deployed();
        const weth = await RowanToken.new('Wrapped Ether', 'WETH', 18);
        const dai = await RowanToken.new('Dai Stablecoin', 'DAI', 18);

        WETH = weth.address;
        DAI = dai.address;

        // admin balances
        await weth.mint(admin, toWei('5'));
        await dai.mint(admin, toWei('200'));

        // nonAdmin balances
        await weth.mint(nonAdmin, toWei('1'), { from: admin });
        await dai.mint(nonAdmin, toWei('50'), { from: admin });

        POOL = await factory.newBPool.call(); // this works fine in clean room
        await factory.newBPool();
        pool = await BPool.at(POOL);

        await weth.approve(POOL, MAX);
        await dai.approve(POOL, MAX);

        await weth.approve(POOL, MAX, { from: nonAdmin });
        await dai.approve(POOL, MAX, { from: nonAdmin });
  });

    it('admin collects fees', async () => {
        await pool.bind(WETH, toWei('5'), toWei('5'));
        await pool.bind(DAI, toWei('200'), toWei('5'));

        await pool.finalize();

        await pool.joinPool(toWei('10'), [MAX, MAX], { from: nonAdmin });
        await pool.exitPool(toWei('10'), [toWei('0'), toWei('0')], { from: nonAdmin });

        // Exit fee = 0 so this wont do anything
        await factory.collect(POOL);

        const adminBalance = await pool.balanceOf(admin);
        assert.equal(fromWei(adminBalance), '100');
    });
});
