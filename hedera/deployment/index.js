const hedera = require('@hashgraph/sdk');
const BigNumber = require('bignumber.js');

const ContractFactory = require('../utils/contract-factory');

const TicketsStore = require("../../build/TicketsStore.json");
const TicketsStoreByteCode = TicketsStore.bytecode;

async function deploy () {

    const account = "0.0.42816";
    const privateKey = hedera.Ed25519PrivateKey.fromString("302e020100300506032b657004220420c49c87524b1944a142b58d511f7b094ba7d9d2e1cdd1a9d2c6f3fdcca74ae736");

    const client = hedera.Client.forTestnet();
    client.setOperator(account, privateKey);

    const contractFactory = new ContractFactory(client, privateKey.publicKey);

    const TICKETS_AMOUNT = new hedera.ContractFunctionParams().addUint256(new BigNumber(10));
    const contractId = await contractFactory.deploy(TicketsStoreByteCode, TICKETS_AMOUNT);
    console.log("contract id", contractId);


    const callResult = await new hedera.ContractCallQuery()
        .setContractId(contractId)
        .setGas(1000)
        .setFunction("amount", null)
        .execute(client);


    console.log("call gas used:", callResult.gasUsed);
    console.log("message:", callResult.getUint256(0).toString());

    await client.close();
}

deploy();
