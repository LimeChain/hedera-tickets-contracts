import { BigNumber } from 'bignumber.js';
import { ContractCallQuery, ContractExecuteTransaction, ContractFunctionParams, Hbar } from "@hashgraph/sdk";

export class BaseContract {

    constructor (public readonly provider, public readonly contractID: number) { }

    protected async read (name, args) {
        return new ContractCallQuery()
            .setContractId(this.contractID)
            .setGas(1000)
            .setFunction(name, args)
            .execute(this.provider.client)
    }

    protected async broadcast (name, args, payableAmount: number = 0) {
        await (await new ContractExecuteTransaction()
            .setGas(200000)
            .setFunction(name, args)
            .setContractId(this.contractID)
            .setPayableAmount(new Hbar(new BigNumber(payableAmount)))
            .execute(this.provider.client))
            .getReceipt(this.provider.client);
    }
}
