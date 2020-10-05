const TToken = artifacts.require('TToken');

contract('TestToken', accounts => {
    const _name = 'Rowan.eth';
    const _symbol = 'ROWAN';
    const _decimals = 18;
    let rowan;

    describe('token attributes', function() {
        it('Has correct name', async () => {
            rowan = await TToken.new(_name, _symbol, _decimals);
            const name = await rowan.name();
            assert.equal(name, _name);
        });

        it('Has correct symbol', async  () => {
            rowan = await TToken.new(_name, _symbol, _decimals);
            const symbol = await rowan.symbol();
            assert.equal(symbol, _symbol);
        });

        it('Has correct decimals', async () => {
            rowan = await TToken.new(_name, _symbol, _decimals);
            const decimals = await rowan.decimals();
            assert.equal(decimals, _decimals);
        });
    });
});
