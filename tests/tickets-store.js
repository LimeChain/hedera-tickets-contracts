const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const deployer = new etherlime.EtherlimeGanacheDeployer();

const TicketsStore = require('./../build/TicketsStore');

describe('Tickets Store Contract', () => {

    const OWNER = accounts[0].signer;
    const ALICE = accounts[1].signer;

    let contract;
    const TICKETS_AMOUNT = 10;

    const ALL_TICKETS = {
        price: ethers.utils.parseEther('10'),
        available: 10
    }

    beforeEach(async () => {
        contract = await deployer.deploy(TicketsStore, {}, TICKETS_AMOUNT);
    });

    it('Should initialize the contract correctly', async () => {
        const ticketsAmount = await contract.amount();
        assert(ticketsAmount.eq(TICKETS_AMOUNT));
    });

    it('Should set a ticket group by price', async () => {
        await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price);

        const definedTickets = await contract.ticketsByPrice(ALL_TICKETS.price);

        assert(definedTickets.price.eq(ALL_TICKETS.price));
        assert(definedTickets.available.eq(ALL_TICKETS.available));
    });

    it('Should be able to buy a ticket', async () => {
        await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price);
        await contract.from(ALICE).buy(1, { value: ALL_TICKETS.price });

        const ticketOwner = await contract.ticketOwner(ALICE.address);
        assert(ticketOwner.price.eq(ALL_TICKETS.price));
        assert(ticketOwner.quantity.eq(1));

        const availableTickets = await contract.ticketsByPrice(ALL_TICKETS.price);
        assert(availableTickets.available.eq(ALL_TICKETS.available - 1));
    });

    it('Should be able for contract owner to withdraw store balance', async () => {
        await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price);
        await contract.from(ALICE).buy(1, { value: ALL_TICKETS.price });

        const storeBalance = await contract.utils.getBalance();
        await contract.from(OWNER).withdraw();
        const storeBalanceAfterWithdraw = await contract.utils.getBalance();

        assert(storeBalance.eq(ALL_TICKETS.price));
        assert(storeBalanceAfterWithdraw.eq(0));
    });
});
