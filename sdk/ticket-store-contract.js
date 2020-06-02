const hedera = require('@hashgraph/sdk');
const BigNumber = require('bignumber.js').BigNumber;

const BaseContract = require('./base-contract');

class TicketStoreContract extends BaseContract {

   

    async offeringExpiration() {
        const offeringExpiration = await super.__callMethod('offeringExpiration', null);
        return offeringExpiration.getUint256(0).toString()
    }

    async eventCommission() {
        const eventCommission = await super.__callMethod('eventCommission', null);
        return eventCommission.getUint256(0).toString()
    }

    async getWithdrawerBalance(address) {
        const withdrawerBalance = await super.__callMethod('eventCommission', 
            new hedera.ContractFunctionParams().addAddress(address));
        
        return withdrawerBalance.addAddress(0).toString()
    }

    async getTicketsOwner() {

    }

    async getResellerPrices() {

    }


    // Todo: Implement pre-validations
    async defineGroup (maxAvailable, price) {
        await super.__callMethod('defineGroup',
            new hedera.ContractFunctionParams().addUint256(maxAvailable),
            new hedera.ContractFunctionParams().addUint256(new BigNumber(price))
        );
    }

    // Todo: Get group price by group ID
    async buy (quantity, groupId) {
        const callResult = await new hedera.ContractCallQuery()
            .setContractId(this.contractID)
            .setGas(1000)
            .setFunction("buy",
                new hedera.ContractFunctionParams().addUint256(new BigNumber(price)))
            .execute(this.client);
        
    }

    async withdraw () {
        await super.__callMethod('withdraw', null);
    }

    // Todo: Check out how structs are handled in response
    async getTicketsByOwner () {
        const result = await super.__callMethod(
            'ticketOwner',
            new hedera.ContractFunctionParams().addAddress(this.account)
        );


        return result;
    }

    // Todo: Think how this should work properly
    getTicketsByPrice () {

    }

    resell(groupId, desiredPrice) {

    }

    refund(groupID, ticketID) {

    }
}

module.exports = TicketStoreContract;
