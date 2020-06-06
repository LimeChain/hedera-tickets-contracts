var assert = require('chai').assert;
const hedera = require('@hashgraph/sdk');
const { Ed25519PrivateKey, AccountCreateTransaction, Hbar, AccountBalanceQuery } = require('@hashgraph/sdk');
const ethers = require('ethers');
const BigNumber = require('bignumber.js').BigNumber;


const ContractFactory = require('../../hedera/utils/contract-factory')
const TicketsStore  = require("../../build/TicketsStore.json");
const TicketsStoreByteCode = TicketsStore.bytecode;
const TicketStoreSDK = require('../ticket-store-contract');

describe.only('Ticket Store SDK', () => {

    const owner = "0.0.42816";
    const privateKey = hedera.Ed25519PrivateKey.fromString("302e020100300506032b657004220420c49c87524b1944a142b58d511f7b094ba7d9d2e1cdd1a9d2c6f3fdcca74ae736");
    const client = hedera.Client.forTestnet();
    
    client.setOperator(owner, privateKey);

    
    let ticketStoreSDK;
    const COMMISSION_PERCENTAGE = 20;
    const DURATION_PERIOD = 7 * 24 * 60 * 60; // 7 days

    const ALL_TICKETS = {
        price: ethers.utils.parseEther('10'),
        available: 10
    }
    
    beforeEach(async () => {
        const contractFactory = new ContractFactory(client, privateKey.publicKey);
        const COMMISSION = new hedera.ContractFunctionParams().addUint256(new BigNumber(COMMISSION_PERCENTAGE));
        const DURATION = new hedera.ContractFunctionParams().addUint256(new BigNumber(DURATION_PERIOD));
        // console.log('1. here? ');
 
        // const contractId = await contractFactory.deploy(TicketsStoreByteCode, COMMISSION, DURATION);
        // // const contractId = await contractFactory.deploy(TicketsStoreByteCode, COMMISSION_PERCENTAGE, DURATION_PERIOD);
        // console.log('here? ');
        
        // ticketStoreSDK = await new TicketStoreSDK(client, contractId)

        console.log(client._getOperatorAccountId());
        console.log(client._getOperatorKey());
        
        return

    });

    it.only('Should get correct amount from contract', async () => {
        let ticketsAmount = await ticketStoreSDK.__callMethod('amount', null)
        let parsedTickedAmount = ticketsAmount.getUint256(0).toString()
        
        assert.equal(parsedTickedAmount, TICKETS_AMOUNT);
    });


    after(async () => {
        await client.close();

    });


});
