const config = require('./config.json');

const Provider = require('./provider');
const TicketsStore = require('./ticket-store-contract');

const init = function (account, privateKey) {
    const provider = new Provider(account, privateKey);
    const contract = new TicketsStore(provider, config.TicketStoreContract);

    return {
        provider,
        contract
    }
}

module.exports = init;
