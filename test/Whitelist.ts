const OwnableWhitelist = artifacts.require("OwnableWhitelist");
const {
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const helpers = require("../helpers/whitelistHelper");

const unhashedKeyArray = [
  "key1",
  "key2",
  "key3",
  "key4"
];
const hashedKeyArray = unhashedKeyArray.map(e => {return helpers.hash(e) });

contract("OwnableWhitelist", (accounts) => {
  const admin = process.env.WHITE_LIST_MANAGER;
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
      const output = await whitelist.isOwner({ from: admin });
      assert.equal(output, true);
      assert.equal(admin, await whitelist.owner());
    });

    it("Owner can add a user to the whitelist", async () => {
      let output = await whitelist.validateWhitelistedUserAndKey(user1, unhashedKeyArray[0]);
      assert.equal(output, false);
      const r = await whitelist.bulkWhitelistUsers([user1], [hashedKeyArray[0]], { from: admin });
      output = await whitelist.validateWhitelistedUserAndKey(user1, unhashedKeyArray[0]);
      assert.equal(output, true);
    });

    it("Whitelisted user that is not owner cannot add to whitelist", async () => {
      let output = await whitelist.validateWhitelistedUserAndKey(user1, unhashedKeyArray[0]);
      assert.equal(output, true);

      output = await whitelist.isOwner({ from: user1 });
      assert.equal(output, false);

      await expectRevert(
        whitelist.bulkWhitelistUsers([user2], [hashedKeyArray[0]], { from: user1 }),
        "Ownable: caller is not the owner"
      );
    });


    it("Non owner can not bulk add users to the whitelist", async () => {
      await expectRevert(
        whitelist.bulkWhitelistUsers(whitelistArray, hashedKeyArray, { from: user2 }),
        "Ownable: caller is not the owner"
      );

      let output = await whitelist.isOwner({ from: user2 });
      assert.equal(output, false);
    });

    it("Owner can bulk add users to the whitelist", async () => {
      await whitelist.bulkWhitelistUsers(whitelistArray, hashedKeyArray, { from: admin });

      output = await whitelist.isOwner({ from: user2 });
      assert.equal(output, false);

      for (let i = 0; i < whitelistArray.length; i++) {
        let userWhitelisted = await whitelist.validateWhitelistedUserAndKey(
          whitelistArray[i],
          unhashedKeyArray[i]
        );
        assert.equal(userWhitelisted, true);
      }
    });

    it("Owner can check if a user is on the whitelist with the key", async () => {
      assert.equal(await whitelist.validateWhitelistedUserAndKey(user1, unhashedKeyArray[0]), true);
    });

    it("Owner can remove a user from the whitelist", async () => {
      assert.equal(await whitelist.validateWhitelistedUserAndKey(user1, unhashedKeyArray[0]), true);
      await whitelist.removeWhitelistedUser(user1, { from: admin });
      assert.equal(await whitelist.validateWhitelistedUserAndKey(user1, unhashedKeyArray[0]), false);
    });
  });
});
