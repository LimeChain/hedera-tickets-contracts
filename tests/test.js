const binaryOrderedList = [];

function add (number) {
    if (binaryOrderedList.length == 0) {
        binaryOrderedList.push(number);
        return void 0;
    }

    let numberIndex = 0;

    let startIndex = 0;
    let splitIndex = Math.floor(binaryOrderedList.length / 2);

    do {
        // if (number == binaryOrderedList[startIndex]) {
        //     // Todo: Add after it
        //     broke;
        // }

        // if (number == binaryOrderedList[splitIndex]) {
        //     // Todo: Add after it
        //     broke;
        // }

        if (number > binaryOrderedList[startIndex] && number < binaryOrderedList[splitIndex]) {
            startIndex++;
            splitIndex = Math.floor(splitIndex / 2);
        } else {
            startIndex = splitIndex;
            splitIndex = binaryOrderedList.length;
        }

    } while (startIndex < splitIndex || startIndex == splitIndex);


}


add(1);
// add(5);
// add(10);
// add(3);
// add(13);
// add(7);
// add(6);
// add(9);
// add(15);
// add(2);
// add(13);
// add(4);
