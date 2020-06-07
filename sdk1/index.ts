const config = require('./config.json');

import { TestNetProvider } from "./providers/test-net-provider";
import { TicketsStore } from "./contracts/ticket-store";


export const init = function (account, privateKey) {
    const provider = new TestNetProvider(account, privateKey);
    const contract = new TicketsStore(provider, config.TicketStoreContract);

    return {
        provider,
        contract
    }
}
