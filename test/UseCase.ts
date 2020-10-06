const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const ERC20MintableBurnableOwnable = artifacts.require('ERC20MintableBurnableOwnable');
const OwnableWhitelist = artifacts.require('OwnableWhitelist');

const truffleAssert = require('truffle-assertions');
const { toWei, fromWei } = web3.utils;
const MAX = web3.utils.toTwosComplement(-1);
const { calcOutGivenIn, calcInGivenOut, calcRelativeDiff } = require('./../calc_comparisons.ts');
const errorDelta = 10 ** -8;
const weightUsdt = 1;
const weightRowan = 10;
const swap_fee = 0.0;
const verbose = true;

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
    let whitelist;

    async function logState(){
        const RowanBalance = await pool.getBalance(ROWAN);
        console.log(`Rowan amount in pool : ${fromWei(RowanBalance)}`);

        if(parseInt(fromWei(RowanBalance))) {
            const RowanPrice = await pool.getSpotPrice(USDT, ROWAN);
            console.log(`Rowan price: ${fromWei(RowanPrice)}`);
        }

        const userRowanBalance = await rowan.balanceOf(user);
        console.log(`Rowan User Balance: ${fromWei(userRowanBalance)}`);
        const adminRowanBalance = await rowan.balanceOf(admin);
        console.log(`Rowan Admin Balance: ${fromWei(adminRowanBalance)}`);
        const userUsdtBalance = await usdt.balanceOf(user);
        console.log(`USDT User Balance: ${fromWei(userUsdtBalance)}`);
        const adminUsdtBalance = await usdt.balanceOf(admin);
        console.log(`USDT Admin Balance: ${fromWei(adminUsdtBalance)}`);
        const UsdtBalance = await pool.getBalance(USDT);
        console.log(`USDT amount in pool : ${fromWei(UsdtBalance)}`);
        console.log('');
    }

    it('pool init', async () => {
        factory = await BFactory.deployed();

        rowan = await ERC20MintableBurnableOwnable.new('Rowan.eth', 'ROWAN', 18);
        usdt = await ERC20MintableBurnableOwnable.new('USDT Stablecoin', 'USDT', 18);
        
        whitelist = await OwnableWhitelist.deployed(); // grab the existing whitelist

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

        await pool.bind(ROWAN, toWei('15000000'), toWei(weightRowan.toString()));
        await pool.bind(USDT, toWei('45000'), toWei(weightUsdt.toString()));

        await pool.setSwapFee(swap_fee);

        await pool.finalize();
    });

    it('Should not be able to mint if the minter is not admin', async () => {
        await truffleAssert.reverts(
            usdt.mint(user, toWei('100'), { from: user }),
            "Ownable: caller is not the owner"
        );
    })

    it('Should not be able to burn if the burner is not admin', async () => {
        await truffleAssert.reverts(
            usdt.burn(user, toWei('100'), { from: user }),
            "Ownable: caller is not the owner"
        );
    })

    it('Should be able to burn if the burner is the admin', async () => {
        const balanceOfOwner = await usdt.balanceOf(admin);
        await usdt.mint(admin, '100', { from: admin })
        assert.equal((await usdt.balanceOf(admin)) > 0, true);

        usdt.burn(admin, '100', { from: admin })

        assert.equal((await usdt.balanceOf(admin)) < 1, true);
    })

    it('Swap iteration', async () => {
        const UsdtPoolBalance = await pool.getBalance(USDT);
        const RowanPoolBalance = await pool.getBalance(ROWAN);
        const expected = calcOutGivenIn(fromWei(UsdtPoolBalance), weightUsdt, fromWei(RowanPoolBalance), weightRowan, 1, swap_fee);

        if(verbose) {
            console.log('Before swap:');
            await logState();
        }

        await truffleAssert.reverts(
            pool.swapExactAmountIn(USDT, toWei('1'), ROWAN, 0, MAX, { from: user }),
            '!whitelisted',
        );

        assert.equal(
            await whitelist.isWhitelisted(user, { from: admin }),
            false
        );
        await whitelist.whitelistUser(user, { from: admin })
        assert.equal(
            await whitelist.isWhitelisted(user, { from: admin }),
            true
        );

        const txr = await pool.swapExactAmountIn(
            USDT,
            toWei('1'),
            ROWAN,
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

    it('Liquidity iteration', async () => {
        await pool.joinswapExternAmountIn(ROWAN, toWei('625000'), 0);
        if(verbose) {
            console.log('After adding liquidity:');
            await logState();
        }
    });

    it('Exit pool', async () => {
        const adminBal = await pool.balanceOf(admin);
        await pool.exitPool(adminBal, [0, 0]);
        if(verbose) {
            console.log('After exiting pool:');
            await logState();
        }
    });
});