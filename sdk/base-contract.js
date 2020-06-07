class BaseContract {

    constructor(provider, contractID) {
        this.provider = provider;
        this.contractID = contractID;
    }

    __callMethod (name, ...params) {
        await new hedera.ContractCallQuery()
            .setContractId(this.contractID)
            .setGas(1000)
            .setFunction(name, params)
            .execute(this.client);
    }
}

module.exports = BaseContract;
