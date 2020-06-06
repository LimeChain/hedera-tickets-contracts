const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const deployer = new etherlime.EtherlimeGanacheDeployer();

const TicketsStore = require('./../build/TicketsStore');

describe('Tickets Store Contract', () => {

    const OWNER = accounts[0].signer;
    const ALICE = accounts[1].signer;
    const KEVIN = accounts[2].signer;

    let contract;

    const GROUP_ID = 0;
    const OFFERING_DURATION = 24 * 60 * 60 * 7; // 1 week
    const ETHER = ethers.utils.parseEther('1');

    const ALL_TICKETS = {
        price: ethers.utils.parseEther('10'),
        available: 10
    }

    beforeEach(async () => {
        contract = await deployer.deploy(TicketsStore, {}, 5,  OFFERING_DURATION);
    });

    describe('Initialization', function () {
        
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
        describe('Buy on primary market', function () {

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
                assert(group.sellCurve.eq(ALL_TICKETS.price.add(ETHER)));
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
                assert(group.sellCurve.eq(ALL_TICKETS.price.add(ETHER)));
            });

            it('Should buy second ticket on higher price because of the curve', async () => {
                await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price); // Set tickets price to 10 ethers

                await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price }); // Buy for 10 ethers
                const SECOND_TICKET_PRICE = ethers.utils.parseEther('11'); // Provide 11 ethers
                await contract.from(KEVIN).buy(GROUP_ID, { value: SECOND_TICKET_PRICE }); // Buy next ticket for 11 ethers

                
                const kevinTicketPrice = await contract.ticketsOwner(KEVIN.address, GROUP_ID, 0);
                assert(kevinTicketPrice.eq(SECOND_TICKET_PRICE));

                const EXPECTED_WITHDRAWAL_BALANCE = 0; // 0 ethers
                const kevinWithdrawalBalance = await contract.withdrawers(KEVIN.address);
                assert(kevinWithdrawalBalance.eq(EXPECTED_WITHDRAWAL_BALANCE));

                const storeBalance = await contract.withdrawers(contract.contractAddress)
                assert(storeBalance.eq(
                    ALL_TICKETS.price.add(SECOND_TICKET_PRICE)
                ));
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

        describe('Buy on secondary market', function () {

        });
    });

    describe('Resell a ticket', function () {

        const RESELL_PRICE = ethers.utils.parseEther('20');

        it('Should be able to resell a ticket', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price); // Set tickets price to 10 ethers
            await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price }); // Buy for 10 ethers

            await contract.from(ALICE).resell(GROUP_ID, RESELL_PRICE);

            const aliceResellTicketPrice = await contract.resellerPrices(ALICE.address, GROUP_ID, 0);
            assert(aliceResellTicketPrice.eq(RESELL_PRICE));

            const minimalGroupsPrice = await contract.minimalGroupsPrice(GROUP_ID);
            assert(minimalGroupsPrice.reseller == ALICE.address);
            assert(minimalGroupsPrice.minimalPrice.eq(RESELL_PRICE));
        });

        it('Should set group price to the reseller lowest price', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price); // Set tickets price to 10 ethers
            
            await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price }); // Buy for 10 ethers
            await contract.from(KEVIN).buy(GROUP_ID, { value: ALL_TICKETS.price.add(ETHER) }); // Buy next ticket for 11 ethers

            await contract.from(ALICE).resell(GROUP_ID, RESELL_PRICE);
            await contract.from(KEVIN).resell(GROUP_ID, RESELL_PRICE.sub(1)); // Lowest resell price

            const minimalGroupsPrice = await contract.minimalGroupsPrice(GROUP_ID);
            assert(minimalGroupsPrice.reseller == KEVIN.address);
            assert(minimalGroupsPrice.minimalPrice.eq(RESELL_PRICE.sub(1)));
        });

        it('Should throw if one does not own a ticket byt try to resell', async () => {
            await assert.revertWith(
                contract.from(ALICE).resell(GROUP_ID, RESELL_PRICE),
                'No owned tickets'
            );
        });
    });

    describe('Refund a ticket', function () {

        const TICKET_ID = 0;

        it('Should be able to get refund', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price); // Set tickets price to 10 ethers
            await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price });

            await assert.balanceChanged(
                contract.from(ALICE).refund(GROUP_ID, TICKET_ID), 
                ALICE, 
                `${ALL_TICKETS.price}` // Expected refund amount
            );

            // Sell Curve for this group should drop on refund
            const group = await contract.groups(GROUP_ID);
            assert(group.sellCurve.eq(ALL_TICKETS.price));

            const aliceTicketPrice = await contract.ticketsOwner(ALICE.address, GROUP_ID, TICKET_ID);
            assert(aliceTicketPrice.eq(0));
        });

        it('Should throw if one wants to be refunded after offering period', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price); // Set tickets price to 10 ethers
            await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price });

            await utils.timeTravel(deployer.provider, OFFERING_DURATION);

            await assert.revertWith(
                contract.from(ALICE).refund(GROUP_ID, TICKET_ID),
                'Offering has ended'
            );
        });

        it('Should throw if one tries to get refund for tickets he does not own', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price); // Set tickets price to 10 ethers

            await assert.revertWith(
                contract.from(ALICE).refund(GROUP_ID, TICKET_ID),
                'You don\'t own such a ticket'
            );
        });

        it('[RE-ENCTRANCY] Should throw if one tries to get double-refund', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price); // Set tickets price to 10 ethers
            await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price });

            await contract.from(ALICE).refund(GROUP_ID, TICKET_ID);
            await assert.revertWith(
                contract.from(ALICE).refund(GROUP_ID, TICKET_ID),
                'Already refunded'
            );
        });
    });

    describe('Withdraw', function () {
        it('Should be able for a ticket owner to withdraw his money, if more provided', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price); // Set tickets price to 10 ethers

            const HIGHER_PRICE = ethers.utils.parseEther('11'); // Provide 11 ethers
            await contract.from(ALICE).buy(GROUP_ID, { value: HIGHER_PRICE });

            // Alice ticket price is 10 ethers, she pays 11 ether => 1 ether should be withdrawn
            await assert.balanceChanged(contract.from(ALICE).withdraw(), ALICE, `${ETHER}`);
        });

        it('Should be able for contract owner to withdraw tickets store balance', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price); // Set tickets price to 10 ethers
            await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price });

            await assert.balanceChanged(contract.from(OWNER).withdraw(), OWNER, `${ALL_TICKETS.price}`);
        });

        it('[RE-ENTRANCY] Should be not possible to double withdraw', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price); // Set tickets price to 10 ethers
            await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price });

            await contract.from(OWNER).withdraw();
            await assert.balanceChanged(contract.from(OWNER).withdraw(), OWNER, '0');
        });
    });

    describe('The whole flow', function () {

    });
});
