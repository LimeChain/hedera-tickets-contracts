const hedera = require('@hashgraph/sdk');

class BaseContract {

    constructor(client, contractID) {
        this.client = client;
        this.contractID = contractID;
    }

    async __callMethod (name, ...params) {
        return await new hedera.ContractCallQuery()
            .setContractId(this.contractID)
            .setGas(1000)
            .setFunction(name, ...params)
            .execute(this.client);
    }
}

module.exports = BaseContract;