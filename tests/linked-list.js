const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const deployer = new etherlime.EtherlimeGanacheDeployer();

const LinkedList = require('./../build/LinkedList');
const LinkedListContract = require('./../build/LinkedContract');

describe('Linked List', function () {

    this.timeout(20000)

    let contract;

    async function deployContract () {
        const library = await deployer.deploy(LinkedList);

        const libraries = {
            LinkedList: library.contractAddress
        };
        contract = await deployer.deploy(LinkedListContract, libraries);
    }

    beforeEach(async () => {
        await deployContract();
    });

    it('Should order few elements', async () => {
        const elements = [1, 5, 3];
        for (let i = 0; i < elements.length; i++) {
            await contract.add(elements[i]);
        }

        const node1 = await contract.getNodeAt(1);
        const node2 = await contract.getNodeAt(3);
        const node3 = await contract.getNodeAt(5);

        assert(node1[0].eq(1)); // Node value
        assert(node1[1].eq(1)); // Node prev
        assert(node1[2].eq(3)); // Node next


        assert(node2[0] == 3); // Node value
        assert(node2[1] == 1); // Node prev
        assert(node2[2] == 5); // Node next

        assert(node3[0].eq(5)); // Node value
        assert(node3[1].eq(3)); // Node prev
        assert(node3[2].eq(5)); // Node next
    });


    it.only('Should order few elements', async () => {
        const variants = [
            // [1, 5, 3],
            // [1, 3, 5],
            // [3, 1, 5],
            // [3, 5, 1],
            [5, 1., 3],
            // [5, 3, 1]
        ]

        for (let i = 0; i < variants.length; i++) {
            await deployContract();

            for (let j = 0; j < variants[i].length; j++) {
                await contract.add(variants[i][j]);
            }

            const node1 = await contract.getNodeAt(1);
            const node2 = await contract.getNodeAt(3);
            const node3 = await contract.getNodeAt(5);

            console.log(node2)
            assert(node1[0].eq(1)); // Node value
            assert(node1[1].eq(1)); // Node prev
            assert(node1[2].eq(3)); // Node next


            assert(node2[0] == 3); // Node value
            assert(node2[1] == 1); // Node prev
            assert(node2[2] == 5); // Node next

            assert(node3[0].eq(5)); // Node value
            assert(node3[1].eq(3)); // Node prev
            assert(node3[2].eq(5)); // Node next
        }
    });

    it('Should order elements', async () => {
        const elements = [
            8605, 8122, 4273, 1755, 1527, 6335, 5926, 9256, 7833, 4897,
            8408, 2806, 5619, 6598, 7807, 9020, 3743, 7061, 9509, 2653,
            3909, 897, 7084, 1774, 1299, 3017, 3169, 5924, 7305, 8587,
            6892, 7401, 1566, 1872, 6889, 6199, 4939, 6202, 5957, 7586,
            3645, 3023, 4031, 9973, 2938, 7849, 786, 9122, 1584, 400,
            8210, 9759, 9698, 285, 2904, 1420, 9849, 7091, 2042, 2885,
            3069, 6344, 6066, 9702, 7138, 8217, 7261, 3265, 8538, 4091,
            3516, 180, 8508, 7934, 8915, 8299, 628, 9864, 7506, 6696,
            4474, 1304, 127, 4575, 4831, 2931, 1044, 422, 6861, 3177,
            256, 6734, 210, 6248, 602, 1737, 7435, 6533, 773, 537
        ];

        for (let i = 0; i < elements.length; i++) {
            await contract.add(elements[i]);
        }

        const headNodeValue = await contract.getHead();
        assert(headNodeValue == 127);

        let nodePosition = 127;
        const sortedElements = elements.sort();
        for (let i = 0; i < sortedElements.length; i++) {
            const result = await contract.getNodeAt(nodePosition);
            nodePosition = result[2]; // Next node

            assert(sortedElements[i] == result[0]);
        }
    });

    it('Should set head node properly', async () => {
        const elements = [1, 5, 3];
        for (let i = 0; i < elements.length; i++) {
            await contract.add(elements[i]);
        }

        const headNodeValue = await contract.getHead();
        assert(headNodeValue == 1);
    });

    it('Should set mid node properly', async () => {
        const elements = [1, 5, 3];
        for (let i = 0; i < elements.length; i++) {
            await contract.add(elements[i]);
        }

        const midNodeValue = await contract.getMidNode();
        assert(midNodeValue == 3);
    });

    it('Should pop head', async () => {
        const elements = [1, 5, 3];
        for (let i = 0; i < elements.length; i++) {
            await contract.add(elements[i]);
        }

        await contract.popHead();
        const newHead = await contract.getNodeAt(0);

        assert(newHead[0] == 3); // Node value
        assert(newHead[0] == 3); // Node prev
        assert(newHead[0] == 5); // Node next
    });
});
