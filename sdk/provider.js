const hedera = require('@hashgraph/sdk');

class Provider {
    constructor(account, privateKey) {
        const client = hedera.Client.forTestnet();
        const hederaKey = hedera.Ed25519PrivateKey.fromString(privateKey);
        client.setOperator(account, hederaKey);

        return client;
    }
}

module.exports = Provider;
