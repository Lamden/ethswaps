module.exports = {
  testCommand: 'truffle test --network coverage',
  copyNodeModules: true,
  skipFiles: [
      'ERC20.sol',
      'ERC20Basic.sol',
      'TestToken.sol',
      'helpers/Migrations.sol'
  ]
}