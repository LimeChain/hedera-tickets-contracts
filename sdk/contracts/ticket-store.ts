import { BigNumber } from "bignumber.js";
import { ContractFunctionParams } from "@hashgraph/sdk";

import { BaseContract } from "./base-contract";

const FUNCTION_NAMES = {
    // Broadcast functions
    DEFINE_GROUP: 'defineGroup',
    BUY: 'buy',
    RESELL: 'resell',
    REFUND: 'refund',
    WITHDRAW: 'withdraw',
    // Read functions
    WITHDRAWERS: 'withdrawers',
    TICKET_OWNER: 'getOwnedTickets',
}


export class TicketsStore extends BaseContract {

    /* --------- Read functions ------- */
    async withdrawalBalance (): Promise<string> {
        const fnParams = new ContractFunctionParams()
            .addAddress(this.provider.accountAddress);

        const result = await super.read(FUNCTION_NAMES.WITHDRAWERS, fnParams);
        return result.getUint256(0).toString()
    }

    async ownedTickets () {
        const result = await super.read(FUNCTION_NAMES.TICKET_OWNER, null);

        const ownedTickets = {};

        for (let i = 0; i > -1; i++) {
            const group = result.getUint256(i).toString();
            ownedTickets[group] = [];

            const numberOfTickets = result.getUint256(++i).toNumber();
            if (numberOfTickets == 0) {
                break;
            }

            for (let ticketIndex = 1; ticketIndex < numberOfTickets + 1; ticketIndex++) {
                ownedTickets[group].push(result.getUint256(ticketIndex + i).toString());
            }

            i += numberOfTickets;
        }

        return ownedTickets;
    }


    /* --------- Broadcast functions ------- */
    async defineGroup (maxAvailable: number, price: number) {
        const fnParams = new ContractFunctionParams()
            .addUint256(new BigNumber(maxAvailable))
            .addUint256(new BigNumber(price));


        await super.broadcast(FUNCTION_NAMES.DEFINE_GROUP, fnParams);
    }

    async buy (amount: number, ticketGroupID: number) {
        const fnParams = new ContractFunctionParams()
            .addUint256(new BigNumber(ticketGroupID));

        await super.broadcast(FUNCTION_NAMES.BUY, fnParams, amount);
    }

    async resell (groupID: number, ticketID: number, desiredPrice: number) {
        const fnParams = new ContractFunctionParams()
            .addUint256(new BigNumber(groupID))
            .addUint256(new BigNumber(ticketID))
            .addUint256(new BigNumber(desiredPrice));


        await super.broadcast(FUNCTION_NAMES.RESELL, fnParams);
    }

    async refund (groupID: number, ticketID: number) {
        const fnParams = new ContractFunctionParams()
            .addUint256(new BigNumber(groupID))
            .addUint256(new BigNumber(ticketID));


        await super.broadcast(FUNCTION_NAMES.REFUND, fnParams);
    }

    async withdraw () {
        await super.broadcast(FUNCTION_NAMES.WITHDRAW, null);
    }
}
