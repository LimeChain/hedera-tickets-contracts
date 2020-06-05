const etherlime = require('etherlime-lib');
const deployer = new etherlime.EtherlimeGanacheDeployer();

const LinkedList = require('./../build/LinkedList');
const LinkedListContract = require('./../build/LinkedListContract');

describe('Linked List', function () {

    this.timeout(1000000)

    const OWNER = accounts[0].signer;

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

    it('Should order combinations of unique elements', async () => {
        const variants = [
            [1, 5, 3],
            [1, 3, 5],
            [3, 1, 5],
            [3, 5, 1],
            [5, 1, 3],
            [5, 3, 1]
        ]

        for (let i = 0; i < variants.length; i++) {
            await deployContract();

            for (let j = 0; j < variants[i].length; j++) {
                await contract.add(variants[i][j]);
            }

            const node1 = await contract.getNodeAt(1);
            const node2 = await contract.getNodeAt(3);
            const node3 = await contract.getNodeAt(5);

            assert(node1[0].eq(1)); // Node value
            assert(node1[1].eq(1)); // Node prev
            assert(node1[2].eq(3)); // Node next


            assert(node2[0].eq(3)); // Node value
            assert(node2[1].eq(1)); // Node prev
            assert(node2[2].eq(5)); // Node next

            assert(node3[0].eq(5)); // Node value
            assert(node3[1].eq(3)); // Node prev
            assert(node3[2].eq(5)); // Node next
        }
    });

    it('Should 1000 unique order elements', async () => {
        const elements = [
            22428, 22555, 31563, 35518, 50367, 52245, 70778, 79324, 80171, 84026,
            48598, 31430, 21059, 96842, 85917, 34911, 31529, 85137, 87771, 34268,
            33152, 75102, 19730, 38455, 75862, 43536, 31500, 66698, 54764, 82321,
            33815, 52513, 5916, 48836, 81000, 74599, 38201, 63077, 42972, 60360,
            60674, 1722, 89669, 82852, 74116, 9978, 92508, 84494, 48572, 78578,
            83269, 81534, 62400, 8414, 99132, 82267, 38774, 35103, 71969, 36109,
            39386, 93823, 95690, 88695, 9039, 88003, 78883, 97174, 34973, 70597,
            23261, 8114, 10261, 67715, 54645, 62748, 28556, 60434, 85102, 6012,
            13925, 31237, 61303, 17126, 24800, 57086, 13704, 65483, 48296, 89763,
            23428, 64121, 47992, 57834, 24845, 77831, 16881, 74479, 45223, 16398,
            74565, 2286, 54816, 32039, 72716, 94932, 9433, 81718, 72300, 78505,
            22295, 23198, 19589, 97598, 37636, 72860, 49421, 55044, 75969, 17045,
            29025, 94995, 41378, 21723, 91320, 99242, 46185, 5691, 7397, 81237,
            18067, 2895, 90086, 78657, 36321, 51694, 94276, 96355, 69919, 59997,
            85646, 34274, 51808, 17034, 43025, 41933, 43626, 24912, 73082, 64297,
            23081, 3055, 66068, 85921, 90699, 27084, 20141, 6218, 34615, 88072,
            88, 1086, 12377, 90530, 93586, 70335, 57874, 9095, 13005, 41753,
            65619, 12089, 99317, 1250, 40492, 42897, 17313, 63276, 66368, 39163,
            86948, 70053, 72661, 21127, 35535, 54285, 98201, 13040, 60846, 64010,
            36215, 70154, 66883, 39353, 82645, 48397, 26477, 89758, 85688, 79164,
            68938, 42634, 15493, 61223, 85999, 95306, 81372, 14409, 39970, 37016,
            63719, 93863, 33412, 49333, 1084, 99115, 87303, 74395, 51062, 10013,
            11539, 37916, 74440, 71091, 27739, 4517, 74495, 92723, 42271, 78120,
            64869, 41193, 78523, 37689, 78246, 97026, 5845, 15388, 51293, 42099,
            90232, 91662, 96589, 90501, 8999, 77048, 47347, 71818, 50226, 94244,
            47636, 87285, 21546, 62344, 2469, 14622, 797, 81239, 48688, 72106,
            42940, 44412, 13069, 44579, 49135, 84686, 83251, 54181, 85115, 97466,
            47440, 88418, 85837, 72495, 75338, 31435, 47726, 19780, 11179, 54944,
            58288, 36354, 10715, 82204, 95783, 89997, 58755, 39790, 73813, 66210,
            13177, 26698, 20016, 10553, 10468, 12979, 35504, 95219, 81964, 93091,
            27628, 15976, 49883, 83038, 14046, 7085, 27973, 61564, 33038, 7954,
            17035, 69970, 76391, 32923, 81626, 98824, 29523, 45349, 59738, 68466,
            1675, 40646, 58244, 2405, 41088, 94370, 88677, 92745, 639, 23406,
            52168, 44106, 12580, 40617, 94656, 41374, 1140, 7333, 15645, 89684,
            38212, 14263, 19511, 97303, 89805, 20407, 33563, 4875, 90837, 99364,
            64654, 8278, 39536, 73205, 55607, 46366, 60639, 23151, 69878, 10724,
            76771, 74317, 72648, 14489, 50994, 80868, 31600, 46510, 13621, 23251,
            34261, 99150, 50992, 77614, 2351, 10455, 9614, 32074, 64573, 23381,
            85907, 65318, 16669, 45178, 28741, 45924, 74327, 57804, 69595, 3542,
            7711, 39322, 70314, 40124, 49559, 81302, 91281, 48577, 5866, 1257,
            27839, 53288, 6998, 2436, 66618, 9517, 97960, 88560, 51751, 55805,
            42542, 96981, 51492, 46900, 3365, 5204, 23681, 98430, 43527, 35724,
            29365, 90323, 72931, 48490, 40881, 11110, 71146, 41976, 4751, 76104,
            86084, 28231, 39463, 55026, 96725, 60318, 47272, 37202, 96357, 64837,
            27958, 11152, 83412, 17875, 2467, 90212, 15255, 39116, 21349, 29342,
            42286, 13668, 64576, 62386, 15732, 2219, 34533, 81164, 95132, 73555,
            57746, 68832, 17278, 180, 8215, 28443, 82218, 79773, 20722, 98190,
            62423, 558, 69701, 83446, 96478, 27029, 35418, 2660, 97747, 8432,
            48222, 51518, 18652, 97363, 86901, 28946, 11109, 85763, 41158, 15683,
            85340, 93811, 64640, 11824, 54547, 9754, 55895, 3139, 91723, 38308,
            64926, 54061, 41016, 47582, 35419, 45118, 45545, 41117, 49664, 32873,
            73526, 39630, 69648, 49165, 84416, 28781, 90345, 39412, 98380, 53195,
            44094, 18494, 39275, 43391, 73356, 41258, 49752, 52378, 21503, 79121,
            84379, 21931, 93806, 49045, 75375, 42724, 96079, 67485, 16063, 50267,
            42558, 54672, 546, 73371, 60312, 68340, 24694, 51688, 18443, 53643,
            17650, 88145, 50690, 12118, 85510, 73305, 15068, 3642, 13541, 72953,
            64368, 80973, 62741, 2101, 91642, 8659, 70853, 83696, 31317, 54206,
            22841, 48185, 75705, 43816, 28359, 75636, 25824, 85681, 34360, 85001,
            96559, 84336, 4514, 55399, 59332, 62175, 73629, 4858, 69149, 62972,
            742, 94336, 19827, 3302, 55942, 67645, 36954, 42031, 47214, 72960,
            93807, 87046, 4905, 5370, 22636, 96088, 6451, 87770, 47897, 72595,
            20717, 99501, 83589, 11946, 28354, 90591, 96063, 23958, 68478, 57872,
            85551, 81826, 41731, 29366, 62119, 88495, 61357, 64478, 15727, 59885,
            51988, 85400, 29058, 15396, 62014, 26065, 5439, 28459, 54940, 32531,
            96847, 39315, 74102, 88917, 17696, 18974, 41705, 99887, 14657, 77001,
            83905, 12961, 72043, 41128, 52162, 14910, 71526, 66964, 49221, 63755,
            843, 68516, 79821, 11508, 94091, 91284, 62578, 46375, 14128, 68075,
            27569, 73865, 23525, 63489, 22426, 58034, 36649, 93159, 12189, 47427,
            70912, 32592, 98116, 51594, 74256, 2078, 85378, 61730, 60351, 19293,
            26320, 8389, 65886, 67911, 47594, 40363, 13696, 19131, 26134, 19324,
            12613, 90843, 2762, 57980, 36113, 23649, 39437, 22201, 47774, 37098,
            89676, 74002, 81640, 90009, 72944, 53320, 20392, 120, 54604, 75542,
            88907, 37914, 91294, 86208, 4254, 32577, 93786, 70606, 50868, 44113,
            75531, 98160, 73798, 67988, 22901, 36330, 79642, 98443, 85563, 22401,
            44389, 98958, 88100, 78964, 97596, 66790, 69316, 64660, 96989, 219,
            82638, 81172, 85182, 69699, 64991, 37714, 44921, 68580, 16944, 97656,
            31528, 20360, 83383, 77176, 86175, 12550, 14542, 39526, 4002, 55234,
            81548, 38730, 57819, 65193, 11272, 47381, 33792, 42066, 61211, 41018,
            2330, 82229, 68236, 38653, 33068, 4380, 25513, 52931, 74309, 32385,
            19691, 15736, 18100, 85778, 12537, 42976, 14973, 4552, 28936, 35522,
            89173, 61398, 55918, 90484, 36669, 36232, 933, 23788, 49720, 28172,
            63626, 14030, 53827, 61795, 54085, 41091, 74937, 50394, 39405, 23336,
            38709, 57171, 29556, 48671, 28582, 18217, 16852, 10109, 2476, 32211,
            88706, 79184, 51229, 72170, 36663, 95661, 46397, 60791, 40926, 78373,
            41528, 82274, 61551, 54053, 7321, 88511, 24033, 36693, 15618, 33515,
            34452, 12944, 71162, 12386, 91008, 93979, 5534, 86270, 97300, 30269,
            2618, 21031, 54187, 64462, 78409, 80326, 79787, 70513, 34796, 23440,
            53026, 88939, 46058, 99108, 8459, 65054, 44212, 35405, 28858, 8422,
            14460, 16345, 39453, 39485, 71937, 12181, 74404, 89740, 78462, 30330,
            83906, 92842, 40160, 5098, 61700, 72311, 5736, 50130, 26388, 58720,
            97819, 9171, 43574, 71042, 74664, 96538, 19286, 21977, 1673, 54034,
            48120, 82082, 56954, 49360, 19080, 40513, 70562, 34217, 32034, 7488,
            32529, 76075, 69846, 27814, 96697, 70259, 84165, 45724, 24491, 85826,
            96945, 33911, 92700, 2611, 6847, 24614, 63188, 26536, 94989, 65153,
            40388, 65722, 12705, 93144, 96924, 74469, 92512, 15714, 16678, 32261,
            67169, 57908, 26046, 31201, 2008, 27486, 3143, 75106, 71114, 24267,
            96040, 86855, 90190, 86867, 90018, 63687, 90120, 22096, 66625, 43377,
            3781, 87500, 66623, 36547, 97316, 96708, 53137, 78401, 20729, 910,
            18216, 22394, 21703, 53988, 91721, 72557, 53402, 49812, 57635, 13885,
            40290, 37592, 84931, 44399, 81997, 27869, 7168, 56831, 17725, 21526,
        ];

        for (let i = 0; i < elements.length; i++) {
            process.stdout.write(`Uploading elements: ${Math.floor(i * 100 / (elements.length))}%\r`)
            await contract.add(elements[i]);
        }


        let nodePosition = await contract.getHead();
        elements.sort(function (a, b) { return a - b });
        assert(nodePosition.eq(elements[0]));

        for (let i = 0; i < elements.length; i++) {
            const result = await contract.getNodeAt(nodePosition);

            nodePosition = result[2]; // Next node

            assert(elements[i] == result[0]);
        }
    });

    it('Should order duplicate elements', async () => {
        const elements = [1, 5, 3, 5, 1, 3];

        for (let i = 0; i < elements.length; i++) {
            await contract.add(elements[i]);
        }

        const node1 = await contract.getNodeAt(1);
        const node2 = await contract.getNodeAt(3);
        const node3 = await contract.getNodeAt(5);

        assert(node1[0].eq(1)); // Node value
        assert(node1[1].eq(1)); // Node prev
        assert(node1[2].eq(3)); // Node next

        assert(node2[0].eq(3)); // Node value
        assert(node2[1].eq(1)); // Node prev
        assert(node2[2].eq(5)); // Node next

        assert(node3[0].eq(5)); // Node value
        assert(node3[1].eq(3)); // Node prev
        assert(node3[2].eq(5)); // Node next

        const node1ResellersData = await contract.getNodeResellersData(1);
        const node2ResellersData = await contract.getNodeResellersData(3);
        const node3ResellersData = await contract.getNodeResellersData(5);

        assert(node1ResellersData[0].eq(0)); // Index of first reseller
        assert(node1ResellersData[1].eq(2)); // Length of resellers list

        assert(node2ResellersData[0].eq(0)); // Index of first reseller
        assert(node2ResellersData[1].eq(2)); // Length of resellers list

        assert(node3ResellersData[0].eq(0)); // Index of first reseller
        assert(node3ResellersData[1].eq(2)); // Length of resellers list

        // First resellers
        for (let i = 0; i < 3; i++) {
            const reseller = await contract.getFirstReseller(elements[i]);
            assert(reseller == OWNER.address); // Reseller address
        }
    });

    it('Should set head node properly', async () => {
        const elements = [1, 5, 3];
        for (let i = 0; i < elements.length; i++) {
            await contract.add(elements[i]);
        }

        const headNodeValue = await contract.getHead();
        assert(headNodeValue.eq(1));
    });

    it('Should set mid node properly', async () => {
        const elements = [1, 5, 3];
        for (let i = 0; i < elements.length; i++) {
            await contract.add(elements[i]);
        }

        const midNodeValue = await contract.getMidNode();
        assert(midNodeValue.eq(3));
    });

    it('Should pop head and move to next node', async () => {
        const elements = [1, 5, 3];
        for (let i = 0; i < elements.length; i++) {
            await contract.add(elements[i]);
        }

        await contract.popHead();
        const head = await contract.getHead();
        const headNode = await contract.getNodeAt(head.toString());

        assert(headNode[0].eq(3)); // Node value
        assert(headNode[1].eq(3)); // Node prev
        assert(headNode[2].eq(5)); // Node next
    });

    it('Should pop head and stay in current node', async () => {
        const elements = [1, 5, 3, 1];
        for (let i = 0; i < elements.length; i++) {
            await contract.add(elements[i]);
        }

        await contract.popHead();
        const head = await contract.getHead();

        assert(head == 1); // Node value
    });

    it('Should move midNode correctly once head had been popped', async () => {
        const elements = [1, 5, 3, 4];
        for (let i = 0; i < elements.length; i++) {
            await contract.add(elements[i]);
        }

        await contract.popHead();
        const midNode = await contract.getMidNode();

        assert(midNode.eq(4));
    });
});
