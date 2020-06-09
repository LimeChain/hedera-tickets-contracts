const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const deployer = new etherlime.EtherlimeGanacheDeployer();

const ResellersList = require('./../build/ResellersList');
const TicketsStore = require('./../build/TicketsStore');

describe('Tickets Store Contract', () => {

    const OWNER = accounts[0].signer;
    const ALICE = accounts[1].signer;
    const KEVIN = accounts[2].signer;

    const COMMISSION = 25; // 25 %
    const OFFERING_DURATION = 24 * 60 * 60 * 7; // 1 week

    let contract;

    const GROUP_ID = 0;
    const TICKET_ID = 0;

    const ETHER = ethers.utils.parseEther('1');

    const ALL_TICKETS = {
        price: ethers.utils.parseEther('10'),
        increase: ethers.utils.parseEther('0.25'),
        available: 100
    }

    beforeEach(async () => {
        // contract = await deployer.deploy(TicketsStore, { LinkedList: (await deployer.deploy(LinkedList)).contractAddress }, COMMISSION, OFFERING_DURATION);
        contract = await deployer.deploy(TicketsStore, {}, COMMISSION, OFFERING_DURATION);
    });

    describe('Initialization', function () {
        it('Should deploy the contract with correct parameters', async () => {
            const FIVE_MINUTES_LATER = (await utils.latestTimestamp(deployer.provider)) + 5 * 60;
            await utils.setTimeTo(deployer.provider, FIVE_MINUTES_LATER);

            const TIME_NOW = await utils.latestTimestamp(deployer.provider);
            contract = await deployer.deploy(TicketsStore, {}, COMMISSION, OFFERING_DURATION);

            const commission = await contract.eventCommission();
            const offeringExpiration = await contract.offeringExpiration();

            assert(commission.eq(25));
            assert(offeringExpiration.eq(TIME_NOW + OFFERING_DURATION));
        });
    });

    describe('Define Group', function () {
        it('Should add ticket groups', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase);

            const definedTickets = await contract.groups(0);

            assert(definedTickets.bought.eq(1));
            assert(definedTickets.price.eq(ALL_TICKETS.price));
            assert(definedTickets.total.eq(ALL_TICKETS.available + 1));

            assert(definedTickets.sellCurve.eq(ALL_TICKETS.price));
            assert(definedTickets.increase.eq(ALL_TICKETS.increase));
            assert(definedTickets.ratio.eq(ALL_TICKETS.increase.div(ALL_TICKETS.available)));

            assert(definedTickets.resellers != 0x0);
        });

        it('Should throw if non-owner try to set a new group', async () => {
            await assert.revertWith(
                contract.from(ALICE).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase),
                'Ownable: caller is not the owner'
            );
        });

        it('Should throw a ticket group has been already defined', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase);

            await assert.revertWith(
                contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase),
                'Such a group already exists'
            );
        });

        it('Should throw if number of available tickets is zero', async () => {
            await assert.revertWith(
                contract.from(OWNER).defineGroup(0, ALL_TICKETS.price, ALL_TICKETS.increase),
                'Number of available tickets should be at least 1'
            );
        });

    });

    describe('Buy a ticket', function () {

        it('Should throw if one tries to buy ticket after offering period', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase);

            const DAY = 24 * 24 * 60;
            await utils.timeTravel(deployer.provider, OFFERING_DURATION + DAY);

            await assert.revertWith(
                contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price }),
                'Offering has ended'
            );
        });

        it('Should throw if wrong group id provided', async () => {
            await assert.revertWith(
                contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price }),
                'Such tickets group does not exist'
            );
        });

        describe('Buy on primary market', function () {

            it('Should buy a ticket', async () => {
                await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase);

                await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price });

                const aliceTicketPrice = await contract.ticketsOwner(ALICE.address, GROUP_ID, 0);
                assert(aliceTicketPrice.eq(ALL_TICKETS.price));

                const storeBalance = await contract.withdrawers(contract.contractAddress)
                assert(storeBalance.eq(ALL_TICKETS.price));

                const contractBalance = await contract.utils.getBalance();
                assert(contractBalance.eq(ALL_TICKETS.price));

                const group = await contract.groups(GROUP_ID);
                assert(group.bought.eq(2));
                assert(group.sellCurve.eq(ALL_TICKETS.price.add(ALL_TICKETS.increase)));
            });

            it('Should buy a ticket by providing higher price', async () => {
                await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase); // Set tickets price to 10 ethers

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
                assert(group.bought.eq(2));
                assert(group.sellCurve.eq(ALL_TICKETS.price.add(ALL_TICKETS.increase)));
            });

            it('Should buy second ticket on higher price because of the curve', async () => {
                await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase); // Set tickets price to 10 ethers

                await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price }); // Buy for 10 ethers
                const SECOND_TICKET_PRICE = ALL_TICKETS.price.add(ALL_TICKETS.increase); // Provide 10.25 ethers
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

            it('Should throw if not enough money provided', async () => {
                await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase);

                await assert.revertWith(
                    contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price.div(2) }),
                    'Not enough money'
                );
            });

            it('Should throw if there are not any tickets left', async () => {
                await contract.from(OWNER).defineGroup(1, ALL_TICKETS.price, ALL_TICKETS.increase);
                await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price });

                await assert.revertWith(
                    contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price.add(ALL_TICKETS.increase) }),
                    'There are not any left tickets'
                );
            });
        });

        describe('Buy on secondary market', function () {

            it('Should buy a ticket', async () => {
                await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase); // Set tickets price to 10 ethers
                await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price }); // Buy for 10 ethers

                // Check sell curve has upped
                let group = await contract.groups(GROUP_ID);
                assert(group.sellCurve.eq(ALL_TICKETS.price.add(ALL_TICKETS.increase)));

                await contract.from(ALICE).resell(GROUP_ID, TICKET_ID, ALL_TICKETS.price);
                await contract.from(KEVIN).buy(GROUP_ID, { value: ALL_TICKETS.price }); // Buy Alice ticket for 10 ethers

                // Check buyer has a ticket
                const kevinTicketPrice = await contract.ticketsOwner(KEVIN.address, GROUP_ID, TICKET_ID);
                assert(kevinTicketPrice.eq(ALL_TICKETS.price));

                // Check if reseller has resell successfully
                const aliceTicket = await contract.ticketsOwner(ALICE.address, GROUP_ID, TICKET_ID);
                assert(aliceTicket.eq(0));

                const aliceTicketsForResell = await contract.ticketsForResell(ALICE.address, GROUP_ID);
                assert(aliceTicketsForResell.resellPrice.eq(0));

                const ORG_COMMISSION = ALL_TICKETS.price.mul(COMMISSION).div(100);
                const expectedAliceBalance = ALL_TICKETS.price.sub(ORG_COMMISSION); // 8.5 ethers
                const aliceWithdrawBalance = await contract.withdrawers(ALICE.address);
                assert(aliceWithdrawBalance.eq(expectedAliceBalance));

                // Check if organization has got commission percentage
                const orgWithdrawBalance = await contract.withdrawers(contract.contractAddress);
                assert(orgWithdrawBalance.eq(ORG_COMMISSION.add(ALL_TICKETS.price))); // 12,5 ethers

                const resellersListAddress = (await contract.groups(GROUP_ID)).resellers;
                const resellerListContract = await etherlime.ContractAt(ResellersList, resellersListAddress);
                const listHead = await resellerListContract.getHead();
                assert(listHead == 0); // Alice has been popped successfully

                // Check if sell curve has dropped
                group = await contract.groups(GROUP_ID);
                assert(ethers.utils.formatEther(group.ratio).toString().substr(0, 5) == '0.004'); // Drop with 0,004 ethers
                assert(group.sellCurve.eq(ALL_TICKETS.price.add(ALL_TICKETS.increase).sub(group.ratio).toString()));
            });

            it('Should buy a ticket by providing higher price', async () => {
                await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase); // Set tickets price to 10 ethers
                await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price }); // Buy for 10 ethers

                await contract.from(ALICE).resell(GROUP_ID, TICKET_ID, ALL_TICKETS.price);
                await contract.from(KEVIN).buy(GROUP_ID, { value: ALL_TICKETS.price.add(ETHER) }); // Buy Alice ticket for 11 ethers


                // Check if reseller has resell successfully
                const ORG_COMMISSION = ALL_TICKETS.price.mul(COMMISSION).div(100);
                const expectedAliceBalance = ALL_TICKETS.price.sub(ORG_COMMISSION); // 8.5 ethers
                const aliceWithdrawBalance = await contract.withdrawers(ALICE.address);
                assert(aliceWithdrawBalance.eq(expectedAliceBalance));

                // Check if organization has got commission percentage
                const orgWithdrawBalance = await contract.withdrawers(contract.contractAddress);
                assert(orgWithdrawBalance.eq(ORG_COMMISSION.add(ALL_TICKETS.price))); // 12,5 ethers

                // Check buyer withdraw balance
                const kevinWithdrawBalance = await contract.withdrawers(KEVIN.address);
                assert(kevinWithdrawBalance.eq(ETHER)); // 1 ether
            });

            it('Should throw if not enough money provided', async () => {
                await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase); // Set tickets price to 10 ethers
                await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price }); // Buy for 10 ethers

                await contract.from(ALICE).resell(GROUP_ID, TICKET_ID, ALL_TICKETS.price);

                await assert.revertWith(
                    contract.from(KEVIN).buy(GROUP_ID, { value: ETHER }), // Buy Alice ticket for 1 ethers
                    'Not enough money'
                );
            });
        });
    });

    describe('Resell a ticket', function () {

        const RESELL_PRICE = ethers.utils.parseEther('20');

        it('Should be able to resell a ticket', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase); // Set tickets price to 10 ethers
            await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price }); // Buy for 10 ethers

            await contract.from(ALICE).resell(GROUP_ID, TICKET_ID, RESELL_PRICE);

            const ticketForResell = await contract.ticketsForResell(ALICE.address, GROUP_ID);
            assert(ticketForResell.id.eq(TICKET_ID));
            assert(ticketForResell.boughtPrice.eq(ALL_TICKETS.price));
            assert(ticketForResell.resellPrice.eq(RESELL_PRICE));

            const resellersListAddress = (await contract.groups(GROUP_ID)).resellers;
            const resellerListContract = await etherlime.ContractAt(ResellersList, resellersListAddress);

            const listHead = await resellerListContract.getHead();
            const firstReseller = await resellerListContract.getFirstReseller(listHead.toString());

            assert(listHead.eq(RESELL_PRICE));
            assert(firstReseller == ALICE.address);
        });

        it('Should keep actual boughtPrice in case one provides more money', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase); // Set tickets price to 10 ethers
            await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price.add(ETHER) }); // Buy for 11 ethers

            await contract.from(ALICE).resell(GROUP_ID, TICKET_ID, RESELL_PRICE);

            const ticketForResell = await contract.ticketsForResell(ALICE.address, GROUP_ID);
            assert(ticketForResell.boughtPrice.eq(ALL_TICKETS.price));
        });

        it('Should throw if one try to resell a ticket he has not bought', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase); // Set tickets price to 10 ethers
            await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price }); // Buy for 10 ethers

            await assert.revert(
                contract.from(ALICE).resell(GROUP_ID, TICKET_ID + 1, RESELL_PRICE)
            );
        });

        it('Should throw if one tries to resell ticket', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase); // Set tickets price to 10 ethers
            await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price }); // Buy for 10 ethers

            await contract.from(ALICE).resell(GROUP_ID, TICKET_ID, ALL_TICKETS.price);
            await contract.from(KEVIN).buy(GROUP_ID, { value: ALL_TICKETS.price }); // Buy Alice ticket for 10 ethers

            await assert.revertWith(
                contract.from(ALICE).resell(GROUP_ID, TICKET_ID, RESELL_PRICE),
                'You are not able to resell a ticket you don\'t own'
            );
        });

        it('Should throw if a reseller tries to resell several tickets at the time for the same group', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase); // Set tickets price to 10 ethers
            await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price }); // Buy for 11 ethers

            await contract.from(ALICE).resell(GROUP_ID, TICKET_ID, RESELL_PRICE);

            await assert.revertWith(
                contract.from(ALICE).resell(GROUP_ID, TICKET_ID, RESELL_PRICE),
                'Only one ticket for resell per group at a time'
            );
        });
    });

    describe('Refund a ticket', function () {

        const TICKET_ID = 0;

        it('Should be able to get refund', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase); // Set tickets price to 10 ethers
            await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price });

            await assert.balanceChanged(
                contract.from(ALICE).refund(GROUP_ID, TICKET_ID),
                ALICE,
                `${ALL_TICKETS.price}` // Expected refund amount
            );

            // Sell Curve for this group should drop on refund
            const group = await contract.groups(GROUP_ID);
            assert(ethers.utils.formatEther(group.ratio).toString().substr(0, 5) == '0.004'); // Drop with 0,004 ethers
            assert(group.sellCurve.eq(ALL_TICKETS.price.add(ALL_TICKETS.increase).sub(group.ratio)));

            const aliceTicketPrice = await contract.ticketsOwner(ALICE.address, GROUP_ID, TICKET_ID);
            assert(aliceTicketPrice.eq(0));
        });

        it('Should throw if one wants to be refunded after offering period', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase); // Set tickets price to 10 ethers
            await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price });

            const DAY = 60 * 60 * 24;
            await utils.timeTravel(deployer.provider, OFFERING_DURATION + DAY);

            await assert.revertWith(
                contract.from(ALICE).refund(GROUP_ID, TICKET_ID),
                'Offering has ended'
            );
        });

        it('Should throw if one tries to get refund for tickets he does not own', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase); // Set tickets price to 10 ethers

            await assert.revertWith(
                contract.from(ALICE).refund(GROUP_ID, TICKET_ID),
                'You don\'t own such a ticket'
            );
        });

        it('[RE-ENCTRANCY] Should throw if one tries to get double-refund', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase); // Set tickets price to 10 ethers
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
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase); // Set tickets price to 10 ethers

            const HIGHER_PRICE = ethers.utils.parseEther('11'); // Provide 11 ethers
            await contract.from(ALICE).buy(GROUP_ID, { value: HIGHER_PRICE });

            // Alice ticket price is 10 ethers, she pays 11 ether => 1 ether should be withdrawn
            await assert.balanceChanged(contract.from(ALICE).withdraw(), ALICE, `${ETHER}`);
        });

        it('Should be able for contract owner to withdraw tickets store balance', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase); // Set tickets price to 10 ethers
            await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price });

            await assert.balanceChanged(contract.from(OWNER).withdraw(), OWNER, `${ALL_TICKETS.price}`);
        });

        it('[RE-ENTRANCY] Should be not possible to double withdraw', async () => {
            await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase); // Set tickets price to 10 ethers
            await contract.from(ALICE).buy(GROUP_ID, { value: ALL_TICKETS.price });

            await contract.from(OWNER).withdraw();
            await assert.balanceChanged(contract.from(OWNER).withdraw(), OWNER, '0');
        });
    });

    describe('Simulator', function () {

    });
});
