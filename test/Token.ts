const RowanToken = artifacts.require('RowanToken');
const BN = require('bn.js');

contract('RowanToken', accounts => {
    const admin = accounts[0]
    const _name = 'Rowan.eth';
    const _symbol = 'ROWAN';
    const _decimals = 18;
    let rowan;

    it('Init token', async () => {
        rowan = await RowanToken.new(_name, _symbol, _decimals, { from: admin });
    });

    describe('Token attributes', () => {
        it('Has correct name', async () => {
            const name = await rowan.name();
            assert.equal(name, _name);
        });

        it('Has correct symbol', async  () => {
            const symbol = await rowan.symbol();
            assert.equal(symbol, _symbol);
        });

        it('Has correct decimals', async () => {
            const decimals = await rowan.decimals();
            assert.equal(decimals, _decimals);
        });

        it('Admin has correct token balance', async () => {
            let expected = new BN('6342fd08f00f6378000000', 16)
            const balance = await rowan.balanceOf(admin);
            assert.equal(expected.eq(balance), true);
        });

        it('Token contract has correct totalSupply', async () => {
            let expected = new BN('6342fd08f00f6378000000', 16)
            const tokenSupply = await rowan.totalSupply();
            assert.equal(tokenSupply.eq(expected), true);
        });

        it('Token contract should be able to burn tokens by sending to address 1', async () => {
            await rowan.transfer('0x0000000000000000000000000000000000000001', '120000000000000000000000000', { from: admin });
            let expected = new BN('6342fd08f00f6378000000', 16)
            const balance = await rowan.balanceOf('0x0000000000000000000000000000000000000001');

            // make sure that address 1 has all of the tokens
            assert.equal(expected.eq(balance), true);

            // make sure that the admin now has 0 balance after burning their tokens
            const adminBalance = await rowan.balanceOf(admin);

            assert.equal(adminBalance.eq(new BN(0)), true);
        });
    });
});
