import { Client, Ed25519PrivateKey } from "@hashgraph/sdk";

export class TestNetProvider {
    public readonly client: Client;
    public readonly accountAddress: string;

    constructor (account, privateKey) {
        this.client = Client.forTestnet();
        const hederaKey = Ed25519PrivateKey.fromString(privateKey);
        this.client.setOperator(account, hederaKey);

        this.accountAddress = accountIdToHexAddress(account);
    }
}

const accountIdToHexAddress = function (accountId: string): string {
    const defaultAddress = '0000000000000000000000000000000000000000';
    const accountNo = accountId.split('.')[2];
    const hexAddressRaw = parseInt(accountNo).toString(16);
    const remainingCount = 40 - hexAddressRaw.length;
    const hexAddress = defaultAddress.substr(0, remainingCount) + hexAddressRaw + defaultAddress.substr(remainingCount + hexAddressRaw.length);

    return hexAddress;
};