const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const deployer = new etherlime.EtherlimeGanacheDeployer();

const TicketsStore = require('./../build/TicketsStore');

describe('Tickets Store Contract', () => {

    const OWNER = accounts[0].signer;
    const ALICE = accounts[1].signer;

    let contract;

    const ALL_TICKETS = {
        price: ethers.utils.parseEther('10'),
        available: 10
    }

    beforeEach(async () => {
        contract = await deployer.deploy(TicketsStore, {});
    });

    describe('Define Group', function () {
        it('Should add 5 ticket groups', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price);

            const definedTickets = await contract.groups(0);

            assert(definedTickets.price.eq(ALL_TICKETS.price));
            assert(definedTickets.sellCurve.eq(ALL_TICKETS.price));
            assert(definedTickets.total.eq(ALL_TICKETS.available));
            assert(definedTickets.available.eq(ALL_TICKETS.available));
        });

        it('Should throw if non-owner try to set a new group', async () => {
            await assert.revertWith(
                contract.from(ALICE).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price),
                'Ownable: caller is not the owner'
            );
        });

        it('Should throw a ticket group has been already defined', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price);

            await assert.revertWith(
                contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price),
                'Such a group already exists'
            );
        });
    });


    describe('Buy a ticket', function () {
        describe('Buy from the primary market', function () {

            const GROUP_ID = 0;

            it('Should buy a ticket', async () => {
                await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price);
                
                await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price });

                const aliceTicketPrice = await contract.ticketsOwner(ALICE.address, GROUP_ID, 0);
                assert(aliceTicketPrice.eq(ALL_TICKETS.price));

                const storeBalance = await contract.withdrawers(contract.contractAddress)
                assert(storeBalance.eq(ALL_TICKETS.price));

                const contractBalance = await contract.utils.getBalance();
                assert(contractBalance.eq(ALL_TICKETS.price));

                const group = await contract.groups(GROUP_ID);
                assert(group.available.eq(ALL_TICKETS.available - 1));
                assert(group.sellCurve.eq(ALL_TICKETS.price.add(1)));
            });

            it('Should buy a ticket by providing higher price', async () => {
                await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price); // Set tickets price to 10 ethers

                const HIGHER_PRICE = ethers.utils.parseEther('11'); // Provide 11 ethers
                const EXPECTED_WITHDRAWAL_BALANCE = HIGHER_PRICE.sub(ALL_TICKETS.price); // 1 ether
                await contract.from(ALICE).buy(GROUP_ID, { value: HIGHER_PRICE });

                const aliceTicketPrice = await contract.ticketsOwner(ALICE.address, GROUP_ID, 0);
                assert(aliceTicketPrice.eq(ALL_TICKETS.price));

                const aliceWithdrawalBalance = await contract.withdrawers(ALICE.address);
                assert(aliceWithdrawalBalance.eq(EXPECTED_WITHDRAWAL_BALANCE));

                const storeBalance = await contract.withdrawers(contract.contractAddress)
                assert(storeBalance.eq(ALL_TICKETS.price));

                const contractBalance = await contract.utils.getBalance();;
                assert(contractBalance.eq(HIGHER_PRICE));

                const group = await contract.groups(GROUP_ID);
                assert(group.available.eq(ALL_TICKETS.available - 1));
                assert(group.sellCurve.eq(ALL_TICKETS.price.add(1)));
            });
    
            it('Should throw if wrong group id provided', async () => {
                await assert.revertWith(
                    contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price }),
                    'Such tickets group does not exist'
                );
            });
    
            it('Should throw if not enough money provided', async () => {
                await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price);
    
                await assert.revertWith(
                    contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price.div(2) }),
                    'Not enough money'
                );
            });

            it('Should throw if there are not any tickets left', async () => {
                await contract.from(OWNER).defineGroup(0, ALL_TICKETS.price);
    
                await assert.revertWith(
                    contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price }),
                    'There are not any left tickets'
                );
            });
        });

        describe('Buy from the secondary market', function () {

        });
    });

    describe('Resell a ticket', function () {

    });

    describe('Refund a ticket', function () {

    });
    // it('Should be able to buy a ticket', async () => {
    //     await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price);
    //     await contract.from(ALICE).buy(1, { value: ALL_TICKETS.price });

    //     const ticketOwner = await contract.ticketOwner(ALICE.address);
    //     assert(ticketOwner.price.eq(ALL_TICKETS.price));
    //     assert(ticketOwner.quantity.eq(1));

    //     const availableTickets = await contract.ticketsByPrice(ALL_TICKETS.price);
    //     assert(availableTickets.available.eq(ALL_TICKETS.available - 1));
    // });

    // it('Should be able for contract owner to withdraw store balance', async () => {
    //     await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price);
    //     await contract.from(ALICE).buy(1, { value: ALL_TICKETS.price });

    //     const storeBalance = await contract.utils.getBalance();
    //     await contract.from(OWNER).withdraw();
    //     const storeBalanceAfterWithdraw = await contract.utils.getBalance();

    //     assert(storeBalance.eq(ALL_TICKETS.price));
    //     assert(storeBalanceAfterWithdraw.eq(0));
    // });
});
