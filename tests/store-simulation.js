const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const deployer = new etherlime.EtherlimeGanacheDeployer();

const ResellersList = require('./../build/ResellersList');
const TicketsStore = require('./../build/TicketsStore');

describe.only('Simulator', function () {

    this.timeout(1000000)

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
        contract = await deployer.deploy(TicketsStore, {}, COMMISSION, OFFERING_DURATION);
    });

    it('Should trace the curve change in case of every second person to be a reseller', async () => {
        await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase);

        let ticketPrice = ALL_TICKETS.price;
        for (let i = 0; i < ALL_TICKETS.available; i++) {
            // Resell with 0.01 units of money less then increase
            const RESELL_PRICE = ticketPrice.add(
                ALL_TICKETS.increase.sub(ethers.utils.parseEther('0.01'))
            )

            await contract.from(ALICE).buy(GROUP_ID, { value: ticketPrice });
            await contract.from(ALICE).resell(GROUP_ID, i, RESELL_PRICE);

            let group = await contract.groups(GROUP_ID);
            await contract.from(KEVIN).buy(GROUP_ID, { value: RESELL_PRICE });

            group = await contract.groups(GROUP_ID);
            console.log('---------------')
            console.log('sellCurve', ethers.utils.formatEther(group.sellCurve.toString()));
            console.log('ratio', ethers.utils.formatEther(group.ratio.toString()))

            assert(group.bought.eq(i + 2));
            assert(group.sellCurve.eq(
                ticketPrice.add(ALL_TICKETS.increase).sub(group.ratio))
            );

            ticketPrice = group.sellCurve;
        }
    });

    it.only('Should trace the curve change in case there are not any resellers', async () => {
        await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase);

        let ticketPrice = ALL_TICKETS.price;
        for (let i = 0; i < ALL_TICKETS.available; i++) {
            await contract.from(ALICE).buy(GROUP_ID, { value: ticketPrice });
            ticketPrice = ticketPrice.add(ALL_TICKETS.increase);
        }

        group = await contract.groups(GROUP_ID);
        assert(group.bought.eq(ALL_TICKETS.available + 1));
        /* 
            Price = 100 * 0.25 + 10 = 35
            total tickets * price increase + primary price = max sell curve increase
        */
        assert(group.sellCurve.eq(
            ALL_TICKETS.increase.mul(ALL_TICKETS.available).add(ALL_TICKETS.price))
        );
    });

    it('Should trace the curve change in case first 50% of bought tickets get resell', async () => {
        await contract.from(OWNER).defineGroup(ALL_TICKETS.available, ALL_TICKETS.price, ALL_TICKETS.increase);

        let ticketPrice = ALL_TICKETS.price;
        for (let i = 0; i < ALL_TICKETS.available; i++) {
            // Resell with 0.01 units of money less then increase
            const RESELL_PRICE = ticketPrice.add(
                ALL_TICKETS.increase.sub(ethers.utils.parseEther('0.01'))
            )

            await contract.from(ALICE).buy(GROUP_ID, { value: ticketPrice });
            await contract.from(ALICE).resell(GROUP_ID, i, RESELL_PRICE);

            let group = await contract.groups(GROUP_ID);
            await contract.from(KEVIN).buy(GROUP_ID, { value: RESELL_PRICE });

            group = await contract.groups(GROUP_ID);
            console.log('---------------')
            console.log('sellCurve', ethers.utils.formatEther(group.sellCurve.toString()));
            console.log('ratio', ethers.utils.formatEther(group.ratio.toString()))

            assert(group.bought.eq(i + 2));
            assert(group.sellCurve.eq(
                ticketPrice.add(ALL_TICKETS.increase).sub(group.ratio))
            );

            ticketPrice = group.sellCurve;
        }
    });
});