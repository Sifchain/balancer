const BPool = artifacts.require('BPool');
const ERC20MintableBurnableOwnable = artifacts.require('ERC20MintableBurnableOwnable');
const fs = require('fs');
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
    const user = accounts[1];
    const controller = JSON.parse(fs.readFileSync('Accounts',"utf8"))['account'];

    let pool;
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
        const adminRowanBalance = await rowan.balanceOf(controller);
        console.log(`Rowan Admin Balance: ${fromWei(adminRowanBalance)}`);
        const userUsdtBalance = await usdt.balanceOf(user);
        console.log(`USDT User Balance: ${fromWei(userUsdtBalance)}`);
        const adminUsdtBalance = await usdt.balanceOf(controller);
        console.log(`USDT Admin Balance: ${fromWei(adminUsdtBalance)}`);
        const UsdtBalance = await pool.getBalance(USDT);
        console.log(`USDT amount in pool : ${fromWei(UsdtBalance)}`);
        console.log('');
    }

    it('pool init', async () => {
        rowan = await ERC20MintableBurnableOwnable.new('Rowan.eth', 'ROWAN', 18);
        usdt = await ERC20MintableBurnableOwnable.new('USDT Stablecoin', 'USDT', 18);

        pool = await BPool.deployed();

        whitelist = await OwnableWhitelist.deployed(); // grab the existing whitelist

        ROWAN = rowan.address;
        USDT = usdt.address;

        // admin balances
        await rowan.mint(controller, toWei('120000000'));
        await usdt.mint(controller, toWei('45000'));

        // user balances
        await usdt.mint(user, toWei('100'));

        await rowan.approve(pool.address, MAX, { from: user });
        await usdt.approve(pool.address, MAX, { from: user });

        await rowan.approve(pool.address, MAX, { from: controller });
        await usdt.approve(pool.address, MAX, { from: controller });

        await pool.bind(ROWAN, toWei('15000000'), toWei(weightRowan.toString()), { from: controller });
        await pool.bind(USDT, toWei('45000'), toWei(weightUsdt.toString()), { from: controller });

        await pool.setSwapFee(swap_fee, { from: controller });

        await pool.finalize({ from: controller });
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
            await whitelist.isWhitelisted(user, { from: accounts[0] }),
            false
        );
        await whitelist.whitelistUser(user, { from: accounts[0] })
        assert.equal(
            await whitelist.isWhitelisted(user, { from: accounts[0] }),
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
        await pool.joinswapExternAmountIn(ROWAN, toWei('625000'), 0, { from: controller });
        if(verbose) {
            console.log('After adding liquidity:');
            await logState();
        }
    });

    it('Exit pool', async () => {
        const adminBal = await pool.balanceOf(controller);
        await pool.exitPool(adminBal, [0, 0], { from: controller });
        if(verbose) {
            console.log('After exiting pool:');
            await logState();
        }
    });
});
