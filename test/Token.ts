const TToken = artifacts.require('TToken');

contract('TestToken', accounts => {
    const _name = 'Rowan.eth';
    const _symbol = 'ROWAN';
    const _decimals = 18;
    let rowan;

    describe('token attributes', function() {
        it('Init token', async () => {
            rowan = await TToken.new(_name, _symbol, _decimals);
        });

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
