const Web3 = require("web3");

module.exports.hash = (v => {
  return Web3.utils.keccak256(v)
});

module.exports.genHashedKeys = (str, len) => {
  const retArr = [];
  for (let i = 0; i < len; i++) {
    retArr.push(
      (this.hash(str + i.toString())).toString().substring(2)
    )
  }
  return retArr
};


module.exports.genKeys = (str, len) => {
  const retArr = [];
  for (let i = 0; i < len; i++) {
    retArr.push(str + i.toString())
  }
  return retArr
};