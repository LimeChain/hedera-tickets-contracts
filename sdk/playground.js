const hedera = require('@hashgraph/sdk');
const SDK = require('./index')();
const owner = "0.0.42816";
const privateKey = hedera.Ed25519PrivateKey.fromString("302e020100300506032b657004220420c49c87524b1944a142b58d511f7b094ba7d9d2e1cdd1a9d2c6f3fdcca74ae736");



(async () => {
    await SDK.accounts.createAccount()
})()


// console.log(test.accounts.createAccount());


