const STATE = {
    MIN: 0,
    MID: 0,
    MAX: 0,
};

let length = 0;
const MEMORY = {};

function add (number) {
    if (length == 0) {
        MEMORY[number] = {
            number,
            mid: number,
        }

        length++;
        STATE.MIN = number;
        STATE.MID = number;
        STATE.MAX = number;

        return void 0;
    }

    if (STATE.MIN > number) {
        length++;
        onStart(number);

        return void 0;
    }

    if (STATE.MAX < number) {
        length++;
        onEnd(number);

        return void 0;
    }

    addOnMiddle(number, STATE.MID);
}

function onEnd (number) {
    MEMORY[number] = {
        number,
        mid: number,
    }

    MEMORY[STATE.MAX].next = number;
    STATE.MAX = number;
}

function onStart (number) {
    MEMORY[number] = {
        number
    }

    MEMORY[STATE.MIN].next = number;
    STATE.MIN = number;
}

function addOnMiddle (number, mid) {
    // Search in first mid
    if (mid > number) {
        addOnMiddle(number, mid.prevMid);
    } else if (mid < number) { // Search in second mid
        addOnMiddle(number, mid.nextMid);
    } else {

    }
}

add(1);
add(5);
add(3);

console.log(MEMORY);