const RowanToken = artifacts.require('RowanToken');

contract('RowanToken', accounts => {
    const _name = 'Rowan.eth';
    const _symbol = 'ROWAN';
    const _decimals = 18;
    let rowan;

    it('Init token', async () => {
        rowan = await RowanToken.new(_name, _symbol, _decimals);
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
    });
});
