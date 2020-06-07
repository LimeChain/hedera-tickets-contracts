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


    // const contractFactory = new ContractFactory(client, privateKey.publicKey);

    // const constructorParams = new hedera.ContractFunctionParams().addUint256(new BigNumber(25)).addUint256(new BigNumber(60 * 60 * 24 * 7));

    // const contractId = await contractFactory.deploy(TicketsStoreByteCode, constructorParams);
    // console.log("contract id", contractId);

    const contractId = '0.0.62290';

    // const callResult = await new hedera.ContractCallQuery()
    //     .setContractId(contractId)
    //     .setGas(1000)
    //     .setFunction("eventCommission", null)
    //     .execute(client);

    // const callResult1 = await (await new hedera.ContractExecuteTransaction()
    //     .setContractId(contractId)
    //     .setGas(200000)
    //     .setFunction("defineGroup", new hedera.ContractFunctionParams().addUint256(new BigNumber(10)).addUint256(new BigNumber(20)))
    //     .execute(client)).getReceipt(client);

    // console.log('here')
    const callResult2 = await new hedera.ContractCallQuery()
        .setContractId(contractId)
        .setGas(10000)
        .setFunction("groups", new hedera.ContractFunctionParams().addUint256(0))
        .execute(client);


    // assert(definedTickets.price.eq(ALL_TICKETS.price));
    // assert(definedTickets.sellCurve.eq(ALL_TICKETS.price));
    // assert(definedTickets.total.eq(ALL_TICKETS.available));
    // assert(definedTickets.available.eq(ALL_TICKETS.available));
    // assert(definedTickets.resellers != 0x0);

    console.log("call gas used:", callResult2);
    console.log("message:", callResult2.getAddress(4).toString());

    await client.close();
}

deploy();
