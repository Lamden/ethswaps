module.exports = {
  networks: {
      development: {
          network_id: "*",
          host: "localhost",
          port: 8545,
          gas: 4000000,
          gasPrice: 0,
      },
      coverage: {
          host: "localhost",
          network_id: "*",
          port: 8555,
          gas: 0xfffffffffff,
          gasPrice: 0x0
      }
  },
  mocha: {
      enableTimeouts: false
  }
};