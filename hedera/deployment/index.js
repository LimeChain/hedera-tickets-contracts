const hedera = require('@hashgraph/sdk');
const BigNumber = require('bignumber.js');

const ContractFactory = require('../utils/contract-factory');

// const LinkedList = require("../../build/LinkedList.json");
const TicketsStore = require("../../build/TicketsStore.json");
const TicketsStoreByteCode = TicketsStore.bytecode;

async function deploy () {

    const account = "0.0.42816";
    const privateKey = hedera.Ed25519PrivateKey.fromString("302e020100300506032b657004220420c49c87524b1944a142b58d511f7b094ba7d9d2e1cdd1a9d2c6f3fdcca74ae736");

    const client = hedera.Client.forTestnet();
    client.setOperator(account, privateKey);


    const contractFactory = new ContractFactory(client, privateKey.publicKey);

    // 25% commission of resell ticket going to organization
    const constructorParams = new hedera.ContractFunctionParams().addUint256(new BigNumber(25)).addUint256(new BigNumber(60 * 60 * 24 * 7));

    const contractId = await contractFactory.deploy(TicketsStoreByteCode, constructorParams);
    console.log("contract id", contractId);

    const callResult = await new hedera.ContractCallQuery()
        .setContractId(contractId)
        .setGas(1000)
        .setFunction("eventCommission", null)
        .execute(client);

    console.log(callResult.getUint256(0).toString());

    // // Tickets for 5 hbars price 
    await (await new hedera.ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(200000)
        .setFunction("defineGroup", new hedera.ContractFunctionParams()
            .addUint256(new BigNumber(100)) // total tickets
            .addUint256(new BigNumber('500000000')) // primary price = 5 hbars
            .addUint256(new BigNumber('25000000')) // increase of 0.25 hbars
        )
        .execute(client)).getReceipt(client);

    // Tickets for 10 hbars price 
    await (await new hedera.ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(200000)
        .setFunction("defineGroup", new hedera.ContractFunctionParams()
            .addUint256(new BigNumber(20)) // total tickets
            .addUint256(new BigNumber('1000000000')) // primary price = 10 hbars
            .addUint256(new BigNumber('25000000')) // increase of 0.25 hbars
        )
        .execute(client)).getReceipt(client);


    // Tickets for 15 hbars price 
    await (await new hedera.ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(200000)
        .setFunction("defineGroup", new hedera.ContractFunctionParams()
            .addUint256(new BigNumber(10)) // total tickets
            .addUint256(new BigNumber('1500000000')) // primary price = 15 hbars
            .addUint256(new BigNumber('25000000')) // increase of 0.25 hbars
        )
        .execute(client)).getReceipt(client);

    console.log('Deployed and configured');

    await client.close();
}

deploy();
