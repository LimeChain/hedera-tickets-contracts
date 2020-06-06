//TO BE IMPLEMENTED IN THE BACKEND
const hedera = require('@hashgraph/sdk');
const { Ed25519PrivateKey, AccountCreateTransaction, Hbar, AccountBalanceQuery } = hedera;

class Accounts {

    constructor(privateKey) {
        console.log('in constructor -> ', privateKey);
        
        this._privateKey = privateKey;
    }

    async createAccount() {
        const privateKey = await Ed25519PrivateKey.generate();

        console.log("Creating an account to delete");
        console.log(`private = ${privateKey.toString()}`);
        console.log(`public = ${privateKey.publicKey.toString()}`);


        const client = this.__getClient()
        // let transactionId = await new AccountCreateTransaction()
        //     .setKey(privateKey.publicKey)
        //     .setInitialBalance(new Hbar(2))
        //     .execute(client);

        // console.log(transactionId);
        

        // let transactionReceipt = await transactionId.getReceipt(client);
        // const newAccountId = transactionReceipt.getAccountId();

        // console.log(`account = ${newAccountId}`);
    }

    __getClient() {
        let client = hedera.Client.forTestnet();
        console.log('this._privateKey');
        console.log(this._privateKey);
        
        // client.setOperator("0.0.42816", hedera.Ed25519PrivateKey.fromString("302e020100300506032b657004220420c49c87524b1944a142b58d511f7b094ba7d9d2e1cdd1a9d2c6f3fdcca74ae736"));
        // return client
    }
}


module.exports = Accounts

