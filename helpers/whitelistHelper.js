module.exports.hash = (v => {
    return web3.utils.keccak256(v, {encoding: "hex"})
});
  
module.exports.genHashedKeys = (str, len) => {
    const retArr = []
    for (let i = 0; i < len; i++) {
      retArr.push(this.hash(str + i.toString()))
    }
    return retArr
}