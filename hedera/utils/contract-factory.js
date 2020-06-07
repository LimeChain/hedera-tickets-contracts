const hedera = require('@hashgraph/sdk');
const FileFactory = require('./file-factory');

class ContractFactory {

    constructor (client, publicKey) {
        this.client = client;
        this.fileFactory = new FileFactory(client, publicKey);
    }

    async deploy (bytecode, ...params) {
        const fileId = await this.fileFactory.createFile(bytecode);

        const transaction = new hedera.ContractCreateTransaction();
        transaction.setMaxTransactionFee(new hedera.Hbar(200));
        transaction.setGas(1000000);
        transaction.setConstructorParams(...params);
        transaction.setBytecodeFileId(fileId);

        const result = await (await transaction.execute(this.client)).getRecord(this.client);
        return result.receipt.getContractId();
    }
}



module.exports = ContractFactory;
