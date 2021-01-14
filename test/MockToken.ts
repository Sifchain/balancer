const MockRowanToken = artifacts.require("MockRowanToken");

contract("MockRowanToken", (accounts) => {
  const admin = accounts[0];
  const _name = "erowan";
  const _symbol = "erowan";
  const _decimals = 18;
  let rowan;

  it("Init token", async () => {
    rowan = await MockRowanToken.new(_name, _symbol, _decimals, { from: admin });
  });

  describe("Token attributes", () => {
    it("Has correct name", async () => {
      const name = await rowan.name();
      assert.equal(name, _name);
    });

    it("Has correct symbol", async () => {
      const symbol = await rowan.symbol();
      assert.equal(symbol, _symbol);
    });

    it("Has correct decimals", async () => {
      const decimals = await rowan.decimals();
      assert.equal(decimals, _decimals);
    });
  });
});
