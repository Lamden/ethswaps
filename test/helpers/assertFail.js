/* global assert */

module.exports = async function assertFail(callback) {
  let web3ErrorThrown = false;

  try {
      await callback;
  }
  catch (error) {
      if (error.message.search("invalid opcode")) {
          web3ErrorThrown = true;
      }
  }

  assert(web3ErrorThrown, "Transaction should fail");
};