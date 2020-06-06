const hedera = require('@hashgraph/sdk');
const BigNumber = require('bignumber.js').BigNumber;
const BaseContract = require('./base-contract');
const functions = require('./constants/contractFunctions')

class TicketStoreContract extends BaseContract {

    constructor(client, contractID) {
        super(client, contractID)

        this.account = client._getOperatorAccountId()
    }

    async offeringExpiration() {
        const offeringExpiration = await super.__callMethod(
            functions.OFFERING_EXPIRATION,
            null
        );

        return offeringExpiration.getUint256(0).toString()
    }

    async eventCommission() {
        const eventCommission = await super.__callMethod(
            functions.EVENT_COMMISSION,
            null
        );
        return eventCommission.getUint256(0).toString()
    }

    async withdrawerBalance() {
        const withdrawerBalance = await super.__callMethod(
            functions.WITHDRAWERS, 
            new hedera.ContractFunctionParams().addAddress(this.account)
        );
        
        return withdrawerBalance.getUint256(0).toString()
    }

    async getTicketsByOwner(ticketGroupID) {

        //TODO check how the mapping is parsed and how to return all the tickets
        const result = await super.__callMethod(
            functions.TICKET_OWNER,
            new hedera.ContractFunctionParams().addAddress(this.account),
            new hedera.ContractFunctionParams().addUint256(ticketGroupID)
        );

        return result.ContractFunctionParams().getUint256(0).toString(); //
    }

    async getTicketGroup(ticketGroupID) {
        const ticketGroup = await super.__callMethod(
            functions.GROUPS,
            new hedera.ContractFunctionParams().addUint256(ticketGroupID)
        )

        //TODO check how array of structs is handled 
        console.log(ticketGroup);
        return ticketGroup
    }

    async getTicketGroups() {
        const ticketGroups = await super.__callMethod(
            functions.GROUPS,
            null
        )

        //TODO check how array of structs is handled 
        console.log(ticketGroups);
        return ticketGroups
    }

    //
    async getResellerPrices(price) {
        const ticketsForResell = await super.__callMethod(
            functions.TIKETS_FOR_RESELL,
            new hedera.ContractFunctionParams().addAddress(this.account),
            new hedera.ContractFunctionParams().addUint256(new BigNumber(price))
        );

        //TODO check how array of structs is handled 
        console.log(ticketsForResell);
        return ticketsForResell
    }

    async defineGroup (maxAvailable, price) {
        await super.__callMethod(functions.DEFINE_GROUP,
            new hedera.ContractFunctionParams().addUint256(maxAvailable),
            new hedera.ContractFunctionParams().addUint256(new BigNumber(price))
        );
    }

    // Todo: Get group price by group ID
    async buy(ticketGroupID) {

        const result = await super.__callMethod(
            functions.BUY,
            new hedera.ContractFunctionParams().addUint256(ticketGroupID)
        )
    }

    async resell(groupID, ticketID, desiredPrice) {
        const result = await super.__callMethod(
            functions.RESELL,
            new hedera.ContractFunctionParams().addUint256(groupID),
            new hedera.ContractFunctionParams().addUint256(ticketID),
            new hedera.ContractFunctionParams().addUint256(desiredPrice)
        ) 
    }

    async refund(groupID, ticketID) {
        const result = await super.__callMethod(
            functions.RESELL,
            new hedera.ContractFunctionParams().addUint256(groupID),
            new hedera.ContractFunctionParams().addUint256(ticketID),
        ) 
    }

    async withdraw () {
        await super.__callMethod(functions.WITHDRAW, null);
    }
}

module.exports = TicketStoreContract;
