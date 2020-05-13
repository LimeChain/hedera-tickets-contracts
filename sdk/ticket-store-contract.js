const hedera = require('@hashgraph/sdk');
const BigNumber = require('bignumber.js');

const BaseContract = require('./base-contract');

class TicketStoreContract extends BaseContract {

    // Todo: Implement pre-validations
    defineGroup (maxAvailable, price) {
        await super.__callMethod('defineGroup',
            new hedera.ContractFunctionParams().addUint256(maxAvailable),
            new hedera.ContractFunctionParams().addUint256(new BigNumber(price))
        );
    }

    // Todo: Get group price by group ID
    buy (quantity, groupId) {

        // const callResult = await new hedera.ContractCallQuery()
        //     .setContractId(this.contractID)
        //     .setGas(1000)
        //     .setFunction("buy",
        //         new hedera.ContractFunctionParams().addUint256(new BigNumber(price)))
        //     .execute(this.client);

        // const callResult = await new hedera.ContractCallQuery()
        //     .setContractId(this.contractID)
        //     .setGas(1000)
        //     .setFunction("buy",
        //         new hedera.ContractFunctionParams().addUint256(new BigNumber(price)))
        //     .execute(this.client);
    }

    withdraw () {
        await super.__callMethod('withdraw', null);
    }

    // Todo: Check out how structs are handled in response
    getTicketsByOwner () {
        const result = await super.__callMethod(
            'ticketOwner',
            new hedera.ContractFunctionParams().addAddress(this.account)
        );


        return result;
    }

    // Todo: Think how this should work properly
    getTicketsByPrice () {

    }
}

module.exports = TicketStoreContract;
