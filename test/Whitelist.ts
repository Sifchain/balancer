const OwnableWhitelist = artifacts.require("OwnableWhitelist");
const {
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

contract("OwnableWhitelist", (accounts) => {
  const admin = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const user5 = accounts[5];

  let whitelist;
  const whitelistArray = [user2, user3, user4, user5];

  it("Init whitelist", async () => {
    whitelist = await OwnableWhitelist.new({ from: admin });
  });

  describe("Whitelist Test", () => {
    it("Owner is whitelisted", async () => {
      const output = await whitelist.isWhitelisted(admin);
      assert.equal(output, true);
    });

    it("Owner can add a user to the whitelist", async () => {
      let output = await whitelist.isWhitelisted(user1);
      assert.equal(output, false);

      await whitelist.whitelistUser(user1, { from: admin });
      output = await whitelist.isWhitelisted(user1);

      assert.equal(output, true);
    });

    it("Whitelisted user that is not owner cannot add to whitelist", async () => {
      let output = await whitelist.isWhitelisted(user1);
      assert.equal(output, true);

      output = await whitelist.isOwner({ from: user1 });
      assert.equal(output, false);

      await expectRevert(
        whitelist.whitelistUser(user2, { from: user1 }),
        "Ownable: caller is not the owner"
      );
    });

    it("Non-whitelisted user that is not owner cannot add to whitelist", async () => {
      let output = await whitelist.isWhitelisted(user2);
      assert.equal(output, false);

      output = await whitelist.isOwner({ from: user2 });
      assert.equal(output, false);

      await expectRevert(
        whitelist.whitelistUser(user3, { from: user2 }),
        "Ownable: caller is not the owner"
      );
    });

    it("Non owner can not bulk add users to the whitelist", async () => {
      await expectRevert(
        whitelist.bulkWhitelistUsers(whitelistArray, { from: user2 }),
        "Ownable: caller is not the owner"
      );

      let output = await whitelist.isOwner({ from: user2 });
      assert.equal(output, false);
    });

    it("Owner can bulk add users to the whitelist", async () => {
      await whitelist.bulkWhitelistUsers(whitelistArray, { from: admin });

      output = await whitelist.isOwner({ from: user2 });
      assert.equal(output, false);

      for (let i = 0; i < whitelistArray.length; i++) {
        const userWhitelisted = await whitelist.isWhitelisted(
          whitelistArray[i]
        );
        assert.equal(userWhitelisted, true);
      }
    });
  });
});
